export const Kind = {
  Unknown: "#unknown",
  EndOfToken: "#EndOfToken",
  NullLiteral: "null",
  TrueLiteral: "true",
  FalseLiteral: "false",
  NumberLiteral: "#Number",
  StringLiteral: "#String",
  Identifier: "#Identifier",

  Function: "function",
  Return: "return",
  Variable: "var",
  For: "for",
  Break: "break",
  Continue: "continue",
  If: "if",
  Elif: "elif",
  Else: "else",
  Print: "print",
  PrintLine: "println",

  LogicalAnd: "and",
  LogicalOr: "or",
  Assignment: "=",
  Add: "+",
  Subtract: "-",
  Multiply: "*",
  Divide: "/",
  Modulo: "%",
  Equal: "==",
  NotEqual: "!=",

  LessThan: "<",
  GreaterThan: ">",
  LessThanOrEqual: "<=",
  GreaterThanOrEqual: ">=",

  Comma: ",",
  Colon: ":",
  Semicolon: ";",
  Dot: ".",
  LeftParen: "(",
  RightParen: ")",
  LeftBrace: "{",
  RightBrace: "}",
  LeftBracket: "[",
  RightBracket: "]",
} as const;

export const stringToKind = new Map([
  ["#unknown", Kind.Unknown],
  ["#EndOfToken", Kind.EndOfToken],
  ["null", Kind.NullLiteral],
  ["true", Kind.TrueLiteral],
  ["false", Kind.FalseLiteral],
  ["#Number", Kind.NumberLiteral],
  ["#String", Kind.StringLiteral],
  ["#Identifier", Kind.Identifier],

  ["function", Kind.Function],
  ["return", Kind.Return],
  ["var", Kind.Variable],
  ["for", Kind.For],
  ["break", Kind.Break],
  ["continue", Kind.Continue],
  ["if", Kind.If],
  ["elif", Kind.Elif],
  ["else", Kind.Else],
  ["print", Kind.Print],
  ["println", Kind.PrintLine],

  ["and", Kind.LogicalAnd],
  ["or", Kind.LogicalOr],

  ["=", Kind.Assignment],

  ["+", Kind.Add],
  ["-", Kind.Subtract],
  ["*", Kind.Multiply],
  ["/", Kind.Divide],
  ["%", Kind.Modulo],

  ["==", Kind.Equal],
  ["!=", Kind.NotEqual],
  ["<", Kind.LessThan],
  [">", Kind.GreaterThan],
  ["<=", Kind.LessThanOrEqual],
  [">=", Kind.GreaterThanOrEqual],

  [",", Kind.Comma],
  [":", Kind.Colon],
  [";", Kind.Semicolon],
  [".", Kind.Dot],
  ["(", Kind.LeftParen],
  [")", Kind.RightParen],
  ["{", Kind.LeftBrace],
  ["}", Kind.RightBrace],
  ["[", Kind.LeftBracket],
  ["]", Kind.RightBracket],
]);

export type KindType = (typeof Kind)[keyof typeof Kind];

export const toKind = (str: string) => {
  return stringToKind.get(str) ?? Kind.Unknown;
};
