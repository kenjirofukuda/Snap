/**
 * cd {TopDirectory}
 * npx tsc ./tools/split_largemodule.ts && node ./tools/split_largemodule.js ./src/morphic.js
 *
 * cant execute:
 * ts-node  ./tools/split_largemodule.ts  ./src/morphic.js
 */
import * as fs from 'fs';
import * as path from 'path';
import { read_lines_from_file, write_lines_to_file } from './mylib';

const STRIP_ENDS_MORPH = true;

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

let current_buf = new Array<string>();
let current_key = `${input_base}_head`;
const all_map: StringToLinesMap = {};
const all_lines = read_lines_from_file(input_path);

all_lines.forEach((line: string) => {
  const split_tag = get_split_tag_from(line);
  if (split_tag !== '') {
    console.log(`${line}`);
    all_map[current_key] = current_buf;
    current_buf = new Array<string>();
    current_key = basename_from_split_tag(split_tag);
  }
  current_buf.push(line);
});
all_map[current_key] = current_buf;

const all_paths: string[] = [];
const output_dir = `./sandbox/_splitresult/${input_base}/`;
for (let basename in all_map) {
  console.log(`***** ${basename} ***`);
  console.log(`${all_map[basename].length}`);
  const output_path = path.join(output_dir, `${basename}.js`).replace(/\\/g, '/');
  all_paths.push(output_path);
  write_lines_to_file(all_map[basename], output_path);
}
const html_scripts = all_paths.map((each) => {
  return `<script src="${each}"></script>`;
});
const partial_html_file = path.join(output_dir, '_script_tag_hint.txt');
write_lines_to_file(html_scripts, partial_html_file);

function get_split_tag_from(s: string): string | '' {
  const matchArray = s.match(/(\/\/) ([\w ]+) (\/\/\/+)/);
  return matchArray ? matchArray[2] : '';
}

function basename_from_split_tag(tag: string): string {
  let basename = tag.replace(/_/g, '');
  if (STRIP_ENDS_MORPH && basename.endsWith('Morph')) {
    basename = basename.substring(0, basename.length - 'Morph'.length);
  }
  return basename.replace(/ /g, '-').toLowerCase();
}
