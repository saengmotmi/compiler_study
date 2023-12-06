import { Token } from "./token";
import { printTokenList } from "./utils";

const scan = (sourceCode: string): Token[] => {
  const tokenList: Token[] = [];

  return tokenList;
};

const main = () => {
  const sourceCode = `
    function main() {
      console.log('Hello World');
      console.log('1 + 2 * 3');
    }
  `;

  const tokenList = scan(sourceCode);
  printTokenList(tokenList);
};

main();
