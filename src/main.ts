import { Parser } from "./parser";
import { scan } from "./scanner";
import { Token } from "./token";
import { printSyntaxTree } from "./utils";

const main = () => {
  const sourceCode = `
    function main() {
      printLine 'Hello World';
      printLine 1 + 2 * 3;
    }
  `;

  const tokenList = scan(sourceCode);
  const syntaxTree = new Parser().parse(tokenList);

  printSyntaxTree(syntaxTree);
};

main();
