export interface ChangeGraph {
  add: (from: string, to: string) => void;
  resolve: (ident: string) => string;
  swap: (ident: string) => boolean;
}

export const changeGraph = (): ChangeGraph => {
  const graph: Record<string, string> = {};

  return {
    add: (from: string, to: string) => {
      if (to in graph)
        throw new Error(`Attempting to add a cycle to the change graph.`);
      graph[from] = to;
    },
    resolve(ident: string): string {
      if (graph[ident]) return this.resolve(graph[ident]);

      return ident;
    },
    swap(ident: string): boolean{
      if(!(ident in graph)) return false;

      const existing = this.resolve(ident);
      delete graph[ident];
      this.add(existing, ident);

      return true;
    }
  };
};
