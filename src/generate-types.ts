import { parseAndTraverse } from "./traverse-entry";
import { runtypeVisitor, VisitorState } from "./runtype-visitor";
import {createRegistry} from "./registry";
import generate from '@babel/generator';
import {format} from 'prettier';

export const generateTypes = (code: string) => {
  const initialState: VisitorState = {
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
