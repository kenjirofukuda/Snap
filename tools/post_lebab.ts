import * as fs from 'fs';
import { EspeeCenter, EspreeNode, find_node, find_nodes } from './libespree';
import { write_lines_to_file } from './mylib';

const debug = false;

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

const ec = new EspeeCenter(inputPath);

if (!ec.classNode()) {
  console.warn('class not found. no needs patch.');
  process.exit(1);
}

if (debug) {
  console.log(`class[${ec.className()}]`);
}
if (ec.superClassName()) {
  if (debug) {
    console.log(`superClass[${ec.superClassName()}]`);
  }
}
if (ec.superClassName() === '') {
  console.warn('no super class. no needs patch.');
  process.exit(1);
}

const find_constructor = (node: EspreeNode) =>
  find_node(node, 'kind', 'constructor');
const find_member_expr = (node: EspreeNode) =>
  find_node(node, 'type', 'MemberExpression');

const constructorNode = find_constructor(ec.ast);
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

const replaceInitCall = force_self_init_call(ec.classNode());

const replacedConstructorCode = [
  ec.indentSpaces(constructorNode),
  ec.code.substring(constructorNode.start, initCallNode.start - 1),
  'super();', // TODO: auto apply super's argument
  ec.indentSpaces(initCallNode),
  replaceInitCall,
  ec.code.substring(initCallNode.end + 1, constructorNode.end),
]
  .join('')
  .replace(/;/g, ';\n');
if (debug) {
  console.log(replacedConstructorCode);
  console.log('');
}

const methodNodes = find_nodes(ec.classNode(), (aNode) => {
  return aNode['type'] === 'MethodDefinition';
});

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

const uberCalls = find_nodes(initDefNode, (aNode) => {
  if (aNode['type'] === 'MemberExpression') {
    if (aNode.object && aNode.property) {
      if (aNode.object.name && aNode.property.name) {
        return (
          aNode.object.name === ec.className() && aNode.property.name === 'uber'
        );
      }
    }
  }
  return false;
});
if (uberCalls.length === 0) {
  console.warn('uber call not found.');
  process.exit(1);
}
if (debug) {
  console.log(uberCalls[0]);
}

const uberExprs = find_nodes(initDefNode, (aNode) => {
  return (
    aNode['type'] === 'ExpressionStatement' &&
    aNode.start === uberCalls[0].start
  );
});
const originalUberInit = ec.str(uberExprs[0]);
if (debug) {
  console.log(originalUberInit);
  console.log('');
}

const uberArgs = find_node(
  uberExprs[0],
  'type',
  'CallExpression'
).arguments.map((each: EspreeNode) => {
  return ec.str(each);
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
  ec.code.substring(initDefNode.start, uberExprs[0].start - 1),
  replacedSuperCallCode,
  ec.code.substring(uberExprs[0].end + 1, initDefNode.end),
].join('');
if (debug) {
  console.log(replacedInitDefCode);
  console.log('');
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
    return ec.str(each);
  });

  return [
    [class_node.id.name, 'prototype', 'init', 'call'].join('.'),
    '(',
    ['this', ...original_args].join(', '),
    ');',
  ].join('');
}

const newSourceCode = [
  ec.code.substring(0, constructorNode.start - 1),
  replacedConstructorCode,
  '\n',
  ec.indentSpaces(initDefNode),
  replacedInitDefCode, 
  '\n',
  ec.code.substring(initDefNode.end + 1, ec.code.length),
].join('');

write_lines_to_file([newSourceCode], inputPath);