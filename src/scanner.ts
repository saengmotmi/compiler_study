import { Kind, toKind } from "./kind";
import { Token } from "./token";

const CharType = {
  Unknown: "Unknown",
  Whitespace: "Whitespace",
  NumberLiteral: "NumberLiteral",
  StringLiteral: "StringLiteral",
  IdentifierAndKeyword: "IdentifierAndKeyword",
  OperatorAndPunctuator: "OperatorAndPunctuator",
} as const;

type CharType = (typeof CharType)[keyof typeof CharType];

const isCharType = (char: string, type: CharType) => {
  switch (type) {
    case CharType.NumberLiteral:
      return char >= "0" && char <= "9";
    case CharType.StringLiteral:
      return 32 <= char.charCodeAt(0) && char.charCodeAt(0) <= 126;
    case CharType.IdentifierAndKeyword:
      return (
        (char >= "a" && char <= "z") ||
        (char >= "A" && char <= "Z") ||
        (char >= "0" && char <= "9") ||
        char === "_"
      );
    case CharType.OperatorAndPunctuator:
      return (
        char === "+" ||
        char === "-" ||
        char === "*" ||
        char === "/" ||
        char === "%" ||
        char === "=" ||
        char === "!" ||
        char === "<" ||
        char === ">" ||
        char === "&" ||
        char === "|" ||
        char === "^" ||
        char === "~" ||
        char === "?" ||
        char === ":" ||
        char === "." ||
        char === "," ||
        char === ";" ||
        char === "(" ||
        char === ")" ||
        char === "[" ||
        char === "]" ||
        char === "{" ||
        char === "}"
      );
    default:
      return false;
  }
};

const scanNumberLiteral = (): Token => {
  let result = "";
  // TODO: 실수(real number)에 대한 처리
  while (isCharType(tokenIterResult.value, CharType.NumberLiteral)) {
    result += tokenIterResult.value;
    tokenIterResult = tokenIter.next();
  }
  return new Token(Kind.NumberLiteral, result);
};

const scanStringLiteral = (): Token => {
  let result = "";

  while (isCharType(tokenIterResult.value, CharType.StringLiteral)) {
    if (tokenIterResult.value === '"' || tokenIterResult.value === "'") {
      tokenIterResult = tokenIter.next(); // skip quote
    }
    result += tokenIterResult.value;
    tokenIterResult = tokenIter.next();
  }
  return new Token(Kind.StringLiteral, result);
};

const scanIdentifierAndKeyword = (): Token => {
  let result = "";

  while (isCharType(tokenIterResult.value, CharType.IdentifierAndKeyword)) {
    result += tokenIterResult.value;
    tokenIterResult = tokenIter.next();
  }

  const kind = toKind(result);
  if (kind === Kind.Unknown) {
    return new Token(Kind.Identifier, result);
  }
  return new Token(kind);
};

const scanOperatorAndPunctuator = (): Token => {
  let string = "";
  let currentChar = tokenIterResult.value;

  // 연산자와 구두점 문자를 스캔합니다.
  while (
    !tokenIterResult.done &&
    isCharType(currentChar, CharType.OperatorAndPunctuator)
  ) {
    string += currentChar;
    tokenIterResult = tokenIter.next();
    currentChar = tokenIterResult.value;
  }

  // 유효한 연산자/구두점 토큰을 찾을 때까지 마지막 문자를 제거합니다.
  // TODO: string이 ()이 된 경우 이터레이터를 앞으로 되돌려야 하는데 타입스크립트는 이터레이터를 앞으로 되돌릴 수 없습니다.
  // while (string && toKind(string) === Kind.Unknown) {
  // string = string.slice(0, -1);
  // current--; (타입스크립트에서는 current의 위치를 직접 조정할 수 없습니다.)
  // }

  // 스캔된 문자열이 비어있는 경우, 오류를 출력하고 종료합니다.
  if (!string) {
    console.error(currentChar + " 사용할 수 없는 문자입니다.");
    process.exit(1);
  }

  return new Token(toKind(string), string);
};

export const getCharType = (char: string) => {
  if (
    char === "" ||
    char === " " ||
    char === "\\t" ||
    char === "\\r" ||
    char === "\\n"
  ) {
    return CharType.Whitespace;
  }
  if (char >= "0" && char <= "9") {
    return CharType.NumberLiteral;
  }
  if (char === '"' || char === "'") {
    return CharType.StringLiteral;
  }
  if (
    (char >= "a" && char <= "z") ||
    (char >= "A" && char <= "Z") ||
    (char >= "0" && char <= "9") ||
    char === "_"
  ) {
    return CharType.IdentifierAndKeyword;
  }
  if (
    char === "+" ||
    char === "-" ||
    char === "*" ||
    char === "/" ||
    char === "%" ||
    char === "=" ||
    char === "!" ||
    char === "<" ||
    char === ">" ||
    char === "&" ||
    char === "|" ||
    char === "^" ||
    char === "~" ||
    char === "?" ||
    char === ":" ||
    char === "." ||
    char === "," ||
    char === ";" ||
    char === "(" ||
    char === ")" ||
    char === "[" ||
    char === "]" ||
    char === "{" ||
    char === "}"
  ) {
    return CharType.OperatorAndPunctuator;
  }
  return CharType.Unknown;
};

let tokenIter: Iterator<string>;
let tokenIterResult: IteratorResult<string>;

export const scan = (sourceCode: string): Token[] => {
  const result: Token[] = [];

  tokenIter = sourceCode[Symbol.iterator]();
  tokenIterResult = tokenIter.next();

  while (!tokenIterResult.done) {
    const current = tokenIterResult.value;

    switch (getCharType(current)) {
      case CharType.Whitespace:
        tokenIterResult = tokenIter.next();
        break;
      case CharType.NumberLiteral:
        result.push(scanNumberLiteral());
        break;
      case CharType.StringLiteral:
        result.push(scanStringLiteral());
        break;
      case CharType.IdentifierAndKeyword:
        result.push(scanIdentifierAndKeyword());
        break;
      case CharType.OperatorAndPunctuator:
        result.push(scanOperatorAndPunctuator());
        break;
      default:
        tokenIterResult = tokenIter.next();
        break;
    }
  }

  result.push(new Token(Kind.EndOfToken));
  return result;
};
