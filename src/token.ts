import { Kind } from "./kind";

// 원래 C++에서는 struct로 정의하는 코드였음
export class Token {
  kind: Kind;
  string: string;

  constructor(kind: Kind = Kind.Unknown, string: string = "") {
    this.kind = kind;
    this.string = string;
  }
}
