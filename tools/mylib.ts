
import * as fs from 'fs';
import * as path from 'path';

export function read_lines_from_file(filename: string): string[] {
  return fs.readFileSync(filename).toString('utf8').split('\n');
}

export function write_lines_to_file(lines: string[], out_path: string): void {
  const output_folder_path = path.dirname(out_path);
  fs.mkdirSync(output_folder_path, { recursive: true });
  const fd = fs.openSync(out_path, 'w');
  lines.forEach((line) => {
    fs.writeSync(fd, line);
    fs.writeSync(fd, '\n');
  });
  fs.closeSync(fd);
}

export function path_join(...args: string[]): string{
  return path.join(...args).replace(/\\/g, '/');
}