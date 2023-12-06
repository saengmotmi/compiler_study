import { scan } from "./scanner";
import { printTokenList } from "./utils";

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
