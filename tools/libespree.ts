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
  _classNode?: EspreeNode;
  _constructorNode?: EspreeNode;
  _methodNodes?: EspreeNode[];

  constructor(path: string) {
    this.path = path;
    this.lines = read_lines_from_file(this.path);
    this.code = this.lines.join('\n');
    this.ast = espree.parse(this.code, { ecmaVersion: 'latest' });
  }

  str(node: EspreeNode): string {
    return this.code.substring(node.start, node.end);
  }

  classNames(): string[] {
    const classNodes = find_nodes(this.ast, (aNode) => {
      return aNode.type === 'ClassDeclaration';
    });
    return classNodes.map((each) => {
      return each.id.name;
    });
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

  classNode(): EspreeNode | null {
    if (this._classNode === undefined) {
      this._classNode = find_node(this.ast, 'type', 'ClassDeclaration');
    }
    return this._classNode;
  }

  constructorNode(): EspreeNode {
    if (this._constructorNode === undefined) {
      if (this.classNode()) {
        this._constructorNode = find_node(
          this.classNode(),
          'type',
          'ClassDeclaration'
        );
      }
    }
    return this._constructorNode;
  }

  methodNodes(): EspreeNode[] {
    if (this._methodNodes === undefined) {
      if (this.classNode()) {
        this._methodNodes = find_nodes(
          this.classNode(),
          (aNode) => aNode['type'] === 'MethodDefinition'
        );
      }
    }
    return this._methodNodes;
  }
  
  methodNames(): string[] {
    return this.methodNodes().map((aNode) => aNode.key.name);
  }

  /**
   *
   * @returns '' if no class
   */
  className(): string {
    if (this.classNode() === null) {
      return '';
    } else {
      return this.classNode().id.name;
    }
  }

  superClassName(): string {
    if (this.classNode()) {
      if (this.classNode().superClass) {
        return this.classNode().superClass.name;
      }
    }
    return '';
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
