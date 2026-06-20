export type RichChunk<T> = string | T;

export type RichTagHandler<T> = (chunks: RichChunk<T>[]) => T;

export function formatRich<T>(
  message: string,
  values: Record<string, string | number | RichTagHandler<T>>,
  formatText: (text: string) => string,
): RichChunk<T>[] {
  const root = parseRichMessage(message);
  return renderRichNode(root, values, formatText);
}

interface RichNode {
  type: 'root' | 'text' | 'tag';
  name?: string;
  content?: string;
  children?: RichNode[];
}

function parseRichMessage(message: string): RichNode {
  const root: RichNode = { type: 'root', children: [] };
  const stack: RichNode[] = [root];

  const tagRegex = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)>/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tagRegex.exec(message)) !== null) {
    const [full, isClose, name] = match;
    const before = message.slice(lastIndex, match.index);

    if (before) {
      stack[stack.length - 1].children!.push({ type: 'text', content: before });
    }

    if (isClose) {
      const openIndex = stack.findLastIndex((node) => node.type === 'tag' && node.name === name);
      if (openIndex > 0) {
        const tag = stack[openIndex];
        stack.splice(openIndex, 1);
        stack[stack.length - 1].children!.push(tag);
      }
      // If no matching open tag, ignore malformed close tag
    } else {
      const tag: RichNode = { type: 'tag', name, children: [] };
      stack.push(tag);
    }

    lastIndex = match.index + full.length;
  }

  const remaining = message.slice(lastIndex);
  if (remaining) {
    stack[stack.length - 1].children!.push({ type: 'text', content: remaining });
  }

  // Flatten any unclosed tags back to text
  while (stack.length > 1) {
    const node = stack.pop()!;
    const parent = stack[stack.length - 1];
    parent.children!.push({ type: 'text', content: `<${node.name}>` });
    if (node.children) {
      parent.children!.push(...node.children);
    }
  }

  return root;
}

function renderRichNode<T>(
  node: RichNode,
  values: Record<string, string | number | RichTagHandler<T>>,
  formatText: (text: string) => string,
): RichChunk<T>[] {
  if (node.type === 'text') {
    return [formatText(node.content ?? '')];
  }

  if (node.type === 'tag') {
    const handler = values[node.name!];
    if (typeof handler !== 'function') {
      // No handler: render children as plain text with tag markers
      const children = node.children ?? [];
      return [
        formatText(`<${node.name}>`),
        ...children.flatMap((child) => renderRichNode(child, values, formatText)),
        formatText(`</${node.name}>`),
      ];
    }

    const children = node.children ?? [];
    const chunks = children.flatMap((child) => renderRichNode(child, values, formatText));
    return [handler(chunks)];
  }

  // root
  return (node.children ?? []).flatMap((child) => renderRichNode(child, values, formatText));
}
