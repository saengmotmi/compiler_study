import { Kind, KindType } from "./kind";

// 원래 C++에서는 struct로 정의하는 코드였음
export class Token {
  kind: KindType;
  string: string;

  constructor(kind: KindType = Kind.Unknown, string: string = "") {
    this.kind = kind;
    this.string = string;
  }
}
