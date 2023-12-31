## Struct to Class

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

### 잘못된 구현 수정

C++에서 `result.push_back({Kind::EndOfToken})` 코드는 `result`라는 `vector`에 새로운 `Token` 객체를 추가하는 것입니다. 여기서 `{Kind::EndOfToken}`는 `Token` 구조체의 생성자에 인자를 전달하는 방식으로, `Token` 구조체에 대한 일시적인(임시) 객체를 생성합니다. 이때 `kind` 멤버는 `Kind::EndOfToken`으로 초기화되고, 다른 멤버들은 기본값으로 초기화됩니다.

TypeScript에서 이와 같은 작업을 수행하기 위해서는 몇 가지 조정이 필요합니다. TypeScript의 클래스에는 명시적인 생성자가 필요하며, 객체를 생성할 때 `new` 키워드를 사용해야 합니다. 또한, TypeScript의 배열에는 `push` 메서드를 사용하여 새로운 요소를 추가합니다.

먼저, `Token` 클래스를 수정하여 매개변수를 받는 생성자를 추가합니다:

```typescript
class Token {
  kind: Kind;
  string: string;

  constructor(kind: Kind = Kind.Unknown, string: string = "") {
    this.kind = kind;
    this.string = string;
  }
}
```

이제 TypeScript에서 `result.push(new Token(Kind.EndOfToken))`와 같은 코드를 작성할 수 있습니다. 여기서 `result`는 `Token[]` 타입의 배열이며, `new Token(Kind.EndOfToken)`은 새 `Token` 인스턴스를 생성하고 `kind`를 `Kind.EndOfToken`으로 초기화합니다. `string` 멤버는 기본값인 빈 문자열로 초기화됩니다.

따라서 C++ 코드 `result.push_back({Kind::EndOfToken})`는 TypeScript에서 다음과 같이 표현됩니다:

```typescript
result.push(new Token(Kind.EndOfToken));
```

이렇게 하면 TypeScript에서도 유사한 방식으로 `Token` 객체를 생성하고 배열에 추가할 수 있습니다.

## scan()

> auto scan(string)->vector<Token>;

C++에서 `auto` 키워드와 화살표 (`->`) 구문을 사용하는 것은 이른바 "후행 반환 타입(trailing return type)"을 지정하는 방법입니다. 이 문법은 특히 함수의 반환 타입이 복잡하거나, 함수 내부에서 정의되는 타입에 의존적일 때 유용합니다. 여기서 `scan` 함수는 `string`을 매개변수로 받아 `vector<Token>` 타입을 반환한다고 선언되어 있습니다.

```cpp
auto scan(string) -> vector<Token>;
```

TypeScript로 이를 포팅할 때는, TypeScript의 함수 선언 방식을 사용합니다. TypeScript에서는 함수의 반환 타입을 함수 선언 뒤에 콜론(`:`)과 함께 명시합니다. 따라서 위 C++ 함수를 TypeScript로 변환하면 다음과 같이 됩니다:

```typescript
function scan(inputString: string): Token[] {
  // 함수 구현
}
```

여기서 `Token[]`는 `vector<Token>`에 해당하는 TypeScript 타입입니다. TypeScript에서 배열은 요소 타입 뒤에 대괄호(`[]`)를 붙여 표현합니다. 이렇게 하면 C++의 후행 반환 타입을 TypeScript의 문법에 맞게 올바르게 표현할 수 있습니다.

## cout << \*current << "사용할 수 없는 문자입니다.";

이 C++ 코드는 `cout`을 사용하여 화면에 출력을 수행하는 명령입니다. `cout`은 C++의 표준 출력 스트림 객체로, 텍스트를 콘솔에 출력하는 데 사용됩니다.

```cpp
cout << *current << "사용할 수 없는 문자입니다.";
```

이 코드를 해석하면 다음과 같습니다:

- `*current`: `current`는 포인터 변수로 가정됩니다. `*current`는 이 포인터가 가리키는 값을 역참조하여 가져옵니다. 즉, `current`가 가리키는 위치의 데이터를 화면에 출력합니다.
- `"사용할 수 없는 문자입니다."`: 이 문자열은 직접 출력됩니다. 문자열 앞의 `<<` 연산자는 `cout`과 함께 사용되어, `*current`의 값 뒤에 이 문자열을 출력합니다.

따라서, 이 코드의 전체적인 의미는 `current` 포인터가 가리키는 값과 "사용할 수 없는 문자입니다."라는 문자열을 차례로 출력하는 것입니다. 예를 들어, `current`가 문자 'a'를 가리키고 있다면, 출력 결과는 "a사용할 수 없는 문자입니다."가 됩니다.

TypeScript에서는 `console.log`를 사용하여 유사한 출력을 수행할 수 있습니다. TypeScript에서 포인터는 없지만, 해당 변수의 값을 직접 사용하여 출력할 수 있습니다. 예를 들어, `current` 변수가 문자 'a'를 가지고 있다면, TypeScript 코드는 다음과 같이 될 것입니다:

```typescript
console.log(current + "사용할 수 없는 문자입니다.");
```

여기서 `current`는 'a'와 같은 문자 또는 문자열을 가진 변수로 가정됩니다.
