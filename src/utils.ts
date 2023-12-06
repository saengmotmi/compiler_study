import { Token } from "./token";

export const printTokenList = (tokens: Token[]) => {
  tokens.forEach((token) => {
    console.log(token);
  });
};
