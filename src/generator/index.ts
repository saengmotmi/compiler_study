import { Expression, Program, Statement } from "../node";
import { Code } from "./code";
import { Instruction, InstructionType } from "./instruction";

export class Generator {
  static codeList: Code[] = [];
  static functionTable: Map<string, number> = new Map();
  static localSize: number = 0;
  static continueStack: number[][] = [];
  static breakStack: number[][] = [];
  static symbolStack: Map<string, number>[] = [];
  static offsetStack: number[] = [];

  generate(program: Program): [Code[], Map<string, number>] {
    Generator.codeList = [];
    Generator.functionTable.clear();
    Generator.writeCode(Instruction.GetGlobal, "main");
    Generator.writeCode(Instruction.Call, 0);
    Generator.writeCode(Instruction.Exit);

    program.getFunctions().forEach((node: Statement) => {
      node.generate();
    });

    return [Generator.codeList, Generator.functionTable];
  }

  static writeCode(instruction: InstructionType, operand?: Expression): number {
    Generator.codeList.push(new Code(instruction, operand));
    return Generator.codeList.length - 1;
  }

  static patchAddress(codeIndex: number): void {
    Generator.codeList[codeIndex].setOperand(Generator.codeList.length);
  }

  static getLocal(name: string): number {
    for (const symbolTable of Generator.symbolStack) {
      if (symbolTable.has(name)) {
        return symbolTable.get(name)!;
      }
    }
    return Number.MAX_VALUE; // symbolStack에 존재하지 않으면, 전역변수로 간주
  }

  static setLocal(name: string): void {
    Generator.symbolStack[0].set(
      name,
      Generator.offsetStack[Generator.offsetStack.length - 1]
    );
    Generator.offsetStack[Generator.offsetStack.length - 1]++;
    Generator.localSize = Math.max(
      Generator.localSize,
      Generator.offsetStack[Generator.offsetStack.length - 1]
    );
  }

  static initBlock(): void {
    Generator.localSize = 0;
    Generator.offsetStack.push(0);
    Generator.symbolStack.unshift(new Map());
  }

  static pushBlock(): void {
    Generator.symbolStack.unshift(new Map());
    Generator.offsetStack.push(
      Generator.offsetStack[Generator.offsetStack.length - 1]
    );
  }

  static popBlock(): void {
    Generator.offsetStack.pop();
    Generator.symbolStack.shift();
  }

  static patchOperand(codeIndex: number, operand: number): void {
    Generator.codeList[codeIndex].setOperand(operand);
  }
}
