/*

    xml.js

    a simple XML DOM, encoder and parser for morphic.js

    written by Jens Mönig
    jens@moenig.org

    Copyright (C) 2020 by Jens Mönig

    This file is part of Snap!.

    Snap! is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of
    the License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.


    prerequisites:
    --------------
    needs morphic.js


    hierarchy
    ---------
    the following tree lists all constructors hierarchically,
    indentation indicating inheritance. Refer to this list to get a
    contextual overview:

        MorphicNode*
            XML_Element
        ReadStream

    * defined in morphic.js


    toc
    ---
    the following list shows the order in which all constructors are
    defined. Use this list to locate code in this document:

        ReadStream
        XML_Element


    credits
    -------
    Nathan Dinsmore contributed to the design and implemented a first
    working version of a complete XMLSerializer. I have taken much of the
    overall design and many of the functions and methods in this file from
    Nathan's fine original prototype. Recently Nathan has once again
    worked his magic on the parser and optimized it by an order of
    magnitude.

*/

/*global modules, detect, MorphicNode, isNil*/

/*jshint esversion: 6*/

// Global stuff ////////////////////////////////////////////////////////

modules.xml = '2021-July-05';


// ReadStream ////////////////////////////////////////////////////////////

// I am a sequential reading interface to an Array or String

// ReadStream instance creation:

class ReadStream {
    constructor(arrayOrString) {
        this.contents = arrayOrString || '';
        this.index = 0;
    }
    // ReadStream accessing:
    next(count) {
        if (count === undefined) {
            const element = this.contents[this.index];
            this.index += 1;
            return element;
        }
        const start = this.index;
        this.index += count;
        return this.contents.slice(start, this.index);
    }
    peek() {
        return this.contents[this.index];
    }
    skip(count) {
        this.index += count || 1;
    }
    atEnd() {
        return this.index > (this.contents.length - 1);
    }
    // ReadStream accessing String contents:
    upTo(str) {
        const i = this.contents.indexOf(str, this.index);
        return i === -1 ? '' : this.contents.slice(this.index, this.index = i);
    }
    peekUpTo(str) {
        const i = this.contents.indexOf(str, this.index);
        return i === -1 ? '' : this.contents.slice(this.index, i);
    }
    skipSpace() {
        this.nonSpace.lastIndex = this.index;
        const result = this.nonSpace.exec(this.contents);
        if (result)
            this.index = result.index;
    }
    word() {
        this.nonWord.lastIndex = this.index;
        const result = this.nonWord.exec(this.contents);
        return result ? this.contents.slice(this.index, this.index = result.index) : '';
    }
}

// ReadStream constants:

ReadStream.prototype.nonSpace = /\S|$/g;
ReadStream.prototype.nonWord = /[\s>/=]|$/g;


// XML_Element ///////////////////////////////////////////////////////////
/*
    I am a DOM-Node which can encode itself to as well as parse itself
    from a well-formed XML string. Note that there is no separate parser
    object, all the parsing can be done in a single object.
*/

// XML_Element inherits from MorphicNode:

// XML_Element.prototype = Object.create(MorphicNode.prototype);
// XML_Element.uber = MorphicNode.prototype;


