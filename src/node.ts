import { Generator } from "./generator";
import { Instruction, InstructionType } from "./generator/instruction";
import { Kind, KindType } from "./kind";

export class Program {
  functions: NodeFunction[]; // Function 객체의 배열로 정의합니다.

  constructor() {
    this.functions = [];
  }

  getFunctions() {
    return this.functions;
  }

  add(functionNode: NodeFunction) {
    this.functions.push(functionNode);
  }
}

export class Statement {
  generate() {}
}

export class Expression {
  generate() {}
}

export class NodeFunction extends Statement {
  name?: string;
  parameters: string[] = [];
  block: Statement[] = []; // Statement 객체의 배열로 정의합니다.

  // NOTE: 생성자가 불필요한가...?
  constructor() {
    super(); // 상속받은 클래스의 생성자를 호출합니다.
  }

  generate() {
    Generator.functionTable.set(this.name!, Generator.codeList.length);
    const temp = Generator.writeCode(Instruction.Alloca);
    Generator.initBlock();
    for (const name of this.parameters) {
      Generator.setLocal(name);
    }
    for (const node of this.block) {
      node.generate();
    }
    Generator.popBlock();
    Generator.patchOperand(temp, Generator.localSize);
    Generator.writeCode(Instruction.Return);
  }
}

export class Return extends Statement {
  expression?: Expression;

  constructor() {
    super();
  }

  generate() {
    this.expression?.generate();
    Generator.writeCode(Instruction.Return);
  }
}

export class Variable extends Statement {
  name?: string;
  expression?: Expression;

  constructor(name?: string, expression?: Expression) {
    super();
    this.name = name;
    this.expression = expression;
  }

  generate() {
    Generator.setLocal(this.name!);
    this.expression?.generate();
    Generator.writeCode(Instruction.SetLocal, Generator.getLocal(this.name!));
    Generator.writeCode(Instruction.PopOperand);
  }
}

export class For extends Statement {
  variable?: Variable;
  condition?: Expression;
  increment?: Expression;
  block?: Statement[];

  constructor() {
    super();
  }

  generate() {
    Generator.breakStack.push([]);
    Generator.continueStack.push([]);

    Generator.pushBlock();
    this.variable?.generate();

    const jumpAddress = Generator.codeList.length;
    this.condition?.generate();

    const conditionJump = Generator.writeCode(Instruction.ConditionJump);
    for (const node of this.block!) {
      node.generate();
    }

    const continueAddress = Generator.codeList.length;
    this.increment?.generate();
    Generator.writeCode(Instruction.PopOperand);

    Generator.writeCode(Instruction.Jump, jumpAddress);

    Generator.patchAddress(conditionJump);
    Generator.popBlock();

    for (const jump of Generator.continueStack.pop()!) {
      Generator.patchOperand(jump, continueAddress);
    }
    Generator.continueStack.pop();

    for (const jump of Generator.breakStack.pop()!) {
      Generator.patchAddress(jump);
    }
    Generator.breakStack.pop();
  }
}

export class Break extends Statement {}

export class Continue extends Statement {
  generate(): void {
    if (Generator.continueStack.length === 0) {
      return;
    }
    const jumpCode = Generator.writeCode(Instruction.Jump);
    Generator.continueStack[Generator.continueStack.length - 1].push(jumpCode);
  }
}

export class If extends Statement {
  conditions: Expression[] = [];
  blocks: Statement[][] = [];
  elseBlock: Statement[] = [];

  constructor() {
    super();
  }

  generate() {
    const jumpList: number[] = [];

    if (!this.conditions || !this.blocks) {
      throw new Error("conditions is undefined");
    }

    for (let i = 0; i < this.conditions.length; i++) {
      this.conditions![i].generate();
      const conditionJump = Generator.writeCode(Instruction.ConditionJump);

      Generator.pushBlock();
      for (const node of this.blocks[i]) {
        node.generate();
      }
      Generator.popBlock();

      jumpList.push(Generator.writeCode(Instruction.Jump));
      Generator.patchAddress(conditionJump);
    }
  }
}

export class Print extends Statement {
  lineFeed?: boolean = false;
  args: Expression[] = []; // NOTE: arguments는 예약어라서 args로 대체

  constructor() {
    super();
  }

  generate() {
    for (let i = this.args.length - 1; i >= 0; i--) {
      this.args[i].generate();
    }
    Generator.writeCode(Instruction.Print, this.args.length);
    if (this.lineFeed) {
      Generator.writeCode(Instruction.PrintLine);
    }
  }
}

export class ExpressionStatement extends Statement {
  expression?: Expression;

  constructor(expression?: Expression) {
    super();
    this.expression = expression;
  }

  generate() {
    this.expression?.generate();
    Generator.writeCode(Instruction.PopOperand);
  }
}

export class Or extends Expression {
  left?: Expression;
  right?: Expression;

  constructor(left?: Expression, right?: Expression) {
    super();
    this.left = left;
    this.right = right;
  }
}

export class And extends Expression {
  left?: Expression;
  right?: Expression;

  constructor(left?: Expression, right?: Expression) {
    super();
    this.left = left;
    this.right = right;
  }
}

export class Relational extends Expression {
  kind: KindType;
  left: Expression;
  right: Expression;

  constructor(kind: KindType, left: Expression, right: Expression) {
    super();
    this.kind = kind;
    this.left = left;
    this.right = right;
  }

