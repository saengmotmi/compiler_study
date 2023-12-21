import { Kind } from "./kind";
import { NodeFunction, Program } from "./node";
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
  // result.block = parseBlock(currentResult);
  skipCurrent(currentResult, Kind.RightBrace);
  return result;
};

const skipCurrent = (currentResult: IteratorResult<Token>, kind: Kind) => {
  if (currentResult.value.kind !== kind) {
    throw new Error(`Invalid syntax: expected ${kind}`);
  }

  currentResult = current.next();
  return currentResult;
};
