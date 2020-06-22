const camelCaseMatcher = /_(.)?/g;

export const camelCaseReplacer = (_: unknown, p1: string | undefined) =>
  typeof p1 !== "undefined" ? p1.toUpperCase() : "";

export const toProperCase = (input: string) =>
  `${input[0].toUpperCase()}${input.slice(1)}`.replace(
    camelCaseMatcher,
    camelCaseReplacer
  );
