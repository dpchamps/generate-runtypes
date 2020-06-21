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
import { format as prettierFormat } from "prettier";
import {equals} from "ramda";

export interface VisitorState {
  output: string;
  namespace: Set<string>;
  shapes: Map<string, [string, Record<string, string>]>;
  changeGraph: Record<string, string>;
}

interface TypeDeclarations {
  schemas: string[];
  staticTypes: string[];
  type?: string;
}

const camelCaseMatcher = /_(.)?/g;
const camelCaseReplacer = (_: unknown, p1: string | undefined) =>
  typeof p1 !== "undefined" ? p1.toUpperCase() : "";

const toProperCase = (input: string) =>
  `${input[0].toUpperCase()}${input.slice(1)}`.replace(
    camelCaseMatcher,
    camelCaseReplacer
  );

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

const extractPropertyName = (objectProperty: NodePath<ObjectProperty>) => {
  const key = objectProperty.get("key");

  if (key.isStringLiteral()) {
    return key.node.value;
  } else if (key.isIdentifier()) {
    return key.node.name;
  }

  throw new Error("Invalid property type");
};

const merge = (
  recordA: Record<string, string>,
  recordB: Record<string, string>
) => {
  const merged: Record<string, string> = {};

  Object.entries(recordA).forEach(([k, v]) => {
    const strippedUnion = v.replace(/^Union\((.+)\)$/, "$1");
    const right = recordB[k];
    merged[k] = v.includes(right) ? v : `Union(${strippedUnion},${right})`;
  });

  return merged;
};

const followChangeGraph = (id: string, graph: Record<string, string>, iterations = 0) : string => {
  if(iterations > 500){
    throw new Error(`Oops, that's crazy!`);
  }

  if(id in graph){
    return followChangeGraph(graph[id], graph, iterations + 1);
  }

  return id;
};

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
      type,
    } = generateCollection(path, state, parentKey);

    return {
      schemas: [...subSchemas.flat()],
      staticTypes: [...subStaticTypes.flat()],
      type,
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
      type,
    } = generateRecord(parentKey || "AnonymousSchema", path, state);

    return {
      schemas: [...subSchemas.flat()],
      staticTypes: [...subStaticTypes.flat()],
      type,
    };
  }

  return { schemas: [], staticTypes: [], type: undefined };
};

const formatRecord = (
  record: Record<string, string | Record<string, string>>,
  changeGraph: Record<string, string>,
  level = 1
): string =>
  "{\n" +
  Object.entries(record).reduce((fmt, [k, v]) => {
    const indentation = Array(level + 1).join(" ");

    /* istanbul ignore else */
    if (typeof v === "string") {
      return `${fmt}${indentation}${k}:${followChangeGraph(v, changeGraph)},\n`;
    }

    //todo: this is not a possible code path *yet*, but I'd rather leave it and have it tested if it ever becomes possible.
    /* istanbul ignore next */
    const nested = formatRecord(v, changeGraph, level + 1);
    /* istanbul ignore next */
    return `${fmt}${indentation}${k}:${nested},\n`;
  }, "") +
  "\n}";

const generateCollection = (
  path: NodePath<ArrayExpression>,
  state: VisitorState,
  parentKey?: string
): TypeDeclarations => {
  const types = new Set();
  const collection: unknown[] = [];

  const schemas: string[] = [];
  const staticTypes: string[] = [];

  for (const el of path.get("elements")) {
    const {
      schemas: subSchemas,
      staticTypes: subStaticTypes,
      type,
    } = extractSchemas(el, state, parentKey);

    if (!type) continue;

    schemas.unshift(...subSchemas);
    staticTypes.unshift(...subStaticTypes);
    types.add(type);
    collection.push(type);
  }

  if (types.size === 0) return { schemas: [], staticTypes: [] };

  const collectionType =
    types.size === 1
      ? `RT.Array(${collection[0]})`
      : `RT.Tuple(${collection.join(", ")})`;

  return { schemas, staticTypes, type: collectionType };
};

const generateRecord = (
  id: string,
  oExp: NodePath<ObjectExpression>,
  state: VisitorState
): TypeDeclarations => {
  const record: Record<string, string> = {};

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

  const recordSignature = Object.keys(record).join(",");

  if (state.shapes.has(recordSignature)) {
    const [existingTypename, existingRecord] = state.shapes.get(
      recordSignature
    )!;

    const merged = merge(existingRecord, record);

    if(equals(existingRecord, merged)){
      return { schemas: [], staticTypes: [], type: existingTypename};
    }

    const newName = toProperCase(id) === existingTypename ? existingTypename : getSafeName(state.namespace,`${toProperCase(id)}${existingTypename}`);

    if(newName !== existingTypename){
      state.changeGraph[existingTypename] = newName;
    }

    state.shapes.set(recordSignature, [newName, merged]);

    return { schemas: [], staticTypes: [], type: newName};
  }

  const typeName = getSafeName(state.namespace, toProperCase(id));

  state.shapes.set(recordSignature, [typeName, record]);

  return { schemas, staticTypes, type: typeName };
};

export const runtypeVisitor: Visitor<VisitorState> = {
  VariableDeclarator(path, state) {
    const id = path.get("id") as NodePath<Identifier>;

    const init = path.get("init");

    if (init.isObjectExpression()) {
      generateRecord(
        id.node.name,
        init,
        state
      );
    }
  },
};

export const formatState = ({ shapes, output, changeGraph }: VisitorState) => {
  const schemas = Array.from(shapes.values()).reduce(
      (output, [typeName, record]) => {
        const ident = followChangeGraph(typeName, changeGraph);
        const schema = `export const ${ident} = RT.Record(${formatRecord(record, changeGraph)});`;
        const type = `export type ${ident} = RT.Static<typeof ${typeName}>;`;

        return `${output}${schema}\n${type}\n\n`;
      },
      ""
  );

  return prettierFormat(output+schemas, {parser: "babel"});
};