  generate() {
    const instructions = new Map<KindType, InstructionType>([
      [Kind.Equal, Instruction.Equal],
      [Kind.NotEqual, Instruction.NotEqual],
      [Kind.LessThan, Instruction.LessThan],
      [Kind.LessThanOrEqual, Instruction.LessOrEqual],
      [Kind.GreaterThan, Instruction.GreaterThan],
      [Kind.GreaterThanOrEqual, Instruction.GreaterOrEqual],
    ]);

    this.left.generate();
    this.right.generate();
    Generator.writeCode(instructions.get(this.kind)!);
  }
}

export class Arithmetic extends Expression {
  kind: KindType;
  left: Expression;
  right: Expression;

  constructor(kind: KindType, left: Expression, right: Expression) {
    super();
    this.kind = kind;
    this.left = left;
    this.right = right;
  }

  generate() {
    const instructions = new Map<KindType, InstructionType>([
      [Kind.Add, Instruction.Add],
      [Kind.Subtract, Instruction.Subtract],
      [Kind.Multiply, Instruction.Multiply],
      [Kind.Divide, Instruction.Divide],
      [Kind.Modulo, Instruction.Modulo],
    ]);

    this.left.generate();
    this.right.generate();
    Generator.writeCode(instructions.get(this.kind)!);
  }
}

export class Unary extends Expression {
  kind: KindType;
  sub: Expression;

  constructor(kind: KindType, sub: Expression) {
    super();
    this.kind = kind;
    this.sub = sub;
  }
}

export class Call extends Expression {
  sub: Expression;
  args: Expression[];

  constructor(sub: Expression, args: Expression[]) {
    super();
    this.sub = sub;
    this.args = args;
  }
}

export class GetElement extends Expression {
  sub: Expression;
  index: Expression;

  constructor(sub: Expression, index: Expression) {
    super();
    this.sub = sub;
    this.index = index;
  }
}

export class SetElement extends Expression {
  sub?: Expression;
  index?: Expression;
  value?: Expression;

  constructor(sub?: Expression, index?: Expression, value?: Expression) {
    super();
    this.sub = sub;
    this.index = index;
    this.value = value;
  }

  generate() {
    this.value?.generate();
    this.sub?.generate();
    this.index?.generate();
    Generator.writeCode(Instruction.SetElement);
  }
}

export class GetVariable extends Expression {
  name: string;

  constructor(name: string) {
    super();
    this.name = name;
  }
}

export class SetVariable extends Expression {
  name?: string;
  value?: Expression;

  constructor(name?: string, value?: Expression) {
    super();
    this.name = name;
    this.value = value;
  }
}

export class NullLiteral extends Expression {}

export class BoolLiteral extends Expression {
  value: boolean;

  constructor(value: boolean) {
    super();
    this.value = value;
  }
}

export class NumberLiteral extends Expression {
  value: number;

  constructor(value: number) {
    super();
    this.value = value;
  }
}

export class StringLiteral extends Expression {
  value: string;

  constructor(value: string) {
    super();
    this.value = value;
  }

  generate() {
    Generator.writeCode(Instruction.PushString, this.value);
  }
}

export class ArrayLiteral extends Expression {
  values: Expression[] = [];

  constructor(values?: Expression[]) {
    super();
    this.values = values || [];
  }

  generate() {
    for (let i = this.values.length - 1; i >= 0; i--) {
      this.values[i].generate();
    }
    Generator.writeCode(Instruction.PushArray, this.values.length);
  }
}

export class MapLiteral implements Expression {
  values: Map<string, Expression>;

  constructor() {
    this.values = new Map<string, Expression>();
  }

  generate() {
    for (const key of this.values.keys()) {
      Generator.writeCode(Instruction.PushString, key);
      this.values.get(key)?.generate();
    }
    Generator.writeCode(Instruction.PushMap, this.values.size);
  }
}

export class IdentifierExpression extends Expression {
  name: string;

  constructor(name: string) {
    super();
    this.name = name;
  }
}

export class UnaryExpression extends Expression {
  kind: KindType;
  sub: Expression;

  constructor(kind: KindType, sub: Expression) {
    super();
    this.kind = kind;
    this.sub = sub;
  }
}

export class ArithmeticExpression extends Expression {
  lhs: Expression;
  operator: KindType;
  rhs: Expression;

  constructor(lhs: Expression, operator: KindType, rhs: Expression) {
    super();
    this.lhs = lhs;
    this.operator = operator;
    this.rhs = rhs;
  }

  // Method to evaluate or process the expression can be added here
}

export class RelationalExpression extends Expression {
  lhs: Expression;
  operator: KindType;
  rhs: Expression;

  constructor(lhs: Expression, operator: KindType, rhs: Expression) {
    super();
    this.lhs = lhs;
    this.operator = operator;
    this.rhs = rhs;
  }

  // Method to evaluate or process the expression can be added here
}

export class CallExpression implements Expression {
  sub: Expression;
  arguments: Expression[];

  constructor(sub: Expression) {
    this.sub = sub;
    this.arguments = [];
  }

  addArgument(argument: Expression) {
    this.arguments.push(argument);
  }

  generate() {
    for (let i = this.arguments.length - 1; i >= 0; i--) {
      this.arguments[i].generate();
    }
    this.sub.generate();
    Generator.writeCode(Instruction.Call, this.arguments.length);
  }
}

export class GetElementExpression implements Expression {
  sub: Expression;
  index: Expression;

  constructor(sub: Expression, index: Expression) {
    this.sub = sub;
    this.index = index;
  }

  generate() {
    this.sub.generate();
    this.index.generate();
    Generator.writeCode(Instruction.GetElement);
  }
}
