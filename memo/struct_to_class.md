> C++ 코드를 TypeScript로 포팅할 때 구조체를 어떻게 클래스로 변환할 수 있을까요? (GPT)

이 C++ 코드는 `struct`를 사용하여 `Token`이라는 구조체를 정의하고 있습니다. 이 구조체는 두 개의 멤버를 가지고 있으며, 이들은 각각 `kind`와 `string`이라는 이름을 가집니다. `kind`는 `Kind` 열거형의 `Unknown` 값으로 초기화되고, `string`은 표준 문자열 타입을 사용합니다. 이 코드를 TypeScript로 포팅할 때 고려해야 할 몇 가지 주요 사항이 있습니다.

1. **구조체와 클래스**: TypeScript에는 C++과 같은 구조체가 없습니다. 대신, 클래스를 사용하여 유사한 구조를 만들 수 있습니다. TypeScript의 클래스는 데이터와 메서드를 캡슐화하는 데 사용됩니다.

2. **타입 및 기본값 할당**: TypeScript에서는 속성의 타입을 명시적으로 선언해야 하며, 기본값 할당도 가능합니다.

3. **열거형(Enum)**: TypeScript에도 열거형이 있으며, C++의 열거형과 유사한 방식으로 사용됩니다.

위의 C++ 코드를 TypeScript로 포팅하면 다음과 같이 될 수 있습니다:

```typescript
enum Kind {
  Unknown, // 다른 Kind 열거형 멤버들도 필요에 따라 추가
}

class Token {
  kind: Kind = Kind.Unknown;
  string: string;

  constructor() {
    this.string = "";
  }
}
```

여기서 주의할 점은 TypeScript에서 클래스 멤버 변수를 선언할 때 명시적으로 타입을 지정해야 한다는 것입니다. 또한, TypeScript의 클래스는 생성자를 통해 초기화를 수행할 수 있으므로, `string` 멤버 변수에 대한 기본값을 생성자에서 설정해 주었습니다. 이렇게 하면 C++ 코드의 의미를 잘 살리면서 TypeScript로 올바르게 포팅할 수 있습니다.
