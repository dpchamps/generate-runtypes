import { parseAndTraverse } from "./traverse-entry";
import { formatState, runtypeVisitor, VisitorState } from "./runtype-visitor";
import {changeGraph} from "./change-graph";

export const generateTypes = (code: string) => {
  const initialState: VisitorState = {
    output: "",
    namespace: new Set<string>(),
    changeGraph: changeGraph(),
    shapes: new Map<string, [string, Record<string, string>]>(),
    astNodes: [],
  };

  return formatState(parseAndTraverse(code, runtypeVisitor, initialState));
};
