import * as Types from "@babel/types";
import {
  Expression,
  SpreadElement,
  JSXNamespacedName,
  ArgumentPlaceholder,
  Identifier,
  CallExpression,
} from "@babel/types";

type Expr =
  | Expression
  | SpreadElement
  | JSXNamespacedName
  | ArgumentPlaceholder;

const createIdentifier = (name: string) => Types.identifier(name);

const createCallExpression = (name: string, ...params: Expr[]) =>
  Types.callExpression(createIdentifier(name), params);

export const createString = () => createIdentifier("RT.String");

export const createNumber = () => createIdentifier("RT.Number");

export const createNull = () => createIdentifier("RT.Null");

export const createBoolean = () => createIdentifier("RT.Boolean");

export const createFunction = () => createIdentifier("RT.Function");

export const createArray = (expr: Expr | CallExpression) =>
  createCallExpression("RT.Array", expr);

export const createTuple = (...exprs: (CallExpression | Expr)[]) =>
  createCallExpression("RT.Tuple", ...exprs);

export const createStaticType = (name: string) =>
    Types.typeAlias(
        Types.identifier(name),
        null,
        Types.genericTypeAnnotation(
            Types.identifier("RT.Static"),
            Types.typeParameterInstantiation([
                Types.typeofTypeAnnotation(
                    Types.genericTypeAnnotation(
                        Types.identifier(name)
                    )
                )
            ])
        )
    );

export type CompileType =
  | {
      type: "string";
    }
  | {
      type: "number";
    }
  | {
      type: "null";
    }
  | {
      type: "boolean";
    }
  | {
      type: "function";
    }
  | {
      type: "array";
      expr: CompileType;
    }
  | {
      type: "ident";
      name: string;
    }
  | {
      type: "tuple";
      params: CompileType[];
    };

export const compileType = (t: CompileType): Identifier | CallExpression => {
  switch (t.type) {
    case "string":
      return createString();
    case "number":
      return createNumber();
    case "null":
      return createNull();
    case "boolean":
      return createBoolean();
    case "function":
      return createFunction();
    case "ident":
      return createIdentifier(t.name);
    case "array":
      return createArray(compileType(t.expr));
    case "tuple":
      return createTuple(...t.params.map(compileType));
  }
};
