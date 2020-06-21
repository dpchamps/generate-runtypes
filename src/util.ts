import { ChangeGraph } from "./change-graph";

const camelCaseMatcher = /_(.)?/g;

export const camelCaseReplacer = (_: unknown, p1: string | undefined) =>
  typeof p1 !== "undefined" ? p1.toUpperCase() : "";

export const toProperCase = (input: string) =>
  `${input[0].toUpperCase()}${input.slice(1)}`.replace(
    camelCaseMatcher,
    camelCaseReplacer
  );

export const formatRecord = (
  record: Record<string, string | Record<string, string>>,
  changeGraph: ChangeGraph,
  level = 1
): string =>
  "{\n" +
  Object.entries(record).reduce((fmt, [k, v]) => {
    const indentation = Array(level + 1).join(" ");

    /* istanbul ignore else */
    if (typeof v === "string") {
      return `${fmt}${indentation}${k}:${changeGraph.resolve(v)},\n`;
    }

    //todo: this is not a possible code path *yet*, but I'd rather leave it and have it tested if it ever becomes possible.
    /* istanbul ignore next */
    const nested = formatRecord(v, changeGraph, level + 1);
    /* istanbul ignore next */
    return `${fmt}${indentation}${k}:${nested},\n`;
  }, "") +
  "\n}";

export const merge = (
  recordA: Record<string, string>,
  recordB: Record<string, string>
) => {
  const merged: Record<string, string> = {};

  Object.entries(recordA).forEach(([k, v]) => {
    const strippedUnion = v.replace(/^Union\((.+)\)$/, "$1");
    const right = recordB[k];

    merged[k] = v.includes(right) ? v : `Union(${strippedUnion},${right})`;
  });

  return merged;
};
