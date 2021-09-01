import * as fs from 'fs';
import * as path from 'path';
import * as mylib_1 from './mylib';
const espree = require('espree');
if (process.argv.length < 3) {
  console.error('input file not specified');
  for (let i = 0; i < process.argv.length; i++) {
    console.log('argv[' + i + '] = ' + process.argv[i]);
  }
  process.exit(1);
}
var input_path = process.argv[2];
if (!fs.existsSync(input_path)) {
  console.warn('file not found: ' + input_path);
  process.exit(1);
}
console.log('found: ' + input_path);
var lines = mylib_1.read_lines_from_file(input_path);

// const tokens = espree.tokenize(lines.join('\n'), {
//   ecmaVersion: 'latest',
// });
// console.log(tokens);

const code = lines.join('\n');
const ast = espree.parse(code, { ecmaVersion: 'latest' });
// mylib_1.write_lines_to_file(
//   [JSON.stringify(ast, null, 2)],
//   mylib_1.path_join(path.dirname(input_path), path.basename(input_path, '.js')) +
//     '.json'
// );

function find_node(node: object, key: string, value: string): object | null {
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
  node: object,
  filter: (each: object) => boolean,
  col_result: object[],
  once = false
) {
  if (filter(node)) {
    col_result.push(node);
    if (once) {
      return;
    }
  }
  if (node instanceof Array) {
    console.log('inside array direct');
    for (let i in node) {
      const aNode = node[i];
      primitive_find_nodes(aNode, filter, col_result, once);
      if (once && col_result.length > 0) {
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
        console.log(`inside object ${each}`);
        primitive_find_nodes(node[each], filter, col_result, once);
        if (once && col_result.length > 0) {
          return;
        }
      }
    }
  }
}

const find_constructor = (node: object) => find_node(node, 'kind', 'constructor');
const find_member_expr = (node: object) => find_node(node, 'type', 'MemberExpression');

const constructor_node = find_constructor(ast);
console.log(constructor_node);
console.log('');
const init_node = constructor_node.value.body.body[0];
console.log(init_node);
console.log('');
const member_node = find_member_expr(init_node);
console.log(member_node);
console.log('');

function node_indent(node: object) {
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

console.log(
  [
    node_indent(constructor_node),
    code.substring(constructor_node.start, init_node.start - 1),
    'super();', // TODO: auto apply super's argument
    node_indent(init_node),
    code.substring(init_node.start, init_node.end),
    code.substring(init_node.end + 1, constructor_node.end),
  ]
    .join('')
    .replace(/;/g, ';\n')
);

console.log('');
console.log(code.substring(217, 226));

const class_decl_node = find_node(ast, 'type', 'ClassDeclaration');
if (!class_decl_node) {
  console.warn('class not found');
  process.exit(1);
}
console.log(`class[${class_decl_node.id.name}]`);
if (class_decl_node.superClass) {
  console.log(`superClass[${class_decl_node.superClass.name}]`);
}

function force_self_init_call(class_node: object) {
  const original_args = find_node(
    class_node,
    'type',
    'CallExpression'
  ).arguments.map((each: { name: any; }) => {
    return each.name;
  });

  return [
    [class_node.id.name, 'prototype', 'init', 'call'].join('.'),
    '(',
    ['this', ...original_args].join(', '),
    ');',
  ].join('');
}
console.log(force_self_init_call(class_decl_node));

const method_nodes = [];
primitive_find_nodes(
  class_decl_node,
  (aNode) => {
    return aNode['type'] === 'MethodDefinition';
  },
  method_nodes
);

const init_nodes = method_nodes.filter((aNode) => {
  return aNode.key && aNode.key.name && aNode.key.name === 'init';
});
console.log(init_nodes[0]);
