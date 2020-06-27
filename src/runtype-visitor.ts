import { NodePath, Visitor } from "@babel/traverse";
import {
  ArrayExpression,
  Function,
  Identifier,
  isBooleanLiteral,
  isNullLiteral,
  isNumericLiteral,
  isStringLiteral,
  isTemplateLiteral,
  Literal,
  ObjectExpression,
  ObjectProperty,
} from "@babel/types";
import { CompileType } from "./type-creator";
import { Registry } from "./registry";

export interface VisitorState {
  registry: Registry;
}

interface TypeDeclarations {
  compileType?: CompileType;
}

const isValidObjectProp = ({ computed }: ObjectProperty) => !computed;

const getTypeFromFunctionExpression = (_node: Function): TypeDeclarations => ({
  compileType: {
    type: "function",
  },
});

const getTypeFromLiteral = (node: Literal): TypeDeclarations => {
  if (isStringLiteral(node) || isTemplateLiteral(node)) {
    return {
      compileType: {
        type: "string",
      },
    };
  } else if (isNumericLiteral(node)) {
    return {
      compileType: {
        type: "number",
      },
    };
  } else if (isBooleanLiteral(node)) {
    return {
      compileType: {
        type: "boolean",
      },
    };
  } else if (isNullLiteral(node)) {
    return {
      compileType: {
        type: "null",
      },
    };
  } else {
    throw new Error(
      `Encountered an invalid type ${node.type} for type conversion.`
    );
  }
};

const extractPropertyName = (objectProperty: NodePath<ObjectProperty>) => {
  const key = objectProperty.get("key");

  /* istanbul ignore else */
  if (key.isStringLiteral() || key.isNumericLiteral()) {
    return String(key.node.value);
  } else if (key.isIdentifier()) {
    return key.node.name;
  } else {
    throw new Error("Unreachable");
  }
};

const extractSchemas = (
  path: NodePath<any>,
  state: VisitorState,
  parentKey: string
): TypeDeclarations => {
  if (path.isLiteral()) {
    return getTypeFromLiteral(path.node);
  } else if (path.isArrayExpression()) {
    return generateCollection(path, state, parentKey);
  } else if (path.isFunction()) {
    return getTypeFromFunctionExpression(path.node);
  } else if (path.isObjectExpression()) {
    return generateRecord(parentKey, path, state);
  }

  return {};
};

const reduceElements = (
  els: NodePath<any>[],
  state: VisitorState,
  parentKey: string
) =>
  els.reduce<{ types: Set<string>; collection: TypeDeclarations[] }>(
    ({ types, collection }, path) => {
      const { compileType } = extractSchemas(path, state, parentKey);

      if (compileType) {
        types.add(JSON.stringify(compileType));
        collection.push({ compileType });
      }

      return { types, collection };
    },
    { types: new Set(), collection: [] }
  );

const generateCollection = (
  path: NodePath<ArrayExpression>,
  state: VisitorState,
  parentKey: string
): TypeDeclarations => {
  const { types, collection } = reduceElements(
    path.get("elements"),
    state,
    parentKey
  );

  if (collection.length === 0) return {};

  return types.size === 1
    ? {
        compileType: {
          type: "array",
          expr: collection[0].compileType!,
        },
      }
    : {
        compileType: {
          type: "tuple",
          params: collection.map(({ compileType }) => compileType!),
        },
      };
};

const collectRecordFromExpression = (
  oExp: NodePath<ObjectExpression>,
  state: VisitorState
) => {
  const record: Record<string, CompileType> = {};

  oExp.traverse({
    ObjectProperty(path) {
      if (!isValidObjectProp(path.node)) return;
      const key = extractPropertyName(path);
      const value = path.get("value");

      const { compileType } = extractSchemas(value, state, key);

      if (!compileType) return;

      record[key] = compileType!;

      path.skip();
    },
  });

  return { record };
};

const generateRecord = (
  id: string,
  oExp: NodePath<ObjectExpression>,
  state: VisitorState
): TypeDeclarations => {
  const { record } = collectRecordFromExpression(oExp, state);

  const name = state.registry.add(id, record);

  return {
    compileType: {
      type: "ident",
      name,
    },
  };
};

export const runtypeVisitor: Visitor<VisitorState> = {
  VariableDeclarator(path, state) {
    const id = path.get("id") as NodePath<Identifier>;

    const init = path.get("init");

    if (init.isObjectExpression()) {
      generateRecord(id.node.name, init, state);
    }
  },
};
