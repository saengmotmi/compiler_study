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

export const getCharType = (char: string) => {
  if (char === " " || char === "\t" || char === "\r" || char === "\n") {
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
  return CharType.Unknown;
};

export const scan = (sourceCode: string): Token[] => {
  const result: Token[] = [];

  const tokens = [...sourceCode];

  while (tokens.length > 0) {
    const current = tokens.shift() as string;

    switch (getCharType(current)) {
      case CharType.Whitespace:
        break;
      case CharType.NumberLiteral:
        result.push(new Token(Kind.NumberLiteral, current));
        break;
      case CharType.StringLiteral:
        // TODO: scan string literal
        // result.push(new Token(Kind.StringLiteral, current));
        break;
      case CharType.IdentifierAndKeyword:
        // TODO: scan identifier and keyword
        // result.push(new Token(Kind.Identifier, current));
        break;

      default:
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
