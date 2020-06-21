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
  Node,
} from "@babel/types";
import { format as prettierFormat } from "prettier";
import { equals } from "ramda";
import { formatRecord, merge, toProperCase } from "./util";
import { ChangeGraph } from "./change-graph";
import { CompileType } from "./type-creator";
import {Registry} from "./registry";

export interface VisitorState {
  output: string;
  namespace: Set<string>;
  shapes: Map<string, [string, Record<string, string>]>;
  changeGraph: ChangeGraph;
  astNodes: Node[];
  registry: Registry;
}

interface TypeDeclarations {
  type?: string;
  compileType?: CompileType;
}

const isValidObjectProp = ({ computed }: ObjectProperty) => !computed;

const getTypeFromFunctionExpression = (_node: Function) : TypeDeclarations => ({
  type: `RT.Function`,
  compileType: {
    type: "function",
  },
});

const getSafeName = (
  namespace: Set<string>,
  baseName: string,
  check = 0
): string => {
  const checkName = check === 0 ? baseName : `${baseName}${check}`;
  const safeName = /^[a-zA-Z]/.test(checkName) ? checkName : `Prop${checkName}`;

  if (namespace.has(safeName))
    return getSafeName(namespace, baseName, Number(check) + 1);

  namespace.add(safeName);

  return safeName;
};

const getTypeFromLiteral = (node: Literal): TypeDeclarations => {
  if (isStringLiteral(node) || isTemplateLiteral(node)) {
    return {
      type: `RT.String`,
      compileType: {
        type: "string",
      },
    };
  } else if (isNumericLiteral(node)) {
    return {
      type: `RT.Number`,
      compileType: {
        type: "number",
      },
    };
  } else if (isBooleanLiteral(node)) {
    return {
      type: `RT.Boolean`,
      compileType: {
        type: "boolean",
      },
    };
  } else if (isNullLiteral(node)) {
    return {
      type: `RT.Null`,
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

  if (key.isStringLiteral()) {
    return key.node.value;
  } else if (key.isIdentifier()) {
    return key.node.name;
  }

  throw new Error("Invalid property type");
};

const extractSchemas = (
  path: NodePath<any>,
  state: VisitorState,
  parentKey?: string
): TypeDeclarations => {
  if (path.isLiteral()) {
    return getTypeFromLiteral(path.node);
  } else if (path.isArrayExpression()) {
    return generateCollection(path, state, parentKey);
  } else if (path.isFunction()) {
    return getTypeFromFunctionExpression(path.node)
  } else if (path.isObjectExpression()) {
    return generateRecord(
      parentKey || "AnonymousSchema",
      path,
      state
    );
  }

  return { type: undefined };
};

const reduceElements = (
  els: NodePath<any>[],
  state: VisitorState,
  parentKey?: string
) =>
  els.reduce<{ types: Set<string>; collection: TypeDeclarations[] }>(
    ({ types, collection }, path) => {
      const { type, compileType } = extractSchemas(path, state, parentKey);

      if (type) {
        types.add(type);
        collection.push({ type, compileType });
      }

      return { types, collection };
    },
    { types: new Set(), collection: [] }
  );

const generateCollection = (
  path: NodePath<ArrayExpression>,
  state: VisitorState,
  parentKey?: string
): TypeDeclarations => {
  const { types, collection } = reduceElements(
    path.get("elements"),
    state,
    parentKey
  );

  if (collection.length === 0) return { type: undefined };

  return types.size === 1
    ? {
        type: `RT.Array(${collection[0].type!})`,
        compileType: {
          type: "array",
          expr: collection[0].compileType!,
        },
      }
    : {
        type: `RT.Tuple(${collection.map(({type}) => type!).join(", ")})`,
        compileType: {
          type: "tuple",
          params: collection.map(({compileType}) => compileType!),
        },
      };
};

const collectRecordFromExpression = (
  oExp: NodePath<ObjectExpression>,
  state: VisitorState
) => {
  const record: Record<string, string> = {};
  const betterRecord : Record<string, CompileType> = {};

  oExp.traverse({
    ObjectProperty(path) {
      if (!isValidObjectProp(path.node)) return;
      const key = extractPropertyName(path);
      const value = path.get("value");

      const { type, compileType } = extractSchemas(value, state, key);

      if (!type) return;

      record[key] = type;
      betterRecord[key] = compileType!;

      path.skip();
    },
  });

  return {record, betterRecord};
};

const generateRecord = (
  id: string,
  oExp: NodePath<ObjectExpression>,
  state: VisitorState
): TypeDeclarations => {
  const {record, betterRecord} = collectRecordFromExpression(oExp, state);

  state.registry.add(id, betterRecord);

  const recordSignature = Object.keys(record).join(",");

  if (state.shapes.has(recordSignature)) {
    const [existingTypename, existingRecord] = state.shapes.get(
      recordSignature
    )!;

    const merged = merge(existingRecord, record);

    if (equals(existingRecord, merged)) {
      return {
        type: existingTypename,
        compileType: {
          type: "ident",
          name: existingTypename
        }
      };
    }

    const newName =
      toProperCase(id) === existingTypename
        ? existingTypename
        : getSafeName(
            state.namespace,
            `${toProperCase(id)}${existingTypename}`
          );

    if (newName !== existingTypename) {
      state.changeGraph.add(existingTypename, newName);
    }

    state.shapes.set(recordSignature, [newName, merged]);

    return {
      type: newName,
      compileType: {
        type: "ident",
        name: newName
      }
    };
  }

  const typeName = getSafeName(state.namespace, toProperCase(id));

  state.shapes.set(recordSignature, [typeName, record]);

  return {
    type: typeName,
    compileType: {
      type: "ident",
      name: typeName
    }
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

export const formatState = ({ shapes, output, changeGraph }: VisitorState) => {
  const schemas = Array.from(shapes.values()).reduce(
    (output, [typeName, record]) => {
      const ident = changeGraph.resolve(typeName);
      const schema = `export const ${ident} = RT.Record(${formatRecord(
        record,
        changeGraph
      )});`;
      const type = `export type ${ident} = RT.Static<typeof ${typeName}>;`;

      return `${output}${schema}\n${type}\n\n`;
    },
    ""
  );

  return prettierFormat(output + schemas, { parser: "babel" });
};
