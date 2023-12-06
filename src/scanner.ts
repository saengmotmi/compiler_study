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
  const charCode = char.charCodeAt(0);
  switch (type) {
    case CharType.NumberLiteral:
      return charCode >= 48 && charCode <= 57; // '0' - '9'
    case CharType.StringLiteral:
      return charCode >= 32 && charCode <= 126; // Printable ASCII
    case CharType.IdentifierAndKeyword:
      return (
        (charCode >= 97 && charCode <= 122) || // 'a' - 'z'
        (charCode >= 65 && charCode <= 90) || // 'A' - 'Z'
        (charCode >= 48 && charCode <= 57) || // '0' - '9'
        char === "_"
      );
    case CharType.OperatorAndPunctuator:
      return [
        "+",
        "-",
        "*",
        "/",
        "%",
        "=",
        "!",
        "<",
        ">",
        "&",
        "|",
        "^",
        "~",
        "?",
        ":",
        ".",
        ",",
        ";",
        "(",
        ")",
        "[",
        "]",
        "{",
        "}",
      ].includes(char);
    default:
      return false;
  }
};

const accumulateStringWhileCondition = (
  condition: (char: string) => boolean
): string => {
  let result = "";
  while (!tokenIterResult.done && condition(tokenIterResult.value)) {
    result += tokenIterResult.value;
    tokenIterResult = tokenIter.next();
  }
  return result;
};

const scanNumberLiteral = (): Token => {
  const number = accumulateStringWhileCondition((char) =>
    isCharType(char, CharType.NumberLiteral)
  );
  return new Token(Kind.NumberLiteral, number);
};

const scanStringLiteral = (): Token => {
  let result = "";

  // 첫 번째 따옴표 건너뛰기
  tokenIterResult = tokenIter.next();

  while (
    !tokenIterResult.done &&
    tokenIterResult.value !== '"' &&
    tokenIterResult.value !== "'"
  ) {
    result += tokenIterResult.value;
    tokenIterResult = tokenIter.next();
  }

  // 마지막 따옴표 건너뛰기
  tokenIterResult = tokenIter.next();

  return new Token(Kind.StringLiteral, result);
};

const scanIdentifierAndKeyword = (): Token => {
  const identifier = accumulateStringWhileCondition((char) =>
    isCharType(char, CharType.IdentifierAndKeyword)
  );
  const kind = toKind(identifier);
  return new Token(kind === Kind.Unknown ? Kind.Identifier : kind, identifier);
};

const scanOperatorAndPunctuator = (): Token => {
  let string = accumulateStringWhileCondition((char) =>
    isCharType(char, CharType.OperatorAndPunctuator)
  );
  if (!string) {
    throw new Error(tokenIterResult.value + " 사용할 수 없는 문자입니다.");
  }
  return new Token(toKind(string), string);
};

export const getCharType = (char: string): CharType => {
  if (["", " ", "\\t", "\\r", "\\n"].includes(char)) {
    return CharType.Whitespace;
  }
  if (isCharType(char, CharType.NumberLiteral)) {
    return CharType.NumberLiteral;
  }
  if (char === '"' || char === "'") {
    return CharType.StringLiteral;
  }
  if (isCharType(char, CharType.IdentifierAndKeyword)) {
    return CharType.IdentifierAndKeyword;
  }
  if (isCharType(char, CharType.OperatorAndPunctuator)) {
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
    const currentType = getCharType(tokenIterResult.value);

    switch (currentType) {
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
