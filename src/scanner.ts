import { Kind } from "./kind";
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
      return (
        char === "0" ||
        char === "1" ||
        char === "2" ||
        char === "3" ||
        char === "4" ||
        char === "5" ||
        char === "6" ||
        char === "7" ||
        char === "8" ||
        char === "9"
      );
    case CharType.StringLiteral:
      return 32 <= char.charCodeAt(0) && char.charCodeAt(0) <= 126;
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
        // TODO: scan identifier and keyword
        // result.push(new Token(Kind.Identifier, current));
        tokenIterResult = tokenIter.next();
        break;
      case CharType.OperatorAndPunctuator:
        // TODO: scan operator and punctuator
        // result.push(new Token(Kind.Operator, current));
        tokenIterResult = tokenIter.next();
        break;
      default:
        tokenIterResult = tokenIter.next();
        break;
    }

    // const token = scanToken(sourceCode);
    // result.push(token);
    // if (token.kind === Kind.EndOfToken) {
    //   break;
    // }
    // switch (key) {
    //   case value:
    //     break;
    //   default:
    //     break;
    // }
  }

  result.push(new Token(Kind.EndOfToken));
  return result;
};
