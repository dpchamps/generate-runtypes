import { parseAndTraverse } from "./traverse-entry";
import { runtypeVisitor, VisitorState } from "./runtype-visitor";
import { changeGraph } from "./change-graph";
import {createRegistry} from "./registry";
import generate from '@babel/generator';
import {format} from 'prettier';

export const generateTypes = (code: string) => {
  const initialState: VisitorState = {
    output: "",
    namespace: new Set<string>(),
    changeGraph: changeGraph(),
    shapes: new Map<string, [string, Record<string, string>]>(),
    astNodes: [],
    registry: createRegistry(),
  };

  const {registry} = parseAndTraverse(code, runtypeVisitor, initialState);

  return format(
      generate(
          registry.compile()
      ).code,
      {parser: "babel"}
  );
};
