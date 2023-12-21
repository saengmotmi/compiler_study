import { Kind } from "./kind";
import {
  ExpressionStatement,
  GetElement,
  GetVariable,
  NodeFunction,
  Or,
  Program,
  Return,
  SetVariable,
  Statement,
  Variable,
} from "./node";
import { Token } from "./token";

// Token 타입의 배열 선언
let tokens: Token[] = [];

// 이터레이터 선언
let current: Iterator<Token>;

export const parse = (tokenList: Token[]) => {
  let result = new Program();

  let currentResult = current.next();

  while (!currentResult.done) {
    if (currentResult.value.kind === Kind.Function) {
      const parsedValue = parseFunction(currentResult);
      parsedValue !== undefined && result.functions.push(parsedValue);
    }

    // 토큰 처리 로직
  }
  return result;
};

const parseFunction = (currentResult: IteratorResult<Token>) => {
  const result = new NodeFunction();
  skipCurrent(currentResult, Kind.Function);
  result.name = currentResult.value.string;
  skipCurrent(currentResult, Kind.Identifier);
  skipCurrent(currentResult, Kind.LeftParen);

  if (currentResult.value.kind !== Kind.RightParen) {
    do {
      result.parameters.push(currentResult.value.string);
      skipCurrent(currentResult, Kind.Identifier);
    } while (currentResult.value.kind === Kind.Comma);
  }

  skipCurrent(currentResult, Kind.RightParen);
  skipCurrent(currentResult, Kind.LeftBrace);
  result.block = parseBlock(currentResult);
  skipCurrent(currentResult, Kind.RightBrace);
  return result;
};

const parseBlock = (currentResult: IteratorResult<Token>) => {
  const result: Statement[] = [];
  while (currentResult.value.kind !== Kind.RightBrace) {
    // const parsedValue = parseStatement(currentResult);
    // parsedValue !== undefined && result.push(parsedValue);
    if (currentResult.value.kind === Kind.EndOfToken) {
      throw new Error("Invalid syntax: expected }");
    }
    if (currentResult.value.kind === Kind.Variable) {
      const parsedValue = parseVariable(currentResult);
      parsedValue !== undefined && result.push(parsedValue);
      return result;
    }
    const parsedValue = parseExpressionStatement(currentResult);
    parsedValue !== undefined && result.push(parsedValue);
  }
  return result;
};

const parseStatement = (currentResult: IteratorResult<Token>) => {
  switch (currentResult.value.kind) {
    case Kind.Return:
      return parseReturn(currentResult);
    case Kind.Variable:
      return parseVariable(currentResult);
    default:
      throw new Error(`Invalid syntax: ${currentResult.value.string}`);
  }
};

const parseReturn = (currentResult: IteratorResult<Token>) => {
  skipCurrent(currentResult, Kind.Return);
  const result = new Return(parseExpressionStatement(currentResult));
  skipCurrent(currentResult, Kind.Semicolon);
  return result;
};

const skipCurrentIf = (currentResult: IteratorResult<Token>, kind: Kind) => {
  if (currentResult.value.kind === kind) {
    currentResult = current.next();
    return true;
  }
  return false;
};

const parseOr = (currentResult: IteratorResult<Token>) => {
  const result = parseAnd(currentResult);
  while (skipCurrentIf(currentResult, Kind.LogicalOr)) {
    // const temp = new Or();
    // temp.left = result;
    // temp.right = parseAnd(currentResult);
    // result = temp;
  }
  return result;
};

const parseAnd = (currentResult: IteratorResult<Token>) => {
  // TODO: 구현
};

const parseAssignment = (currentResult: IteratorResult<Token>) => {
  const result = parseOr(currentResult);
  if (currentResult.value.kind !== Kind.Assignment) {
    return result;
  }
  skipCurrent(currentResult, Kind.Assignment);
  // if (result instanceof Variable) {
  // }
  // const a = new SetVariable();
  // a.name = GetVariable.name
  // a.expression = parseAssignment(currentResult);
  // return result;
  // if (result instanceof GetVariable) {
  // }
  // const a = new SetVariable();
  // a.sub = GetElement.sub;
  // a.index = GetElement.index;
  // a.value = parseAssignment(currentResult);
  // return result

  return result;
};

const parseExpression = (currentResult: IteratorResult<Token>) => {
  return parseAssignment(currentResult);
};

const parseExpressionStatement = (currentResult: IteratorResult<Token>) => {
  const result = new ExpressionStatement();
  const parsedValue = parseExpression(currentResult);
  parsedValue !== undefined && (result.expression = parsedValue);
  skipCurrent(currentResult, Kind.Semicolon);
  return result;
};

const parseVariable = (currentResult: IteratorResult<Token>) => {
  // TODO: 구현
  const result = new Variable();
  skipCurrent(currentResult, Kind.Variable);
  result.name = currentResult.value.string;
  skipCurrent(currentResult, Kind.Identifier);
  skipCurrent(currentResult, Kind.Assignment);

  const parsedValue = parseExpressionStatement(currentResult);
  parsedValue !== undefined && (result.expression = parsedValue);
  skipCurrent(currentResult, Kind.Semicolon);
  return result;
};

const skipCurrent = (currentResult: IteratorResult<Token>, kind: Kind) => {
  if (currentResult.value.kind !== kind) {
    throw new Error(`Invalid syntax: expected ${kind}`);
  }

  currentResult = current.next();
  return currentResult;
};
