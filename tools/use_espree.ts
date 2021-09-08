#!/usr/bin/env ts-node
import { EspeeCenter } from './libespree';

const inputPath = process.argv[2];

const ec = new EspeeCenter(inputPath);

const classNames = ec.classNames();


console.log('### classNames() ###');
console.log(ec.classNames());
console.log('');


console.log('### methodNames() ###');
console.log(ec.methodNames());
console.log('');