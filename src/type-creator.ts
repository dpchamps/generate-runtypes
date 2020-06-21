import * as Types from '@babel/types';
import {Expression} from "@babel/types";

const createIdentifier = (name: string) => Types.identifier(name);

const createCallExpression = (name: string, ...params : Expression[]) => Types.callExpression(
    createIdentifier(name),
    params
);

export const createString = () => createIdentifier("RT.String");

export const createNumber = () => createIdentifier("RT.Number");

export const createNull = () =>  createIdentifier("RT.Null");

export const createBoolean = () => createIdentifier("RT.Boolean");

export const createFunction = () => createIdentifier("RT.Function");

export const createArray = () => createCallExpression("RT.Array");

export const createTuple = () => createCallExpression("RT.Tuple");