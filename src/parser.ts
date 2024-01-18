import { Kind, KindType, stringToKind } from "./kind";
import {
  And,
  Break,
  Continue,
  Expression,
  ExpressionStatement,
  For,
  GetElement,
  GetVariable,
  IdentifierExpression,
  If,
  NodeFunction,
  NumberLiteral,
  Or,
  Print,
  Program,
  Return,
  SetElement,
  SetVariable,
  Statement,
  StringLiteral,
  UnaryExpression,
  Variable,
  RelationalExpression,
  ArithmeticExpression,
  NullLiteral,
  BoolLiteral,
  ArrayLiteral,
  MapLiteral,
  CallExpression,
  GetElementExpression,
} from "./node";
import { Token } from "./token";

export class Parser {
  private static index: number;

  public parse(tokens: Token[]): Program {
    const result = new Program();
    Parser.index = 0;

    while (tokens[Parser.index].kind !== Kind.EndOfToken) {
      switch (tokens[Parser.index].kind) {
        case Kind.Function: {
          result.functions.push(this.parseFunction(tokens));
          break;
        }
        default: {
          throw new Error(`${tokens[Parser.index]} 잘못된 구문입니다.`);
        }
      }
    }

    return result;
  }

  private parseFunction(tokens: Token[]): NodeFunction {
    const result = new NodeFunction();
    this.skipCurrent(tokens, Kind.Function);

    result.name = tokens[Parser.index].string;
    this.skipCurrent(tokens, Kind.Identifier);

    this.skipCurrent(tokens, Kind.LeftParen);
    if (tokens[Parser.index].kind !== Kind.RightParen) {
      do {
        result.parameters.push(tokens[Parser.index].string);
        this.skipCurrent(tokens, Kind.Identifier);
      } while (this.skipCurrentIf(tokens, Kind.Comma));
    }
    this.skipCurrent(tokens, Kind.RightParen);

    this.skipCurrent(tokens, Kind.LeftBrace);
    result.block = this.parseBlock(tokens);
    this.skipCurrent(tokens, Kind.RightBrace);

    return result;
  }

  private parseBlock(tokens: Token[]): Statement[] {
    const result: Statement[] = [];

    while (tokens[Parser.index].kind !== Kind.RightBrace) {
      switch (tokens[Parser.index].kind) {
        // 각각의 경우에 대한 처리
        case Kind.Variable:
          result.push(this.parseVariable(tokens));
          break;
        case Kind.For:
          result.push(this.parseFor(tokens));
          break;
        case Kind.If:
          result.push(this.parseIf(tokens));
          break;
        // ... 기타 다른 statement 종류에 대한 처리
        case Kind.Print:
        case Kind.PrintLine:
          result.push(this.parsePrint(tokens));
          break;
        case Kind.Return:
          result.push(this.parseReturn(tokens));
          break;
        case Kind.Break:
          result.push(this.parseBreak(tokens));
          break;
        case Kind.Continue:
          result.push(this.parseContinue(tokens));
          break;
        case Kind.EndOfToken:
          throw new Error(`${tokens[Parser.index]} 잘못된 구문입니다.`);
        default:
          result.push(this.parseExpressionStatement(tokens));
      }
    }

    return result;
  }

  private parseVariable(tokens: Token[]): Variable {
    const result = new Variable();
    this.skipCurrent(tokens, Kind.Variable);
    result.name = tokens[Parser.index].string;
    this.skipCurrent(tokens, Kind.Identifier);
    this.skipCurrent(tokens, Kind.Assignment);
    result.expression = this.parseExpression(tokens);
    this.skipCurrent(tokens, Kind.Semicolon);
    return result;
  }

  private parseFor(tokens: Token[]): For {
    const result = new For();
    this.skipCurrent(tokens, Kind.For);

    const variable = new Variable();
    variable.name = tokens[Parser.index].string;
    this.skipCurrent(tokens, Kind.Identifier);
    this.skipCurrent(tokens, Kind.Assignment);

    variable.expression = this.parseExpression(tokens);
    if (!variable.expression) {
      throw new Error("for 문에 초기화식이 없습니다.");
    }
    this.skipCurrentIf(tokens, Kind.Comma);

    result.condition = this.parseExpression(tokens);
    if (!result.condition) {
      throw new Error("for 문에 조건식이 없습니다.");
    }
    this.skipCurrent(tokens, Kind.Comma);

    result.increment = this.parseExpression(tokens);
    if (!result.increment) {
      throw new Error("for 문에 증감식이 없습니다.");
    }
    this.skipCurrent(tokens, Kind.LeftBrace);

    result.block = this.parseBlock(tokens);
    this.skipCurrent(tokens, Kind.RightBrace);

    return result;
  }

