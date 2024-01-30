import { Expression } from "../node";
import { InstructionType } from "./instruction";

export class Code {
  instruction: InstructionType;
  operand?: Expression;

  constructor(instruction: InstructionType, operand?: Expression) {
    this.instruction = instruction;
    this.operand = operand;
  }

  setOperand(operand: Expression) {
    this.operand = operand;
  }

  // toString(): string {
  //   let sb: string = `${this.instruction}`.padEnd(15);

  //   if (typeof this.operand === "number" || typeof this.operand === "boolean") {
  //     sb += `[${this.operand}]`;
  //   } else if (typeof this.operand === "string") {
  //     sb += `"${this.operand}"`;
  //   }

  //   return sb;
  // }
}