class XML_Element extends MorphicNode {
    constructor(tag, contents, parent) {
        super(parent);
        this.init(tag, contents, parent);
    }
    init(tag, contents, parent) {
        // additional properties:
        this.tag = tag || 'unnamed';
        this.attributes = {};
        this.contents = contents || '';

        // initialize inherited properties:
        super.init(parent);

        // override inherited properties
        if (parent)
            parent.addChild(this);
    }
    // XML_Element DOM navigation: (aside from what's inherited from MorphicNode)
    require(tagName, fallback) {
        // answer the first direct child with the specified tagName.
        // if it doesn't exist execute the fallback function or return the
        // fallback value, otherwise throw an error
        const child = this.childNamed(tagName);
        if (!child) {
            if (fallback instanceof Function) {
                return fallback();
            }
            if (!isNil(fallback)) {
                return fallback;
            }
            throw new Error('Missing required element <' + tagName + '>!');
        }
        return child;
    }
    childNamed(tagName) {
        // answer the first direct child with the specified tagName, or null
        return detect(
            this.children,
            child => child.tag === tagName
        );
    }
    childrenNamed(tagName) {
        // answer all direct children with the specified tagName
        return this.children.filter(child => child.tag === tagName);
    }
    parentNamed(tagName) {
        // including myself
        if (this.tag === tagName) {
            return this;
        }
        if (!this.parent) {
            return null;
        }
        return this.parent.parentNamed(tagName);
    }
    // XML_Element output:
    toString(isFormatted, indentationLevel) {
        let result = '', indent = '', level = indentationLevel || 0;

        // spaces for indentation, if any
        if (isFormatted) {
            for (let i = 0; i < level; i += 1) {
                indent += this.indentation;
            }
            result += indent;
        }

        // opening tag
        result += ('<' + this.tag);

        // attributes, if any
        for (let key in this.attributes) {
            if (Object.prototype.hasOwnProperty.call(this.attributes, key)
                && this.attributes[key]) {
                result += ' ' + key + '="' + this.escape(this.attributes[key]) + '"';
            }
        }

        // contents, subnodes, and closing tag
        if (!this.contents.length && !this.children.length) {
            result += '/>';
        } else {
            result += '>';
            result += this.escape(this.contents);
            this.children.forEach(element => {
                if (isFormatted) {
                    result += '\n';
                }
                result += element.toString(isFormatted, level + 1);
            });
            if (isFormatted && this.children.length) {
                result += ('\n' + indent);
            }
            result += '</' + this.tag + '>';
        }
        return result;
    }
    escape(string, ignoreQuotes) {
        const src = isNil(string) ? '' : string.toString();
        let result = '';
        for (let i = 0; i < src.length; i += 1) {
            const ch = src[i];
            switch (ch) {
                case '\'':
                    result += '&apos;';
                    break;
                case '"':
                    result += ignoreQuotes ? ch : '&quot;';
                    break;
                case '<':
                    result += '&lt;';
                    break;
                case '>':
                    result += '&gt;';
                    break;
                case '&':
                    result += '&amp;';
                    break;
                case '\n': // escape CR b/c of export to URL feature
                    result += '&#xD;';
                    break;
                case '~': // escape tilde b/c it's overloaded in serializer.store()
                    result += '&#126;';
                    break;
                default:
                    result += ch;
            }
        }
        return result;
    }
    unescape(string) {
        return string.replace(/&(amp|apos|quot|lt|gt|#xD|#126);/g, (_, name) => {
            switch (name) {
                case 'amp': return '&';
                case 'apos': return '\'';
                case 'quot': return '"';
                case 'lt': return '<';
                case 'gt': return '>';
                case '#xD': return '\n';
                case '#126': return '~';
                default: console.warn('unreachable');
            }
        });
    }
    // XML_Element parsing:
    parseString(string) {
        const stream = new ReadStream(string);
        stream.upTo('<');
        stream.skip();
        this.parseStream(stream);
    }
    parseStream(stream) {
        // tag:
        this.tag = stream.word();
        stream.skipSpace();

        // attributes:
        let ch = stream.peek();
        while (ch !== '>' && ch !== '/') {
            const key = stream.word();
            stream.skipSpace();
            if (stream.next() !== '=') {
                throw new Error('Expected "=" after attribute name');
            }
            stream.skipSpace();
            ch = stream.next();
            if (ch !== '"' && ch !== "'") {
                throw new Error('Expected single- or double-quoted attribute value');
            }
            const value = stream.upTo(ch);
            stream.skip(1);
            stream.skipSpace();
            this.attributes[key] = this.unescape(value);
            ch = stream.peek();
        }

        // empty tag:
        if (ch === '/') {
            stream.skip();
            if (stream.next() !== '>') {
                throw new Error('Expected ">" after "/" in empty tag');
            }
            return;
        }
        if (stream.next() !== '>') {
            throw new Error('Expected ">" after tag name and attributes');
        }

        // contents and children
        while (!stream.atEnd()) {
            ch = stream.next();
            if (ch === '<') {
                if (stream.peek() === '/') { // closing tag
                    stream.skip();
                    if (stream.word() !== this.tag) {
                        throw new Error('Expected to close ' + this.tag);
                    }
                    stream.upTo('>');
                    stream.skip();
                    this.contents = this.unescape(this.contents);
                    return;
                }
                const child = new XML_Element(null, null, this);
                child.parseStream(stream);
            } else {
                this.contents += ch;
            }
        }
    }
}

// XML_Element preferences settings:

XML_Element.prototype.indentation = '  ';

// XML_Element instance creation:










