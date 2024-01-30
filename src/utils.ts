import { Token } from "./token";

export const printTokenList = (tokens: Token[]) => {
  tokens.forEach((token) => {
    console.log(token);
  });

  console.log(
    tokens
      .map((token) => {
        return token.string || token.kind;
      })
      .join(" ")
  );
};

export const printSyntaxTree = (syntaxTree: any) => {
  console.log(JSON.stringify(syntaxTree, null, 2));
};
