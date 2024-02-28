export class StackFrame {
  variables: any[] = []; // 함수내의 변수 공간
  operandStack: any[] = []; // 피연산자 스택 (TypeScript에서는 일반 배열을 사용하여 스택 구현)
  instructionPointer: number = 0; // 명령어 포인터

  getVariableAt(index: number): any {
    // 변수 공간의 n 번째 인덱스의 변수를 가져온다.
    return this.variables[index];
  }

  changeValueAt(index: number, value: any): void {
    // 변수 공간의 n 번째 인덱스의 변수를 바꾼다.
    if (this.variables.length > index) {
      this.variables[index] = value;
    } else {
      this.variables.push(value);
    }
  }

  addVariable(variable: any): void {
    // 변수 공간에 변수를 추가한다.
    this.variables.push(variable);
  }

  getVariables(): any[] {
    return this.variables;
  }

  addOperand(value: any): void {
    // 피연산자 스택에 피연산자를 push
    this.operandStack.push(value);
  }

  popOperand(): any {
    // 피연산자 스택에 피연산자를 pop
    return this.operandStack.pop();
  }

  peekOperand(): any {
    // 피연산자 스택에 top 값을 peek
    return this.operandStack[this.operandStack.length - 1];
  }

  isOperandStackEmpty(): boolean {
    return this.operandStack.length === 0;
  }

  getOperandStack(): any[] {
    return this.operandStack;
  }

  getInstructionPointer(): number {
    return this.instructionPointer;
  }

  setInstructionPointer(instructionPointer: number): void {
    // 명령어 포인터 값을 변경한다. (Jump, ConditionJump)
    this.instructionPointer = instructionPointer;
  }

  increaseInstructionPointer(): void {
    // 명령어 포인터 값을 1 증가한다. (일반적인 명령어 진행 흐름)
    this.instructionPointer += 1;
  }
}
