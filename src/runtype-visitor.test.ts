import { parseAndTraverse } from "./traverse-entry";
import { runtypeVisitor } from "./runtype-visitor";
import { format } from "prettier";

describe("RunType Visitor", () => {
  const formatExpectation = (code: string) => format(code, { parser: "babel" });
  const convert = (code: string) =>
    parseAndTraverse(code, runtypeVisitor, {
      output: "",
      namespace: new Set<string>(),
      shapes: new Map<string, string>(),
    }).output;

  it(`Converts basic records`, () => {
    const code = `
       const basicJson = {
         prop1: "Hello",
         prop2: 10,
         prop3: true,
         prop4: null,
         prop5: () => {}
       }
       `;
    const expectation = formatExpectation(`
       export const BasicJson = RT.Record({
         prop1: RT.String,
         prop2: RT.Number,
         prop3: RT.Boolean,
         prop4: RT.Null,
         prop5: RT.Function,
       });
       export type BasicJson = RT.Static<typeof BasicJson>;
       `);

    expect(convert(code)).toEqual(expectation);
  });

  it(`Converts nested records`, () => {
    const code = `
        const nestedJson = {
          prop1 : {
            name: "Dave",
            occupation: "Wizard",
            stats: {
              hp: 10,
              attack: 1,
              magic: 12,
            },
          },
        }  
        `;

    const expectation = formatExpectation(`
        export const Stats = RT.Record({
          hp: RT.Number,
          attack: RT.Number,
          magic: RT.Number,
        });
        export type Stats = RT.Static<typeof Stats>;
        export const Prop1 = RT.Record({
          name: RT.String,
          occupation: RT.String,
          stats: Stats,
        });
        export type Prop1 = RT.Static<typeof Prop1>;
        export const NestedJson = RT.Record({
          prop1: Prop1,
        });
        export type NestedJson = RT.Static<typeof NestedJson>;
        `);

    expect(convert(code)).toEqual(expectation);
  });

  it(`Converts records with collections as arrays`, () => {
    const code = `
       const basicCollection = {
         collection: [1, 2, 3, 4]
       }
       `;
    const expectation = formatExpectation(`
        export const BasicCollection = RT.Record({
          collection: RT.Array(RT.Number),
        });
        export type BasicCollection = RT.Static<typeof BasicCollection>;
       `);

    expect(convert(code)).toEqual(expectation);
  });

  it(`Converts records with collections as tuples`, () => {
    const code = `
       const basicCollection = {
         collection: [1, "hello", 2, "world", () => {}]
       }
       `;
    const expectation = formatExpectation(`
        export const BasicCollection = RT.Record({
             collection: RT.Tuple(RT.Number, RT.String, RT.Number, RT.String, RT.Function),
        });
        export type BasicCollection = RT.Static<typeof BasicCollection>;
       `);

    expect(convert(code)).toEqual(expectation);
  });

  it(`Converts collections similar anonymous shapes`, () => {
    const code = `
       const complexCollection = {
         collection: [
           { name : "Ozymandias", kingdom: "Egypt" },
           { name : "Othello", kingdom: "Venice" },
         ]
       }
       `;
    const expectation = formatExpectation(`

        export const AnonymousSchema = RT.Record({
          name: RT.String,
          kingdom: RT.String,
        });
        export type AnonymousSchema = RT.Static<typeof AnonymousSchema>;
        export const ComplexCollection = RT.Record({
          collection: RT.Array(AnonymousSchema),
        });
        export type ComplexCollection = RT.Static<typeof ComplexCollection>;
        
      `);

    expect(convert(code)).toEqual(expectation);
  });

  it(`Converts deep collections`, () => {
    const code = `
       const deepNestedCollection = {
         collection: [
            [1,2,3],
            ["a","b","c"],
            ["a", 1, "b", 2],
            [[1,2], ['a','b']]
         ]
       }
       `;
    const expectation = formatExpectation(`

        export const DeepNestedCollection = RT.Record({
            collection: RT.Tuple(
                RT.Array(RT.Number),
                RT.Array(RT.String),
                RT.Tuple(RT.String, RT.Number, RT.String, RT.Number),
                RT.Tuple(RT.Array(RT.Number), RT.Array(RT.String))
            ),
        });
        export type DeepNestedCollection = RT.Static<typeof DeepNestedCollection>;
        
      `);

    expect(convert(code)).toEqual(expectation);
  });

  it(`Captures potential collisions`, () => {
    const code = `
       const sportsBall = {
         basketball: {
            stats: {
              FGM: 10
            }
         },
         football: {
            stats:{
                RBI: 10
            }
         },
       }
       `;

    const expectation = formatExpectation(`

        export const Stats1 = RT.Record({
          RBI: RT.Number,
        });
        export type Stats1 = RT.Static<typeof Stats1>;
        export const Football = RT.Record({
          stats: Stats1,
        });
        export type Football = RT.Static<typeof Football>;
        export const Stats = RT.Record({
          FGM: RT.Number,
        });
        export type Stats = RT.Static<typeof Stats>;
        export const Basketball = RT.Record({
          stats: Stats,
        });
        export type Basketball = RT.Static<typeof Basketball>;
        export const SportsBall = RT.Record({
          basketball: Basketball,
          football: Football,
        });
        export type SportsBall = RT.Static<typeof SportsBall>;
        
      `);

    expect(convert(code)).toEqual(expectation);
  });

  it("Should skip computed properties", () => {
    const code = `
       const empty = {
         [prop1]: "Hello",
       }
       `;
    const expectation = formatExpectation(`
       export const Empty = RT.Record({
       });
       export type Empty = RT.Static<typeof Empty>;
       `);

    expect(convert(code)).toBe(expectation);
  });

  it("Should skip callExpressions", () => {
    const code = `
       const empty = {
         prop1: Symbol(),
         prop2: [Symbol()]
       }
       `;
    const expectation = formatExpectation(`
       export const Empty = RT.Record({
       });
       export type Empty = RT.Static<typeof Empty>;
       `);

    expect(convert(code)).toBe(expectation);
  });

  it("Should reject invalid literals", () => {
    const invalid1 = `
       const bad = {
         prop1: /all/gi,
       }
       `;

    const invalid2 = `
       const bad = {
         prop1: 123n,
       }
       `;

    expect(() => convert(invalid1)).toThrowError();
    expect(() => convert(invalid2)).toThrowError();
  });
});
