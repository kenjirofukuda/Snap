import { read_lines_from_file } from './mylib';

const espree = require('espree');
const debug = false;

export type EspreeNode = {
  type: string;
  start: number;
  end: number;
  body?: EspreeNode;
  superClass?: EspreeNode;
  id?: EspreeNode;
  key?: EspreeNode;
  value?: EspreeNode;
  object?: EspreeNode;
  property?: EspreeNode;
  arguments?: EspreeNode[];
  name?: string;
};

export class EspeeCenter {
  readonly path: string;
  readonly lines: string[];
  readonly code: string;
  readonly ast: EspreeNode;

  constructor(path: string) {
    this.path = path;
    this.lines = read_lines_from_file(this.path);
    this.code = this.lines.join('\n');
    this.ast = espree.parse(this.code, { ecmaVersion: 'latest' });
  }

  str(node: EspreeNode): string {
    return this.code.substring(node.start, node.end);
  }

  /**
   * get space for target node indent.
   *
   * @param node target node
   * @returns
   */
  indentSpaces(node: EspreeNode): string {
    let spc = 0;
    for (let i = node.start - 1; i >= 1; i--) {
      const ch = this.code.substring(i - 1, i);
      if (ch === '\n') {
        break;
      }
      spc++;
    }
    return ' '.repeat(spc);
  }
}

export function find_node(
  node: EspreeNode,
  key: string,
  value: string
): EspreeNode | null {
  const col_result = [];
  primitive_find_nodes(
    node,
    (aNode) => {
      return aNode[key] === value;
    },
    col_result,
    true
  );
  if (col_result.length === 0) {
    return null;
  } else {
    return col_result[0];
  }
}

export function find_nodes(
  node: EspreeNode | EspreeNode[],
  filter: (each: EspreeNode) => boolean,
  once = false
): EspreeNode[] {
  const colResult: EspreeNode[] = [];
  primitive_find_nodes(node, filter, colResult, once);
  return colResult;
}

export function primitive_find_nodes(
  node: EspreeNode | EspreeNode[],
  filter: (each: EspreeNode) => boolean,
  colResult: EspreeNode[],
  once = false
) {
  const debug = false;
  if (node instanceof Array) {
    if (debug) {
      console.log('inside array direct');
    }
    for (const aNode of node) {
      primitive_find_nodes(aNode, filter, colResult, once);
      if (once && colResult.length > 0) {
        return;
      }
    }
  } else {
    if (filter(node)) {
      colResult.push(node);
      if (once) {
        return;
      }
    }
  }
  for (let each of [
    'body',
    'expression',
    'value',
    'callee',
    'object',
    'property',
    'arguments',
  ]) {
    if (node[each]) {
      if (node[each] instanceof Object) {
        if (debug) {
          console.log(`inside object ${each}`);
        }
        primitive_find_nodes(node[each], filter, colResult, once);
        if (once && colResult.length > 0) {
          return;
        }
      }
    }
  }
}
