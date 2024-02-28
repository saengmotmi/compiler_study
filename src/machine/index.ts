import { Code } from "../generator/code";
import { builtinFunctionTable } from "../interpreter/builtinFunctionTable";
import { StackFrame } from "./stackframe";
// import { GarbageCollector } from "./garbageCollector";

type Instruction =
  | "Exit"
  | "GetGlobal"
  | "SetGlobal"
  | "Call"
  | "Alloca"
  | "Print"
  | "PrintLine"
  | "Return"
  | "Add"
  | "Subtract"
  | "Multiply"
  | "Divide"
  | "Modulo"
  | "Absolute"
  | "ReverseSign"
  | "LogicalOr"
  | "LogicalAnd"
  | "Equal"
  | "NotEqual"
  | "LessThan"
  | "GreaterThan"
  | "LessOrEqual"
  | "GreaterOrEqual"
  | "GetLocal"
  | "SetLocal"
  | "Jump"
  | "ConditionJump"
  | "PushNull"
  | "PushBoolean"
  | "PushNumber"
  | "PushString"
  | "PushArray"
  | "PushMap"
  | "GetElement"
  | "SetElement"
  | "PopOperand";

export class Machine {
  private static callStack: StackFrame[] = [];
  private static global: Map<string, any> = new Map();
  // private garbageCollector = new GarbageCollector(
  //   Machine.callStack,
  //   Machine.global
  // );

