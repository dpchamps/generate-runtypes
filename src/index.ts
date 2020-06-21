#!/usr/bin/env node

import { parseAndTraverse } from "./traverse-entry";
import {formatState, runtypeVisitor} from "./runtype-visitor";
import { Readable } from "stream";
import { options } from "yargs";
import { createReadStream, promises as fs } from "fs";
import { join } from "path";
import Socket = NodeJS.Socket;

const argv = options({
  in: { type: "string", description: "In-file" },
  name: { type: "string", description: "Name of the top-level schema." },
}).argv;

const maybeParseJson = (input: string, topLevelName: string = "Schema") => {
  try {
    JSON.parse(input);
    return `const ${topLevelName} = ${input}`;
  } catch (e) {
    return input;
  }
};

const collectFromStream = (stream: Readable | Socket): Promise<Buffer> =>
  new Promise((res, rej) => {
    const buffers: Buffer[] = [];

    stream.on("data", (chunk) => buffers.push(chunk));
    stream.once("end", () => res(Buffer.concat(buffers)));
    stream.once("error", rej);
  });

const pipeToStdout = (output: string) =>
  Readable.from(output).pipe(process.stdout);

const getInput = async () => {
  if (!argv.in) {
    return (await collectFromStream(process.openStdin())).toString();
  } else {
    const path = join(process.cwd(), argv.in);
    await fs.stat(path);

    return (await collectFromStream(createReadStream(path))).toString();
  }
};

(async () => {
  const input = (await getInput()) as string;

  const code = maybeParseJson(input, argv.name);
  const initialState = {
    shapes: new Map<string, [string, Record<string, string>]>(),
    namespace: new Set<string>(),
    output: "import * as RT from 'runtypes'\n",
    changeGraph: {},
  };
  const output = formatState(parseAndTraverse(code, runtypeVisitor, initialState));

  pipeToStdout(` ${output}`);
})();
