import {changeGraph} from "./change-graph";

describe("Change Graph", () => {
    it('Should add a value to the graph', () => {
        const graph = changeGraph();

        graph.add("from", "to");

        expect(graph.resolve("from")).toBe("to");
    });

    it("Should resolve a chain from the graph", () => {
       const graph = changeGraph();

       graph.add("a", "b");
       graph.add("b", "c");
       graph.add("c", "d");

       expect(graph.resolve("a")).toBe("d");
    });

    it("Should resolve values from the middle of the chain", () => {
       const graph = changeGraph();

       graph.add("A", "B");
       graph.add("B", "C");
       graph.add("C", "D");

       expect(graph.resolve("B")).toBe("D");
       expect(graph.resolve("C")).toBe("D");
    });

    it("Should swap values", () => {
        const graph = changeGraph();

        graph.add('abra', 'kadabra');
        graph.add('kadabra', 'alakazoo!');

        expect(graph.swap('abra')).toBe(true);
        expect(graph.resolve("kadabra")).toBe('abra');
        expect(graph.resolve('abra')).toBe('abra');
    });

    it("Should do nothing if the swapped value does not exist", () => {
        const graph = changeGraph();

        graph.add("x", "y");
        expect(graph.swap('z')).toBe(false);
        expect(graph.resolve('x')).toBe("y")
    });

    it("Should allow paths to converge", () => {
        const graph = changeGraph();

        graph.add('a', 'b');
        graph.add('b', 'c');
        graph.add('c', 'd');
        graph.add('x', 'a');

        expect(graph.resolve('x')).toBe('d')
    });

    it("Should correctly resolve re-written paths", () => {
        const graph = changeGraph();

        graph.add('a', 'b');
        graph.add('b', 'c');
        graph.add('c', 'd');
        graph.add('b', 'e');

        expect(graph.resolve('a')).toBe('e');
        expect(graph.resolve('b')).toBe('e');
        expect(graph.resolve('d')).toBe('e');
    });

    it("Should throw on simple cycles", () => {
        const graph = changeGraph();

        graph.add("a", "b");
        const addCycle = () => graph.add("b", "a");
        expect(addCycle).toThrowError();
    });

    it("Should throw on complex cycles", () => {
        const graph = changeGraph();

        graph.add("a", "b");
        graph.add("x", "y");
        graph.add("z", "a");
        graph.add("b", "x");

        const addCycle = () => graph.add("y", "z");

        expect(addCycle).toThrowError();
    })
});