  public execute(objectCode: [Code[], Map<string, number>]): void {
    Machine.callStack.push(new StackFrame());

    const [codeList, functionTable] = objectCode;

    while (true) {
      const currentFrame = Machine.callStack[Machine.callStack.length - 1];
      const instructionPointer = currentFrame.instructionPointer;
      const code = codeList[instructionPointer];
      console.log({ code, instructionPointer });

      switch (code.instruction) {
        case "Exit":
          Machine.callStack.pop();
          if (Machine.callStack.length === 0) return;
          break;

        case "GetGlobal": {
          const name: string = code.operand;
          if (functionTable.has(name)) {
            this.pushOperand(functionTable.get(name));
          } else if (builtinFunctionTable.has(name)) {
            this.pushOperand(name);
          } else if (Machine.global.has(name)) {
            this.pushOperand(Machine.global.get(name));
          } else {
            throw new Error("Reference to undefined global variable: " + name);
          }
          break;
        }

        case "SetGlobal": {
          const name: string = code.operand;
          Machine.global.set(name, this.peekOperand());
          break;
        }

        case "Call": {
          const operand = this.popOperand();
          if (typeof operand === "number") {
            const newFrame = new StackFrame();
            newFrame.setInstructionPointer(operand);

            const argCount = code.operand;
            for (let i = 0; i < argCount; i++) {
              newFrame.variables.push(this.popOperand());
            }

            Machine.callStack.push(newFrame);
          } else if (
            typeof operand === "string" &&
            builtinFunctionTable.has(operand)
          ) {
            const args: any[] = [];
            const argCount = code.operand;
            for (let i = 0; i < argCount; i++) {
              args.push(this.popOperand());
            }

            // @ts-ignore
            const result = builtinFunctionTable.get(operand)?.(...args);
            this.pushOperand(result);
          } else {
            this.pushOperand(null);
          }
          break;
        }

        case "Alloca":
          // In TypeScript, array sizes are dynamic so no operation is needed for Alloca
          break;

        case "Print": {
          const argCount = code.operand;
          let output = "";
          for (let i = 0; i < argCount; i++) {
            output += this.popOperand().toString();
          }
          console.log(output);
          break;
        }

        case "PrintLine":
          console.log();
          break;

        case "Return": {
          let result = null;
          if (!currentFrame.isOperandStackEmpty()) {
            result = this.popOperand();
          }
          Machine.callStack.pop();
          if (Machine.callStack.length > 0) {
            this.pushOperand(result);
          }
          break;
        }

        case "Add": {
          const rightValue = this.popOperand();
          const leftValue = this.popOperand();
          if (typeof leftValue === "number" && typeof rightValue === "number") {
            this.pushOperand(leftValue + rightValue);
          } else {
            throw new Error("Add operation requires two numbers.");
          }
          break;
        }

        case "Subtract": {
          const rightValue = this.popOperand();
          const leftValue = this.popOperand();
          if (typeof leftValue === "number" && typeof rightValue === "number") {
            this.pushOperand(leftValue - rightValue);
          } else {
            throw new Error("Subtract operation requires two numbers.");
          }
          break;
        }

        case "Multiply": {
          const rightValue = this.popOperand();
          const leftValue = this.popOperand();
          if (typeof leftValue === "number" && typeof rightValue === "number") {
            this.pushOperand(leftValue * rightValue);
          } else {
            throw new Error("Multiply operation requires two numbers.");
          }
          break;
        }

        case "Divide": {
          const rightValue = this.popOperand();
          const leftValue = this.popOperand();
          if (typeof leftValue === "number" && typeof rightValue === "number") {
            if (rightValue === 0) {
              throw new Error("Cannot divide by zero.");
            }
            this.pushOperand(leftValue / rightValue);
          } else {
            throw new Error("Divide operation requires two numbers.");
          }
          break;
        }

        case "Modulo": {
          const rightValue = this.popOperand();
          const leftValue = this.popOperand();
          if (typeof leftValue === "number" && typeof rightValue === "number") {
            if (rightValue === 0) {
              throw new Error("Cannot modulo by zero.");
            }
            this.pushOperand(leftValue % rightValue);
          } else {
            throw new Error("Modulo operation requires two numbers.");
          }
          break;
        }

        case "Absolute": {
          const value = this.popOperand();
          if (typeof value === "number") {
            this.pushOperand(Math.abs(value));
          } else {
            throw new Error("Absolute operation requires a number.");
          }
          break;
        }

        case "ReverseSign": {
          const value = this.popOperand();
          if (typeof value === "number") {
            this.pushOperand(-value);
          } else {
            throw new Error("ReverseSign operation requires a number.");
          }
          break;
        }

        case "LogicalOr": {
          const rightValue = this.popOperand();
          const leftValue = this.popOperand();
          this.pushOperand(!!leftValue || !!rightValue);
          break;
        }

        case "LogicalAnd": {
          const rightValue = this.popOperand();
          const leftValue = this.popOperand();
          this.pushOperand(!!leftValue && !!rightValue);
          break;
        }

        case "Equal": {
          const rightValue = this.popOperand();
          const leftValue = this.popOperand();
          this.pushOperand(leftValue === rightValue);
          break;
        }

        case "NotEqual": {
          const rightValue = this.popOperand();
          const leftValue = this.popOperand();
          this.pushOperand(leftValue !== rightValue);
          break;
        }

        case "LessThan": {
          const rightValue = this.popOperand();
          const leftValue = this.popOperand();
          if (typeof leftValue === "number" && typeof rightValue === "number") {
            this.pushOperand(leftValue < rightValue);
          } else {
            throw new Error("LessThan operation requires two numbers.");
          }
          break;
        }

        case "GreaterThan": {
          const rightValue = this.popOperand();
          const leftValue = this.popOperand();
          if (typeof leftValue === "number" && typeof rightValue === "number") {
            this.pushOperand(leftValue > rightValue);
          } else {
            throw new Error("GreaterThan operation requires two numbers.");
          }
          break;
        }

        case "LessOrEqual": {
          const rightValue = this.popOperand();
          const leftValue = this.popOperand();
          if (typeof leftValue === "number" && typeof rightValue === "number") {
            this.pushOperand(leftValue <= rightValue);
          } else {
            throw new Error("LessOrEqual operation requires two numbers.");
          }
          break;
        }

        case "GreaterOrEqual": {
          const rightValue = this.popOperand();
          const leftValue = this.popOperand();
          if (typeof leftValue === "number" && typeof rightValue === "number") {
            this.pushOperand(leftValue >= rightValue);
          } else {
            throw new Error("GreaterOrEqual operation requires two numbers.");
          }
          break;
        }

        case "GetLocal": {
          const index = code.operand;
          const value = currentFrame.getVariableAt(index);
          this.pushOperand(value);
          break;
        }

        case "SetLocal": {
          const index = code.operand;
          const value = this.popOperand();
          currentFrame.changeValueAt(index, value);
          break;
        }

        case "Jump": {
          const jumpAddress = code.operand;
          currentFrame.setInstructionPointer(jumpAddress - 1); // -1 because the IP will be incremented after switch
          break;
        }

        case "ConditionJump": {
          const condition = this.popOperand();
          const jumpAddress = code.operand;
          if (condition) {
            currentFrame.setInstructionPointer(jumpAddress - 1); // -1 because the IP will be incremented after switch
          }
          break;
        }

        case "PushNull": {
          this.pushOperand(null);
          break;
        }

        case "PushBoolean": {
          const value = code.operand;
          this.pushOperand(value);
          break;
        }

        case "PushNumber": {
          const value = code.operand;
          this.pushOperand(value);
          break;
        }

        case "PushString": {
          const value = code.operand;
          this.pushOperand(value);
          break;
        }

        case "PushArray": {
          const length = code.operand;
          const array = [];
          for (let i = 0; i < length; i++) {
            array.push(this.popOperand());
          }
          this.pushOperand(array.reverse()); // reverse to maintain order
          break;
        }

        case "PushMap": {
          const numPairs = code.operand;
          const map = new Map();
          for (let i = 0; i < numPairs; i++) {
            const value = this.popOperand();
            const key = this.popOperand();
            map.set(key, value);
          }
          this.pushOperand(map);
          break;
        }

        case "GetElement": {
          const index = this.popOperand();
          const collection = this.popOperand();
          if (Array.isArray(collection)) {
            this.pushOperand(collection[index]);
          } else if (collection instanceof Map) {
            this.pushOperand(collection.get(index));
          } else {
            throw new Error("GetElement operation requires an array or map.");
          }
          break;
        }

        case "SetElement": {
          const value = this.popOperand();
          const index = this.popOperand();
          const collection = this.popOperand();
          if (Array.isArray(collection)) {
            collection[index] = value;
            this.pushOperand(collection); // Optionally push back the modified collection
          } else if (collection instanceof Map) {
            collection.set(index, value);
            this.pushOperand(collection); // Optionally push back the modified collection
          } else {
            throw new Error("SetElement operation requires an array or map.");
          }
          break;
        }

        case "PopOperand": {
          this.popOperand();
          break;
        }

        default:
          throw new Error("Unsupported instruction: " + code.instruction);
      }

      // this.garbageCollector.collectGarbage();
      currentFrame.instructionPointer += 1;
    }
  }

  private pushOperand(value: any): void {
    const currentFrame = Machine.callStack[Machine.callStack.length - 1];
    currentFrame.operandStack.push(value);
  }

  private popOperand(): any {
    const currentFrame = Machine.callStack[Machine.callStack.length - 1];
    return currentFrame.operandStack.pop();
  }

  private peekOperand(): any {
    const currentFrame = Machine.callStack[Machine.callStack.length - 1];
    return currentFrame.operandStack[currentFrame.operandStack.length - 1];
  }
}
