import {parseAndTraverse} from "./traverse-entry";

describe("Parse and Traverse", () => {
    it('Should parse', () => {
        const execute = () => parseAndTraverse(
            `const x = "hello world!"`,
            { Program() {} },
            {}
        );

        expect(execute).not.toThrowError();
    });


    it('Should throw', () => {
        const execute = () => parseAndTraverse(
            `const bad = { "hello, world`,
            { Program() {} },
            {}
        );

        expect(execute).toThrowError();
    });


});