  private parseIf(tokens: Token[]): If {
    const result = new If();
    this.skipCurrent(tokens, Kind.If);
    do {
      const condition = this.parseExpression(tokens);
      if (!condition) {
        throw new Error("if 문에 조건식이 없습니다.");
      }
      result.conditions = condition;

      this.skipCurrent(tokens, Kind.LeftBrace);
      result.blocks = this.parseBlock(tokens);
      this.skipCurrent(tokens, Kind.RightBrace);
    } while (this.skipCurrentIf(tokens, Kind.Elif));

    if (this.skipCurrentIf(tokens, Kind.Else)) {
      this.skipCurrent(tokens, Kind.LeftBrace);
      result.elseBlock = this.parseBlock(tokens);
      this.skipCurrent(tokens, Kind.RightBrace);
    }

    return result;
  }

  private parsePrint(tokens: Token[]): Print {
    const result = new Print();
    result.lineFeed = tokens[Parser.index].kind === Kind.PrintLine;
    this.skipCurrent(tokens, Kind.PrintLine);
    if (tokens[Parser.index].kind !== Kind.Semicolon) {
      do {
        result.args.push(this.parseExpression(tokens));
      } while (this.skipCurrentIf(tokens, Kind.Comma));
    }
    this.skipCurrent(tokens, Kind.Semicolon);
    return result;
  }

  private parseReturn(tokens: Token[]): Return {
    const result = new Return();
    this.skipCurrent(tokens, Kind.Return);
    result.expression = this.parseExpression(tokens);
    if (!result.expression) {
      throw new Error("return 문에 식이 없습니다.");
    }
    this.skipCurrent(tokens, Kind.Semicolon);
    return result;
  }

  private parseBreak(tokens: Token[]): Break {
    this.skipCurrent(tokens, Kind.Break);
    this.skipCurrent(tokens, Kind.Semicolon);
    return new Break();
  }

  private parseContinue(tokens: Token[]): Continue {
    this.skipCurrent(tokens, Kind.Continue);
    this.skipCurrent(tokens, Kind.Semicolon);
    return new Continue();
  }

  private parseExpressionStatement(tokens: Token[]): ExpressionStatement {
    const result = new ExpressionStatement();
    result.expression = this.parseExpression(tokens);
    this.skipCurrent(tokens, Kind.Semicolon);
    return result;
  }

  private parseExpression(tokens: Token[]): Expression {
    // 여기에서 표현식 파싱 로직을 구현합니다.
    // 이 예제에서는 단순화를 위해 'parseAssignment'를 호출하는 것으로 가정합니다.
    return this.parseAssignment(tokens);
  }

  private parseAssignment(tokens: Token[]): Expression {
    let result = this.parseOr(tokens);
    if (tokens[Parser.index].kind !== Kind.Assignment) {
      return result;
    }
    this.skipCurrent(tokens, Kind.Assignment);

    // TypeScript에서는 instanceof를 사용할 때, 클래스명만을 사용합니다.
    if (result instanceof GetVariable) {
      const setVariable = new SetVariable();
      setVariable.name = result.name;
      setVariable.value = this.parseAssignment(tokens);
      return setVariable;
    }

    if (result instanceof GetElement) {
      const setElement = new SetElement();
      setElement.sub = result.sub;
      setElement.index = result.index;
      setElement.value = this.parseAssignment(tokens);
      return setElement;
    }

    throw new Error("잘못된 대입 연산 식입니다.");
  }

  private parseOr(tokens: Token[]): Expression {
    let result = this.parseAnd(tokens);
    while (this.skipCurrentIf(tokens, Kind.LogicalOr)) {
      const temp = new Or();
      temp.left = result;
      temp.right = this.parseAnd(tokens);
      result = temp;
    }
    return result;
  }

  private parseAnd(tokens: Token[]): Expression {
    let result = this.parseRelational(tokens);
    while (this.skipCurrentIf(tokens, Kind.LogicalAnd)) {
      const temp = new And();
      temp.left = result;
      temp.right = this.parseRelational(tokens);
      result = temp;
    }
    return result;
  }

