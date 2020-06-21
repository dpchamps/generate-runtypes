import {parseAndTraverse} from "./traverse-entry";
import {formatState, runtypeVisitor, VisitorState} from "./runtype-visitor";


export const generateTypes = (code: string) => {
    const initialState : VisitorState = {
        output: "",
        namespace: new Set<string>(),
        changeGraph: {},
        shapes: new Map<string, [string, Record<string, string>]>()
    };

    return formatState(parseAndTraverse(code, runtypeVisitor, initialState));
};