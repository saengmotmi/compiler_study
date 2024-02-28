type BuiltInFunction = (params: any[]) => any;

export const builtinFunctionTable: Map<string, BuiltInFunction> = new Map([
  [
    "length",
    (params: any[]): number => {
      if (params.length === 1 && Array.isArray(params[0])) {
        return params[0].length;
      }
      if (params.length === 1 && params[0] instanceof Map) {
        return params[0].size;
      }
      return 0;
    },
  ],

  [
    "push",
    (params: any[]): any[] | null => {
      if (params.length === 2 && Array.isArray(params[0])) {
        params[0].push(params[1]);
        return params[0];
      }
      return null;
    },
  ],

  [
    "pop",
    (params: any[]): any | null => {
      if (
        params.length === 1 &&
        Array.isArray(params[0]) &&
        params[0].length !== 0
      ) {
        return params[0].pop();
      }
      return null;
    },
  ],

  [
    "erase",
    (params: any[]): any | null => {
      if (
        params.length === 2 &&
        params[0] instanceof Map &&
        typeof params[1] === "string" &&
        params[0].has(params[1])
      ) {
        const erase = params[0].get(params[1]);
        params[0].delete(params[1]);
        return erase;
      }
      return null;
    },
  ],

  [
    "sqrt",
    (params: any[]): number => {
      if (params.length === 1 && typeof params[0] === "number") {
        return Math.sqrt(params[0]);
      }
      throw new Error("sqrt function requires a single numeric parameter");
    },
  ],
]);