  private parseRelational(tokens: Token[]): Expression {
    let lhs = this.parseArithmetic1(tokens);

    while (this.isRelationalOperator(tokens[Parser.index].kind)) {
      const operator = tokens[Parser.index].kind;
      this.skipCurrent(tokens, operator);
      const rhs = this.parseArithmetic1(tokens);
      lhs = new RelationalExpression(lhs, operator, rhs);
    }

    return lhs;
  }

  private isRelationalOperator(
    kind: "==" | "!=" | "<" | ">" | "<=" | ">="
  ): boolean {
    return [
      Kind.Equal,
      Kind.NotEqual,
      Kind.LessThan,
      Kind.GreaterThan,
      Kind.LessThanOrEqual,
      Kind.GreaterThanOrEqual,
    ].includes(kind);
  }

  private parseArithmetic1(tokens: Token[]): Expression {
    let lhs = this.parseArithmetic2(tokens);

    while (
      tokens[Parser.index].kind === Kind.Add ||
      tokens[Parser.index].kind === Kind.Subtract
    ) {
      const operator = tokens[Parser.index].kind;
      this.skipCurrent(tokens, operator);
      const rhs = this.parseArithmetic2(tokens);
      lhs = new ArithmeticExpression(lhs, operator, rhs);
    }

    return lhs;
  }

  private parseArithmetic2(tokens: Token[]): Expression {
    let lhs = this.parseUnary(tokens);

    while (
      [Kind.Multiply, Kind.Divide, Kind.Modulo].includes(
        tokens[Parser.index].kind
      )
    ) {
      const operator = tokens[Parser.index].kind;
      this.skipCurrent(tokens, operator);
      const rhs = this.parseUnary(tokens);
      lhs = new ArithmeticExpression(lhs, operator, rhs);
    }

    return lhs;
  }

  private parseUnary(tokens: Token[]): Expression {
    if ([Kind.Add, Kind.Subtract].includes(tokens[Parser.index].kind)) {
      const operator = tokens[Parser.index].kind;
      this.skipCurrent(tokens, operator);
      const operand = this.parseUnary(tokens);
      return new UnaryExpression(operator, operand);
    }

    return this.parseOperand(tokens); // 기본 피연산자를 파싱합니다.
  }

  private parseOperand(tokens: Token[]): Expression {
    let result: Expression;

    switch (tokens[Parser.index].kind) {
      case Kind.NullLiteral:
        result = this.parseNullLiteral(tokens);
        break;
      case Kind.TrueLiteral:
      case Kind.FalseLiteral:
        result = this.parseBooleanLiteral(tokens);
        break;
      case Kind.NumberLiteral:
        result = this.parseNumberLiteral(tokens);
        break;
      case Kind.StringLiteral:
        result = this.parseStringLiteral(tokens);
        break;
      case Kind.LeftBracket:
        result = this.parseListLiteral(tokens);
        break;
      case Kind.LeftBrace:
        result = this.parseMapLiteral(tokens);
        break;
      case Kind.Identifier:
        result = this.parseIdentifier(tokens);
        break;
      case Kind.LeftParen:
        result = this.parseInnerExpression(tokens);
        break;
      default:
        throw new Error("잘못된 식입니다.");
    }
    return this.parsePostfix(tokens, result);
  }

  private parseNullLiteral(tokens: Token[]): NullLiteral {
    this.skipCurrent(tokens, Kind.NullLiteral);
    return new NullLiteral();
  }

  private parseBooleanLiteral(tokens: Token[]): BoolLiteral {
    const value = tokens[Parser.index].kind === Kind.TrueLiteral;
    this.skipCurrent(tokens, Kind.TrueLiteral);
    return new BoolLiteral(value);
  }

  // 기타 함수들도 유사한 방식으로 구현...

  private parseNumberLiteral(tokens: Token[]): NumberLiteral {
    const value = parseFloat(tokens[Parser.index].string);
    this.skipCurrent(tokens, Kind.NumberLiteral);
    return new NumberLiteral(value);
  }

  private parseStringLiteral(tokens: Token[]): StringLiteral {
    const value = tokens[Parser.index].string;
    this.skipCurrent(tokens, Kind.StringLiteral);
    return new StringLiteral(value);
  }

  private parseIdentifier(tokens: Token[]): IdentifierExpression {
    const name = tokens[Parser.index].string;
    this.skipCurrent(tokens, Kind.Identifier);
    return new IdentifierExpression(name);
  }

