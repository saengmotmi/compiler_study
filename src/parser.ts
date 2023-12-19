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
    switch (currentResult.value.kind) {
      case Kind.Function:
        result.functions.push(parseFunction());
        break;
      // 다른 case 처리
    }

    // 토큰 처리 로직
  }
  return result;
};

const parseFunction = () => {
  const result = new NodeFunction();
};

const skipCurrent = (kind: Kind) => {};
