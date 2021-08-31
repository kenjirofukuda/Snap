import * as fs from 'fs';
import * as path from 'path';
import {read_lines_from_file, write_lines_to_file} from './mylib';


if (process.argv.length < 3) {
  console.error('input file not specified');
  for (let i = 0; i < process.argv.length; i++) {
    console.log(`argv[${i}] = ${process.argv[i]}`);
  }
  process.exit(1);
}

const input_path = process.argv[2];

if (!fs.existsSync(input_path)) {
  console.warn(`file not found: ${input_path}`);
  process.exit(1);
}
console.log(`found: ${input_path}`);

const lines = read_lines_from_file(input_path);

let i = 0;
let found = -1;
let class_name = '';
lines.some((line) => {
    const matchArray = line.match(/^function ([A-Z][\w_]+)\s*\(/);
    if (matchArray) {
        class_name = matchArray[1];
        console.log(`${class_name} at ${i}`)
        found = i;
        return;
    }
    i++;
  }
);
if (found < 0) {
  console.log('!!! class not found !!!');
  process.exit(0);
}
const inpit_base = path.basename(input_path, '.js');
const output_path = `${path.dirname(input_path)}/${inpit_base}.converted.js`;
const result: string[] = [];
result.push(lines[0]);
result.push('');
for (let i = found; i < lines.length; i++) {
  result.push(lines[i]);
}
for (let i = 0; i < found; i++) {
  const matchArray = lines[i].match(/^var ([A-Z][\w_]+)\s*;/);
  if (matchArray) {
    result.push('// ' + lines[i]);
  }
  else {
    result.push(lines[i]);
  }
}

write_lines_to_file(result, output_path);
console.log('');
