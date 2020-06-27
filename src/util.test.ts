import {camelCaseMatcher, camelCaseReplacer, toProperCase} from "./util";

describe("Util", () => {
    describe("camelCaseReplacer", () => {

        it('Should replace snake case gracefully', () => {
            expect("a_b_c".replace(camelCaseMatcher, camelCaseReplacer)).toBe("aBC");
            expect("a_bb_c".replace(camelCaseMatcher, camelCaseReplacer)).toBe("aBbC");
            expect("_a_bb_c_".replace(camelCaseMatcher, camelCaseReplacer)).toBe("ABbC");
        });
    });

    describe('toProperCase', () => {
        expect(toProperCase('alabama_arkansas')).toBe("AlabamaArkansas");
        expect(toProperCase('_alabama_arkansas')).toBe("AlabamaArkansas");
    })
});