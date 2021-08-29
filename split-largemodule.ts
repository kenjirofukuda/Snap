/**
 * npx tsc ./split-largemodule.ts && node ./split-largemodule.js ./src/morphic.js
 */
import * as fs from 'fs';
import * as readline from 'readline';
import * as path from 'path';

type StringToLinesMap = {
  [name: string]: Array<string>;
};

if (process.argv.length < 3) {
  console.error('input file not specified');
  for (let i = 0; i < process.argv.length; i++) {
    console.log(`argv[${i}] = ${process.argv[i]}`);
  }
  process.exit(1);
}

const input_path = process.argv[2];
const input_base = path.basename(input_path, '.js');

if (!fs.existsSync(input_path)) {
  console.warn(`file not found: ${input_path}`);
  process.exit(1);
}
console.log(`found: ${input_path}`);

const ri = readline.createInterface(fs.createReadStream(input_path));
let current_buf = new Array<string>();
let current_key = `${input_base}_head`;
const all_map: StringToLinesMap = {};
ri.on('line', (line: string) => {
  const matchArray = line.match(/(\/\/) ([\w ]+) (\/\/\/+)/);
  if (matchArray) {
    console.log(`${line}`);
    let basename = matchArray[2].replace(/_/g, '');
    if (basename.endsWith('Morph')) {
      basename = basename.substring(0, basename.length - 'Morph'.length);
    }
    basename = basename.replace(/ /g, '-');
    basename = basename.toLowerCase();
    all_map[current_key] = current_buf;
    current_buf = new Array<string>();
    current_key = basename;
  }
  current_buf.push(line);
});
ri.on('close', () => {
  all_map[current_key] = current_buf;

  for (let key in all_map) {
    console.log(`***** ${key} ***`);
    console.log(`${all_map[key].length}`);
    const output_path = `./sandbox/_splitresult/${input_base}/${key}.js`;
    const output_folder_path = path.dirname(output_path);
    fs.mkdirSync(output_folder_path, { recursive: true });
    const fd = fs.openSync(output_path, 'w');
    all_map[key].forEach((element) => {
      fs.writeSync(fd, element);
      fs.writeSync(fd, '\n');
    });
    fs.closeSync(fd);
  }
});
