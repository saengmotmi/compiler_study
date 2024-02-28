import { Generator } from "./generator";
import { Machine } from "./machine";
import { Parser } from "./parser";
import { scan } from "./scanner";
import { printSyntaxTree } from "./utils";

const main = () => {
  const sourceCode = `
    function main() {
      printLine 1 + 2 * 3;
    }
  `;

  const tokenList = scan(sourceCode);
  const syntaxTree = new Parser().parse(tokenList);
  const generatedCode = new Generator().generate(syntaxTree);
  new Machine().execute(generatedCode);

  // printSyntaxTree(syntaxTree);
  // console.log(generatedCode);
};

main();
