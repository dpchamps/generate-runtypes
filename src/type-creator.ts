import * as Types from "@babel/types";
import {Expression, SpreadElement, JSXNamespacedName, ArgumentPlaceholder} from "@babel/types";

const createIdentifier = (name: string) => Types.identifier(name);

const createCallExpression = (name: string, ...params: (Expression | SpreadElement | JSXNamespacedName | ArgumentPlaceholder)[]) =>
  Types.callExpression(createIdentifier(name), params);

export const createString = () => createIdentifier("RT.String");

export const createNumber = () => createIdentifier("RT.Number");

export const createNull = () => createIdentifier("RT.Null");

export const createBoolean = () => createIdentifier("RT.Boolean");

export const createFunction = () => createIdentifier("RT.Function");

export const createArray = (type: string) => createCallExpression("RT.Array", createIdentifier(type));

export const createTuple = (...types: string[]) => createCallExpression("RT.Tuple", ...types.map(createIdentifier));


export type CompileType =
    {
        type: "string"
    } |
    {
        type: "number"
    } |
    {
        type: "null"
    } |
    {
        type: "boolean"
    } |
    {
        type: "function"
    } |
    {
        type: "array",
        ident: string
    } |
    {
        type: "tuple",
        params: string[]
    };

export const compileType = (compileType: CompileType) => {
    switch (compileType.type) {
        case "string": return createString();
        case "number": return createNumber();
        case "null": return createNull();
        case "boolean": return createBoolean();
        case "function": return createFunction();
        case "array": return createArray(compileType.ident);
        case "tuple": return createTuple(...compileType.params);
    }
};