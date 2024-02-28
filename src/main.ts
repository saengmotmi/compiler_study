import { Generator } from "./generator";
import { Parser } from "./parser";
import { scan } from "./scanner";
import { printSyntaxTree } from "./utils";

const main = () => {
  const sourceCode = `
    function main() {
      printLine factorial(3);
    }

    function factorial(n) {
      if (n < 2) {
        return 1;
      }
      return n * factorial(n - 1);
    }
  `;

  const tokenList = scan(sourceCode);
  const syntaxTree = new Parser().parse(tokenList);
  const generatedCode = new Generator().generate(syntaxTree);

  printSyntaxTree(syntaxTree);
  console.log(generatedCode);
};

main();
