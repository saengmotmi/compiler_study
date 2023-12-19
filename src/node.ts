import { Kind } from "./kind";

export class Program {
  functions: NodeFunction[]; // Function 객체의 배열로 정의합니다.

  constructor() {
    this.functions = [];
  }
}

export class Statement {}
export class Expression {}

export class NodeFunction extends Statement {
  name?: string;
  parameters?: string[];
  block?: Statement[]; // Statement 객체의 배열로 정의합니다.

  // NOTE: 생성자가 불필요한가...?
  constructor(name?: string, parameters?: string[], block?: Statement[]) {
    super(); // 상속받은 클래스의 생성자를 호출합니다.
    this.name = name;
    this.parameters = parameters;
    this.block = block;
  }
}

export class Return extends Statement {
  expression: Expression;

  constructor(expression: Expression) {
    super();
    this.expression = expression;
  }
}

export class Variable extends Statement {
  name: string;
  expression: Expression;

  constructor(name: string, expression: Expression) {
    super();
    this.name = name;
    this.expression = expression;
  }
}

export class For extends Statement {
  variable: Variable;
  condition: Expression;
  increment: Expression;
  block: Statement[];

  constructor(
    variable: Variable,
    condition: Expression,
    increment: Expression,
    block: Statement[]
  ) {
    super();
    this.variable = variable;
    this.condition = condition;
    this.increment = increment;
    this.block = block;
  }
}

export class Break extends Statement {}
export class Continue extends Statement {}

export class If extends Statement {
  conditions: Expression;
  blocks: Statement[];
  elseBlock?: Statement[];

  constructor(
    conditions: Expression,
    blocks: Statement[],
    elseBlock: Statement[]
  ) {
    super();
    this.conditions = conditions;
    this.blocks = blocks;
    this.elseBlock = elseBlock;
  }
}

export class Print extends Statement {
  lineFeed: boolean = false;
  args: Expression[]; // NOTE: arguments는 예약어라서 args로 대체

  constructor(lineFeed: boolean, args: Expression[]) {
    super();
    this.lineFeed = lineFeed;
    this.args = args;
  }
}

export class ExpressionStatement extends Statement {
  expression: Expression;

  constructor(expression: Expression) {
    super();
    this.expression = expression;
  }
}

export class Or extends Expression {
  left: Expression;
  right: Expression;

  constructor(left: Expression, right: Expression) {
    super();
    this.left = left;
    this.right = right;
  }
}

export class And extends Expression {
  left: Expression;
  right: Expression;

  constructor(left: Expression, right: Expression) {
    super();
    this.left = left;
    this.right = right;
  }
}

export class Relational extends Expression {
  kind: Kind;
  left: Expression;
  right: Expression;

  constructor(kind: Kind, left: Expression, right: Expression) {
    super();
    this.kind = kind;
    this.left = left;
    this.right = right;
  }
}

export class Arithmetic extends Expression {
  kind: Kind;
  left: Expression;
  right: Expression;

  constructor(kind: Kind, left: Expression, right: Expression) {
    super();
    this.kind = kind;
    this.left = left;
    this.right = right;
  }
}

export class Unary extends Expression {
  kind: Kind;
  sub: Expression;

  constructor(kind: Kind, sub: Expression) {
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
  sub: Expression;
  index: Expression;
  value: Expression;

  constructor(sub: Expression, index: Expression, value: Expression) {
    super();
    this.sub = sub;
    this.index = index;
    this.value = value;
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
  name: string;
  value: Expression;

  constructor(name: string, value: Expression) {
    super();
    this.name = name;
    this.value = value;
  }
}

export class NullLiteral extends Expression {}

export class BoolLiteral extends Expression {
  value: boolean = false;
}

export class NumberLiteral extends Expression {
  value: number = 0;
}

export class StringLiteral extends Expression {
  value: string;

  constructor(value: string) {
    super();
    this.value = value;
  }
}

export class ArrayLiteral extends Expression {
  values: Expression[];

  constructor(values: Expression[]) {
    super();
    this.values = values;
  }
}

export class MapLiteral extends Expression {
  values: Expression[];

  constructor(values: Expression[]) {
    super();
    this.values = values;
  }
}
