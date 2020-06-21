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
import {ChangeGraph} from "./change-graph";

export interface VisitorState {
  output: string;
  namespace: Set<string>;
  shapes: Map<string, [string, Record<string, string>]>;
  changeGraph: ChangeGraph;
  astNodes: Node[];
}

interface TypeDeclarations {
  type?: string;
}

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

const extractSchemas = (
  path: NodePath<any>,
  state: VisitorState,
  parentKey?: string
): TypeDeclarations => {
  if (path.isLiteral()) {
    return {
      type: getTypeFromLiteral(path.node),
    };
  } else if (path.isArrayExpression()) {
    const { type } = generateCollection(path, state, parentKey);

    return {
      type,
    };
  } else if (path.isFunction()) {
    return {
      type: getTypeFromFunctionExpression(path.node),
    };
  } else if (path.isObjectExpression()) {
    const { type } = generateRecord(
      parentKey || "AnonymousSchema",
      path,
      state
    );

    return {
      type,
    };
  }

  return { type: undefined };
};

const reduceElements = (els: NodePath<any>[], state: VisitorState, parentKey?: string) => els.reduce<{types: Set<string>, collection: string[]}>(
    ({types, collection}, path) => {
      const {type} = extractSchemas(path, state, parentKey);

      if(type){
        types.add(type);
        collection.push(type);
      }

      return {types, collection};
    },
    {types: new Set(), collection: []}
);

const generateCollection = (
  path: NodePath<ArrayExpression>,
  state: VisitorState,
  parentKey?: string
): TypeDeclarations => {

  const {types, collection} = reduceElements(path.get("elements"), state, parentKey);

  if (types.size === 0) return { type: undefined };

  const collectionType =
    types.size === 1
      ? `RT.Array(${collection[0]})`
      : `RT.Tuple(${collection.join(", ")})`;

  return { type: collectionType };
};

const collectRecordFromExpression = (oExp: NodePath<ObjectExpression>, state: VisitorState) => {
  const record: Record<string, string> = {};

  oExp.traverse({
    ObjectProperty(path) {
      if (!isValidObjectProp(path.node)) return;
      const key = extractPropertyName(path);
      const value = path.get("value");

      const { type } = extractSchemas(value, state, key);

      if (!type) return;

      record[key] = type;

      path.skip();
    },
  });

  return record;
};

const generateRecord = (
  id: string,
  oExp: NodePath<ObjectExpression>,
  state: VisitorState
): TypeDeclarations => {

  const record = collectRecordFromExpression(oExp, state);
  const recordSignature = Object.keys(record).join(",");

  if (state.shapes.has(recordSignature)) {
    const [existingTypename, existingRecord] = state.shapes.get(
      recordSignature
    )!;

    const merged = merge(existingRecord, record);

    if (equals(existingRecord, merged)) {
      return { type: existingTypename };
    }

    const newName =
      toProperCase(id) === existingTypename
        ? existingTypename
        : getSafeName(
            state.namespace,
            `${toProperCase(id)}${existingTypename}`
          );

    if (newName !== existingTypename) {
      state.changeGraph.add(existingTypename, newName)
    }

    state.shapes.set(recordSignature, [newName, merged]);

    return { type: newName };
  }

  const typeName = getSafeName(state.namespace, toProperCase(id));

  state.shapes.set(recordSignature, [typeName, record]);

  return { type: typeName };
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
