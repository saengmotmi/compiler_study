import { StackFrame } from "./stackframe";

export class GarbageCollector {
  private objects: Map<any, boolean> = new Map();

  constructor(
    private callStack: StackFrame[],
    private global: Map<string, any>
  ) {}

  public collectGarbage(): void {
    // Mark phase
    for (const stackFrame of this.callStack) {
      for (const value of stackFrame.operandStack) {
        this.markObject(value);
      }
      for (const value of stackFrame.variables) {
        this.markObject(value);
      }
    }

    for (const value of this.global.values()) {
      this.markObject(value);
    }

    // Sweep phase
    this.sweepObject();
  }

  private markObject(value: any): void {
    if (Array.isArray(value) || value instanceof Map) {
      if (!this.objects.get(value)) {
        this.objects.set(value, true);
        const elements = Array.isArray(value)
          ? value
          : Array.from(value.values());
        for (const element of elements) {
          this.markObject(element);
        }
      }
    }
  }

  private sweepObject(): void {
    const toRemove: any[] = [];

    this.objects.forEach((marked, obj) => {
      if (!marked) {
        toRemove.push(obj);
      } else {
        this.objects.set(obj, false); // Reset mark for next GC cycle
      }
    });

    for (const obj of toRemove) {
      this.objects.delete(obj);
    }
  }
}
