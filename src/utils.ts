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
