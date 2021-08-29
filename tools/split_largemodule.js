"use strict";
exports.__esModule = true;
/**
 * cd {TopDirectory}
 * npx tsc ./tools/split_largemodule.ts && node ./tools/split_largemodule.js ./src/morphic.js
 *
 * cant execute:
 * ts-node  ./tools/split_largemodule.ts  ./src/morphic.js
 */
var fs = require("fs");
var path = require("path");
var STRIP_ENDS_MORPH = true;
if (process.argv.length < 3) {
    console.error('input file not specified');
    for (var i = 0; i < process.argv.length; i++) {
        console.log("argv[" + i + "] = " + process.argv[i]);
    }
    process.exit(1);
}
var input_path = process.argv[2];
var input_base = path.basename(input_path, '.js');
if (!fs.existsSync(input_path)) {
    console.warn("file not found: " + input_path);
    process.exit(1);
}
console.log("found: " + input_path);
var read_file_lines = function (filename) {
    return fs.readFileSync(filename).toString('utf8').split('\n');
};
var current_buf = new Array();
var current_key = input_base + "_head";
var all_map = {};
var all_lines = read_file_lines(input_path);
all_lines.forEach(function (line) {
    var split_tag = get_split_tag_from(line);
    if (split_tag !== '') {
        console.log("" + line);
        all_map[current_key] = current_buf;
        current_buf = new Array();
        current_key = basename_from_split_tag(split_tag);
    }
    current_buf.push(line);
});
all_map[current_key] = current_buf;
for (var basename in all_map) {
    console.log("***** " + basename + " ***");
    console.log("" + all_map[basename].length);
    var output_path = "./sandbox/_splitresult/" + input_base + "/" + basename + ".js";
    write_lines_to_file(all_map[basename], output_path);
}
function get_split_tag_from(s) {
    var matchArray = s.match(/(\/\/) ([\w ]+) (\/\/\/+)/);
    return matchArray ? matchArray[2] : '';
}
function basename_from_split_tag(tag) {
    var basename = tag.replace(/_/g, '');
    if (STRIP_ENDS_MORPH && basename.endsWith('Morph')) {
        basename = basename.substring(0, basename.length - 'Morph'.length);
    }
    return basename.replace(/ /g, '-').toLowerCase();
}
function write_lines_to_file(lines, out_path) {
    var output_folder_path = path.dirname(out_path);
    fs.mkdirSync(output_folder_path, { recursive: true });
    var fd = fs.openSync(out_path, 'w');
    lines.forEach(function (line) {
        fs.writeSync(fd, line);
        fs.writeSync(fd, '\n');
    });
    fs.closeSync(fd);
}
