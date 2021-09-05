import * as fs from 'fs';
import { read_lines_from_file } from './mylib';

const espree = require('espree');
const debug = false;

type EspreeNode = {
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

if (process.argv.length < 3) {
  console.error('input file not specified');
  for (let i = 0; i < process.argv.length; i++) {
    console.log(`argv[${i}] = ${process.argv[i]}`);
  }
  process.exit(1);
}

const inputPath = process.argv[2];

if (!fs.existsSync(inputPath)) {
  console.warn(`file not found: ${inputPath}`);
  process.exit(1);
}
if (debug) {
  console.log(`found: ${inputPath}`);
}

const lines = read_lines_from_file(inputPath);
const code = lines.join('\n');
const ast = espree.parse(code, { ecmaVersion: 'latest' });

const classDeclNode = find_node(ast, 'type', 'ClassDeclaration');
if (!classDeclNode) {
  console.warn('class not found. no needs convert.');
  process.exit(1);
}
const className = classDeclNode.id.name;

if (debug) {
  console.log(`class[${className}]`);
}
let superClassName = '';
if (classDeclNode.superClass) {
  if (debug) {
    superClassName = classDeclNode.superClass.name;
    console.log(`superClass[${superClassName}]`);
  }
}

const find_constructor = (node: EspreeNode) =>
  find_node(node, 'kind', 'constructor');
const find_member_expr = (node: EspreeNode) =>
  find_node(node, 'type', 'MemberExpression');

const constructorNode = find_constructor(ast);
if (debug) {
  console.log('### constructorNode ###');
  console.log(constructorNode);
  console.log('');
}
const initCallNode = constructorNode.value.body.body[0];
if (debug) {
  console.log('### initCallNode ###');
  console.log(initCallNode);
  console.log('');
}
const thisInitNode = find_member_expr(initCallNode);
if (debug) {
  console.log('### thisInitNode ###');
  console.log(thisInitNode);
  console.log('');
}

const replaceInitCall = force_self_init_call(classDeclNode);

const replacedConstructorCode = [
  indentSpaces(constructorNode),
  code.substring(constructorNode.start, initCallNode.start - 1),
  'super();', // TODO: auto apply super's argument
  indentSpaces(initCallNode),
  replaceInitCall,
  code.substring(initCallNode.end + 1, constructorNode.end),
]
  .join('')
  .replace(/;/g, ';\n');
console.log(replacedConstructorCode);
console.log('');

const methodNodes: EspreeNode[] = [];
primitive_find_nodes(
  classDeclNode,
  (aNode) => {
    return aNode['type'] === 'MethodDefinition';
  },
  methodNodes
);

const initNodes = methodNodes.filter((aNode) => {
  return aNode.key && aNode.key.name && aNode.key.name === 'init';
});

if (initNodes.length === 0) {
  console.warn('init method not found.');
  process.exit(1);
}

const initDefNode = initNodes[0];
if (debug) {
  console.log(initDefNode);
}

const uberCalls: EspreeNode[] = [];
primitive_find_nodes(
  initDefNode,
  (aNode) => {
    if (aNode['type'] === 'MemberExpression') {
      if (aNode.object && aNode.property) {
        if (aNode.object.name && aNode.property.name) {
          return (
            aNode.object.name === className && aNode.property.name === 'uber'
          );
        }
      }
    }
    return false;
  },
  uberCalls
);
if (uberCalls.length === 0) {
  console.warn('uber call not found.');
  process.exit(1);
}
if (debug) {
  console.log(uberCalls[0]);
}

const uberExprs: EspreeNode[] = [];
primitive_find_nodes(
  initDefNode,
  (aNode) => {
    return (
      aNode['type'] === 'ExpressionStatement' &&
      aNode.start === uberCalls[0].start
    );
  },
  uberExprs
);
const originalUberInit = code.substring(uberExprs[0].start, uberExprs[0].end);
console.log(originalUberInit);
console.log('');

const uberArgs = find_node(
  uberExprs[0],
  'type',
  'CallExpression'
).arguments.map((each: EspreeNode) => {
  return code.substring(each.start, each.end);
});
uberArgs.shift(); // remove first arg this,

// remove 'this' argument ;
const replacedSuperCallCode = ['super.init(', [...uberArgs].join(', '), ');']
  .join('')
  .replace(/;/g, ';\n');
if (debug) {
  console.log(replacedSuperCallCode);
  console.log('');
}

const replacedInitDefCode = [
  code.substring(initDefNode.start, uberExprs[0].start - 1),
  replacedSuperCallCode,
  code.substring(uberExprs[0].end + 1, initDefNode.end),
].join('');
console.log(replacedInitDefCode);
console.log('');

/**
 * get space for target node indent.
 *
 * @param node target node
 * @returns
 */
function indentSpaces(node: EspreeNode): string {
  let spc = 0;
  for (let i = node.start - 1; i >= 1; i--) {
    const ch = code.substring(i - 1, i);
    if (ch === '\n') {
      break;
    }
    spc++;
  }
  return ' '.repeat(spc);
}

/**
 * change init call form
 *
 * from: this.init(...arg)
 * to:   <ClassName>.prototype.init.call(this, ...arg)
 *
 * @param class_node root node for class
 * @returns <ClassName>.prototype.init.call(this, ...arg)
 */
function force_self_init_call(class_node: EspreeNode) {
  const original_args = find_node(
    class_node,
    'type',
    'CallExpression'
  ).arguments.map((each: EspreeNode) => {
    return each.name;
  });

  return [
    [class_node.id.name, 'prototype', 'init', 'call'].join('.'),
    '(',
    ['this', ...original_args].join(', '),
    ');',
  ].join('');
}

function find_node(
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

function primitive_find_nodes(
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