  private parseParenthesizedExpression(tokens: Token[]): Expression {
    this.skipCurrent(tokens, Kind.LeftParen);
    const expr = this.parseExpression(tokens);
    this.skipCurrent(tokens, Kind.RightParen);
    return expr;
  }

  private parseListLiteral(tokens: Token[]): ArrayLiteral {
    const result = new ArrayLiteral();
    this.skipCurrent(tokens, Kind.LeftBracket);
    while (tokens[Parser.index].kind !== Kind.RightBracket) {
      result.values.push(this.parseExpression(tokens));
      this.skipCurrentIf(tokens, Kind.Comma);
    }
    this.skipCurrent(tokens, Kind.RightBracket);
    return result;
  }

  private parseMapLiteral(tokens: Token[]): MapLiteral {
    const result = new MapLiteral();
    this.skipCurrent(tokens, Kind.LeftBrace);
    while (tokens[Parser.index].kind !== Kind.RightBrace) {
      const key = tokens[Parser.index].string;
      this.skipCurrent(tokens, Kind.StringLiteral);
      this.skipCurrent(tokens, Kind.Colon);
      const value = this.parseExpression(tokens);
      result.values.set(key, value);
      this.skipCurrentIf(tokens, Kind.Comma);
    }
    this.skipCurrent(tokens, Kind.RightBrace);
    return result;
  }

  private parseInnerExpression(tokens: Token[]): Expression {
    this.skipCurrent(tokens, Kind.LeftParen);
    const expr = this.parseExpression(tokens);
    this.skipCurrent(tokens, Kind.RightParen);
    return expr;
  }

  private parsePostfix(tokens: Token[], expression: Expression): Expression {
    while (true) {
      if (tokens[Parser.index].kind === Kind.LeftParen) {
        expression = this.parseCall(tokens, expression);
      } else if (tokens[Parser.index].kind === Kind.LeftBracket) {
        expression = this.parseElement(tokens, expression);
      } else {
        break;
      }
    }
    return expression;
  }

  private parseCall(tokens: Token[], sub: Expression): Expression {
    const result = new CallExpression(sub);
    this.skipCurrent(tokens, Kind.LeftParen);
    while (tokens[Parser.index].kind !== Kind.RightParen) {
      result.arguments.push(this.parseExpression(tokens));
      this.skipCurrentIf(tokens, Kind.Comma);
    }
    this.skipCurrent(tokens, Kind.RightParen);
    return result;
  }

  private parseElement(tokens: Token[], sub: Expression): Expression {
    const result = new GetElementExpression(sub, this.parseExpression(tokens));
    this.skipCurrent(tokens, Kind.LeftBracket);
    this.skipCurrent(tokens, Kind.RightBracket);
    return result;
  }

  private skipCurrent(tokens: Token[], kind: KindType) {
    if (tokens[Parser.index].kind !== kind) {
      throw new Error(`${kind} 토큰이 필요합니다.`);
    }
    Parser.index++;
  }

  private skipCurrentIf(tokens: Token[], kind: KindType): boolean {
    if (tokens[Parser.index].kind === kind) {
      Parser.index++;
      return true;
    }
    return false;
  }

  // 나머지 메서드들도 유사하게 구현 ...
}

// Token, Program, Function 등 필요한 클래스와 열거형(Kind)도 정의 필요

// // Token 타입의 배열 선언
// let tokens: Token[] = [];

// // 이터레이터 선언
// let current: Iterator<Token>;

// export const parse = (tokenList: Token[]) => {
//   let result = new Program();

//   let currentResult = current.next();

//   while (!currentResult.done) {
//     if (currentResult.value.kind === Kind.Function) {
//       const parsedValue = parseFunction(currentResult);
//       parsedValue !== undefined && result.functions.push(parsedValue);
//     }

//     // 토큰 처리 로직
//   }
//   return result;
// };

// const parseFunction = (currentResult: IteratorResult<Token>) => {
//   const result = new NodeFunction();
//   skipCurrent(currentResult, Kind.Function);
//   result.name = currentResult.value.string;
//   skipCurrent(currentResult, Kind.Identifier);
//   skipCurrent(currentResult, Kind.LeftParen);

//   if (currentResult.value.kind !== Kind.RightParen) {
//     do {
//       result.parameters.push(currentResult.value.string);
//       skipCurrent(currentResult, Kind.Identifier);
//     } while (currentResult.value.kind === Kind.Comma);
//   }

