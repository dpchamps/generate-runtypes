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
import { zip } from "ramda";
import { format as prettierFormat } from "prettier";

export interface VisitorState {
  output: string;
  namespace: Set<string>;
  shapes: Map<string, string>;
}

interface TypeDeclarations {
  schemas: string[];
  staticTypes: string[];
  recordName: string;
}

const toProperCase = (input: string) =>
  `${input[0].toUpperCase()}${input.slice(1)}`;
const isValidObjectProp = ({ computed }: ObjectProperty) => !computed;

const getTypeFromFunctionExpression = (_node: Function) => `RT.Function`;

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

const getTypeFromLiteral = (node: Literal) => {
  if (isStringLiteral(node) || isTemplateLiteral(node)) {
    return `RT.String`;
  } else if (isNumericLiteral(node)) {
    return `RT.Number`;
  } else if (isBooleanLiteral(node)) {
    return `RT.Boolean`;
  } else if (isNullLiteral(node)) {
    return `RT.Null`;
  } else {
    throw new Error(
      `Encountered an invalid type ${node.type} for type conversion.`
    );
  }
};

const extractPropertyName = (objectProperty : NodePath<ObjectProperty>) => {
  const key = objectProperty.get("key");

  if(key.isStringLiteral()){
    return key.node.value;
  }else if(key.isIdentifier()){
    return key.node.name;
  }

  throw new Error("Invalid property type");
}

const extractSchemas = (
  path: NodePath<any>,
  state: VisitorState,
  parentKey?: string
) => {
  if (path.isLiteral()) {
    return {
      schemas: [],
      staticTypes: [],
      type: getTypeFromLiteral(path.node),
    };
  } else if (path.isArrayExpression()) {
    const {
      schemas: subSchemas,
      staticTypes: subStaticTypes,
      collectionType,
    } = generateCollection(path, state, parentKey);

    return {
      schemas: [...subSchemas.flat()],
      staticTypes: [...subStaticTypes.flat()],
      type: collectionType,
    };
  } else if (path.isFunction()) {
    return {
      schemas: [],
      staticTypes: [],
      type: getTypeFromFunctionExpression(path.node),
    };
  } else if (path.isObjectExpression()) {
    const {
      schemas: subSchemas,
      staticTypes: subStaticTypes,
      recordName: subType,
    } = generateRecord(parentKey || "AnonymousSchema", path, state);

    return {
      schemas: [...subSchemas.flat()],
      staticTypes: [...subStaticTypes.flat()],
      type: subType,
    };
  }

  return { schemas: [], staticTypes: [], type: undefined };
};

const formatRecord = (
  record: Record<string, string | Record<string, string>>,
  level = 1
): string =>
  "{\n" +
  Object.entries(record).reduce((fmt, [k, v]) => {
    const indentation = Array(level + 1).join(" ");

    /* istanbul ignore else */
    if (typeof v === "string") {
      return `${fmt}${indentation}${k}:${v},\n`;
    }

    //todo: this is not a possible code path *yet*, but I'd rather leave it and have it tested if it ever becomes possible.
    /* istanbul ignore next */
    const nested = formatRecord(v, level + 1);
    /* istanbul ignore next */
    return `${fmt}${indentation}${k}:${nested},\n`;
  }, "") +
  "\n}";

const generateCollection = (
  path: NodePath<ArrayExpression>,
  state: VisitorState,
  parentKey?: string
) => {
  const types = new Set();
  const collection: unknown[] = [];

  const schemas: string[] = [];
  const staticTypes: string[] = [];

  for (const el of path.get("elements")) {
    const {schemas: subSchemas, staticTypes: subStaticTypes, type} = extractSchemas(el, state, parentKey);

    if(!type) continue;

    schemas.unshift(...subSchemas);
    staticTypes.unshift(...subStaticTypes);
    types.add(type);
    collection.push(type);
  }

  if(types.size === 0) return {schemas: [], staticTypes: []};

  const collectionType =
    types.size === 1
      ? `RT.Array(${collection[0]})`
      : `RT.Tuple(${collection.join(", ")})`;

  return { schemas, staticTypes, collectionType };
};

const generateRecord = (
  id: string,
  oExp: NodePath<ObjectExpression>,
  state: VisitorState
): TypeDeclarations => {
  const record: Record<string, string> = {};
  const typeName = getSafeName(state.namespace, toProperCase(id));

  const schemas: string[] = [];
  const staticTypes: string[] = [];

  oExp.traverse({
    ObjectProperty(path) {
      if (!isValidObjectProp(path.node)) return;
      const key = extractPropertyName(path);
      const value = path.get("value");

      const {
        schemas: subSchemas,
        staticTypes: subStaticTypes,
        type,
      } = extractSchemas(value, state, key);

      if (!type) return;

      schemas.unshift(...subSchemas);
      staticTypes.unshift(...subStaticTypes);
      record[key] = type;

      path.skip();
    },
  });

  const schema = `RT.Record(${formatRecord(record)});`;
  const type = `RT.Static<typeof ${typeName}>;`

  if (state.shapes.has(schema)) {
    const existingTypename = state.shapes.get(schema)!;

    return { schemas: [], staticTypes: [], recordName: existingTypename };
  }

  state.shapes.set(schema, typeName);
  schemas.push(`export const ${typeName} = ${schema}`);
  staticTypes.push(`export type ${typeName} = ${type}`);

  return { schemas, staticTypes, recordName: typeName };
};

export const runtypeVisitor: Visitor<VisitorState> = {
  VariableDeclarator(path, state) {
    const id = path.get("id") as NodePath<Identifier>;
    const init = path.get("init");

    if (init.isObjectExpression()) {
      const { schemas, staticTypes } = generateRecord(
        id.node.name,
        init,
        state
      );

      state.output += prettierFormat(
        zip(schemas, staticTypes).flat().join("\n"),
        { parser: "babel" }
      );
    }
  },
};
