import traverse, { Visitor } from "@babel/traverse";
import { parse, ParserOptions } from "@babel/parser";

export const parseAndTraverse = <T>(
  code: string,
  visitor: Visitor<T>,
  initialState: T
): T => {
  const ast = parseCode(code);

  traverse(ast, visitor, undefined, initialState);

  return initialState;
};

const parseCode = (code: string) => {
  const parserOptions: ParserOptions = {
    sourceType: "module",
    plugins: ["jsx", "typescript", "classProperties"],
  };
  try {
    return parse(code, parserOptions);
  } catch (e) {
    throw new Error(`Failed to parse code\n\t${e.message}`);
  }
};