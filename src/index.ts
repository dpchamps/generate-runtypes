#!/usr/bin/env node

import {parseAndTraverse} from "./traverse-entry";
import {runtypeVisitor} from "./runtype-visitor";
import {Readable} from "stream";

const maybeParseJson = (input: string) => {
   try{
      JSON.parse(input);
      return `const JSONSchema = ${input}`;
   }catch(e){
      return input;
   }
};

const collectFromInStream = () => new Promise((res, rej) => {
   const buffers : Buffer[] = [];
   const inStream = process.openStdin();

   inStream.on('data', (chunk) => {
      buffers.push(chunk)
   });

   inStream.on("end", () => {
      res( Buffer.concat(buffers).toString('utf8') );
   });

   inStream.on("error", rej);
});

const pipeToStdout = (output: string) => Readable.from(output).pipe(process.stdout);

const getInput = async () => {
   if(process.argv.slice(2).length === 0){
      return collectFromInStream();
   }
}

(async () => {
   const input = await getInput() as string;

   const code = maybeParseJson(input);
   const {output} = parseAndTraverse(
       code,
       runtypeVisitor,
       {shapes: new Map<string, string>(), namespace: new Set<string>(), output: ""}
   );

   pipeToStdout(`import * as RT from 'runtypes' \n${output}`);
})();
