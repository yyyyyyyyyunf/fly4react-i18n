import { parse } from '@formatjs/icu-messageformat-parser';
import type { MessageFormatElement } from '@formatjs/icu-messageformat-parser';

export function extractParams(message: string): string[] {
  const ast = parse(message);
  const params = new Set<string>();
  extractFromElements(ast, params);
  return [...params];
}

function extractFromElements(elements: MessageFormatElement[], params: Set<string>): void {
  if (!Array.isArray(elements)) return;
  for (const element of elements) {
    switch (element.type) {
      case 1: // argument
      case 2: // number
        params.add(element.value);
        break;
      case 5: // select
      case 6: // plural / selectordinal
        params.add(element.value);
        for (const option of Object.values(element.options)) {
          extractFromElements(option.value, params);
        }
        break;
      case 8: // tag
        extractFromElements(element.children, params);
        break;
      default:
        break;
    }
  }
}