//   skipCurrent(currentResult, Kind.RightParen);
//   skipCurrent(currentResult, Kind.LeftBrace);
//   result.block = parseBlock(currentResult);
//   skipCurrent(currentResult, Kind.RightBrace);
//   return result;
// };

// const parseBlock = (currentResult: IteratorResult<Token>) => {
//   const result: Statement[] = [];
//   while (currentResult.value.kind !== Kind.RightBrace) {
//     // const parsedValue = parseStatement(currentResult);
//     // parsedValue !== undefined && result.push(parsedValue);
//     if (currentResult.value.kind === Kind.EndOfToken) {
//       throw new Error("Invalid syntax: expected }");
//     }
//     if (currentResult.value.kind === Kind.Variable) {
//       const parsedValue = parseVariable(currentResult);
//       parsedValue !== undefined && result.push(parsedValue);
//       return result;
//     }
//     const parsedValue = parseExpressionStatement(currentResult);
//     parsedValue !== undefined && result.push(parsedValue);
//   }
//   return result;
// };

// const parseStatement = (currentResult: IteratorResult<Token>) => {
//   switch (currentResult.value.kind) {
//     case Kind.Return:
//       return parseReturn(currentResult);
//     case Kind.Variable:
//       return parseVariable(currentResult);
//     default:
//       throw new Error(`Invalid syntax: ${currentResult.value.string}`);
//   }
// };

// const parseReturn = (currentResult: IteratorResult<Token>) => {
//   skipCurrent(currentResult, Kind.Return);
//   const result = new Return(parseExpressionStatement(currentResult));
//   skipCurrent(currentResult, Kind.Semicolon);
//   return result;
// };

// const skipCurrentIf = (currentResult: IteratorResult<Token>, kind: Kind) => {
//   if (currentResult.value.kind === kind) {
//     currentResult = current.next();
//     return true;
//   }
//   return false;
// };

// const parseOr = (currentResult: IteratorResult<Token>) => {
//   const result = parseAnd(currentResult);
//   while (skipCurrentIf(currentResult, Kind.LogicalOr)) {
//     // const temp = new Or();
//     // temp.left = result;
//     // temp.right = parseAnd(currentResult);
//     // result = temp;
//   }
//   return result;
// };

// const parseAnd = (currentResult: IteratorResult<Token>) => {
//   // TODO: 구현
// };

// const parseAssignment = (currentResult: IteratorResult<Token>) => {
//   const result = parseOr(currentResult);
//   if (currentResult.value.kind !== Kind.Assignment) {
//     return result;
//   }
//   skipCurrent(currentResult, Kind.Assignment);
//   // if (result instanceof Variable) {
//   // }
//   // const a = new SetVariable();
//   // a.name = GetVariable.name
//   // a.expression = parseAssignment(currentResult);
//   // return result;
//   // if (result instanceof GetVariable) {
//   // }
//   // const a = new SetVariable();
//   // a.sub = GetElement.sub;
//   // a.index = GetElement.index;
//   // a.value = parseAssignment(currentResult);
//   // return result

//   return result;
// };

// const parseExpression = (currentResult: IteratorResult<Token>) => {
//   return parseAssignment(currentResult);
// };

// const parseExpressionStatement = (currentResult: IteratorResult<Token>) => {
//   const result = new ExpressionStatement();
//   const parsedValue = parseExpression(currentResult);
//   parsedValue !== undefined && (result.expression = parsedValue);
//   skipCurrent(currentResult, Kind.Semicolon);
//   return result;
// };

// const parseVariable = (currentResult: IteratorResult<Token>) => {
//   // TODO: 구현
//   const result = new Variable();
//   skipCurrent(currentResult, Kind.Variable);
//   result.name = currentResult.value.string;
//   skipCurrent(currentResult, Kind.Identifier);
//   skipCurrent(currentResult, Kind.Assignment);

//   const parsedValue = parseExpressionStatement(currentResult);
//   parsedValue !== undefined && (result.expression = parsedValue);
//   skipCurrent(currentResult, Kind.Semicolon);
//   return result;
// };

// const skipCurrent = (currentResult: IteratorResult<Token>, kind: Kind) => {
//   if (currentResult.value.kind !== kind) {
//     throw new Error(`Invalid syntax: expected ${kind}`);
//   }

//   currentResult = current.next();
//   return currentResult;
// };
