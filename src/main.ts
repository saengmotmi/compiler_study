import { Generator } from "./generator";
import { Parser } from "./parser";
import { scan } from "./scanner";
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
  const generatedCode = new Generator().generate(syntaxTree);

  // printSyntaxTree(syntaxTree);
  console.log(generatedCode);
};

main();
