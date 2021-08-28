// Global Functions ////////////////////////////////////////////////////

import { Point } from "./point";

interface HTMLCanvasElement2 extends HTMLCanvasElement {
    isRetinaEnabled?: boolean;    
}

type MorphicSettings = {
    minimumFontHeight: number; // browser settings
    globalFontFamily: string;
    menuFontName: string;
    menuFontSize: number;
    bubbleHelpFontSize: number;
    prompterFontName: string;
    prompterFontSize: number;
    prompterSliderSize: number;
    handleSize: number;
    scrollBarSize: number;
    mouseScrollAmount: number;
    useSliderForInput: boolean;
    isTouchDevice: boolean; // turned on by touch events, don't set
    rasterizeSVGs: boolean;
    isFlat: boolean;
    grabThreshold: number,
    showHoles: false
};

const standardSettings: MorphicSettings = {
    minimumFontHeight: getMinimumFontHeight(), // browser settings
    globalFontFamily: '',
    menuFontName: 'sans-serif',
    menuFontSize: 12,
    bubbleHelpFontSize: 10,
    prompterFontName: 'sans-serif',
    prompterFontSize: 12,
    prompterSliderSize: 10,
    handleSize: 15,
    scrollBarSize: 9, // was 12,
    mouseScrollAmount: 40,
    useSliderForInput: false,
    isTouchDevice: false, // turned on by touch events, don't set
    rasterizeSVGs: false,
    isFlat: false,
    grabThreshold: 5,
    showHoles: false
};

const MorphicPreferences = standardSettings;

export function nop(): null {
    // do explicitly nothing
    return null;
}

export function localize(string: string): string {
    // override this function with custom localizations
    return string;
}

export function isNil(thing: any): boolean {
    return thing === undefined || thing === null;
}

export function contains(list: any[], element: any): boolean {
    // answer true if element is a member of list
    return list.indexOf(element) !== -1;
}

export function detect(list: any[], predicate: (each: any) => boolean): any {
    // answer the first element of list for which predicate evaluates
    // true, otherwise answer null
    var i,
        size = list.length;
    for (i = 0; i < size; i += 1) {
        if (predicate.call(null, list[i])) {
            return list[i];
        }
    }
    return null;
}

export function sizeOf(object: object): number {
    // answer the number of own properties
    var size = 0,
        key;
    for (key in object) {
        if (Object.prototype.hasOwnProperty.call(object, key)) {
            size += 1;
        }
    }
    return size;
}

export function isString(target: any): boolean {
    return typeof target === "string" || target instanceof String;
}

export function isObject(target: any): boolean {
    return (
        target !== null && (typeof target === "object" || target instanceof Object)
    );
}

export function radians(degrees: number): number {
    return (degrees * Math.PI) / 180;
}

export function degrees(radians: number): number {
    return (radians * 180) / Math.PI;
}

export function fontHeight(height: number): number {
    var minHeight = Math.max(height, MorphicPreferences.minimumFontHeight);
    return minHeight * 1.2; // assuming 1/5 font size for ascenders
}

export function isWordChar(aCharacter: string): RegExpMatchArray | null {
    // can't use \b or \w because they ignore diacritics
    return aCharacter.match(/[A-zÀ-ÿ0-9]/);
}

export function isURLChar(aCharacter: string): RegExpMatchArray | null {
    return aCharacter.match(/[A-z0-9./:?&_+%-]/);
}

export function isURL(text: string): boolean {
    return /^https?:\/\//.test(text);
}

export function newCanvas(
    extentPoint: Point,
    nonRetina = false,
    recycleMe?: HTMLCanvasElement2
): HTMLCanvasElement2 {
    // answer a new empty instance of Canvas, don't display anywhere
    // nonRetina - optional Boolean "false"
    // by default retina support is automatic
    // optional existing canvas to be used again, unless it is marked as
    // being shared among Morphs (dataset property "morphicShare")
    nonRetina = nonRetina || false;
    const ext = (
        extentPoint ||
        (recycleMe ? new Point(recycleMe.width, recycleMe.height) : new Point(0, 0))
    ).ceil();
    var canvas: HTMLCanvasElement2;
    if (
        recycleMe &&
        !recycleMe.dataset.morphicShare &&
        (recycleMe.isRetinaEnabled || false) !== nonRetina &&
        ext.x === recycleMe.width &&
        ext.y === recycleMe.height
    ) {
        canvas = recycleMe;
        const ctx = canvas.getContext("2d");
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        return canvas;
    } else {
        canvas = document.createElement("canvas");
        canvas.width = ext.x;
        canvas.height = ext.y;
    }
    if (nonRetina && canvas.isRetinaEnabled) {
        canvas.isRetinaEnabled = false;
    }
    return canvas;
}

export function copyCanvas(
    aCanvas: HTMLCanvasElement2
): HTMLCanvasElement2 | undefined {
    // answer a deep copy of a canvas element respecting its retina status
    if (aCanvas && aCanvas.width && aCanvas.height) {
        const canvas = newCanvas(
            new Point(aCanvas.width, aCanvas.height),
            !aCanvas.isRetinaEnabled
        );
        const ctx = canvas.getContext("2d");
        if (ctx) {
            ctx.drawImage(aCanvas, 0, 0);
        }
        return canvas;
    }
    return aCanvas;
}

export function getMinimumFontHeight() {
    // answer the height of the smallest font renderable in pixels
    const str = "I";
    const size = 50;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (ctx) {
        ctx.font = "1px serif";
        const maxX = ctx.measureText(str).width;
        ctx.fillStyle = "black";
        ctx.textBaseline = "bottom";
        ctx.fillText(str, 0, size);
        for (let y = 0; y < size; y += 1) {
            for (let x = 0; x < maxX; x += 1) {
                const data = ctx.getImageData(x, y, 1, 1);
                if (data.data[3] !== 0) {
                    return size - y + 1;
                }
            }
        }
    }
    return 0;
}

export function getDocumentPositionOf(aDOMelement: HTMLModElement) {
    // answer the relative coordinates of a DOM element in the viewport
    const rect = aDOMelement.getBoundingClientRect(),
        scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
        scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    return { x: rect.left + scrollLeft, y: rect.top + scrollTop };
}

export function copy(target: any): any {
    // answer a shallow copy of target
    if (typeof target !== "object") {
        return target;
    }
    const value = target.valueOf();
    if (target !== value) {
        return new target.constructor(value);
    }
    var c: any;
    var property: string;
    if (target instanceof target.constructor && target.constructor !== Object) {
        c = Object.create(target.constructor.prototype);
        const keys = Object.keys(target);
        var l, i: number;
        for (l = keys.length, i = 0; i < l; i += 1) {
            property = keys[i];
            if (target[property] instanceof HTMLCanvasElement) {
                // tag canvas elements as being shared,
                // so the next time when rerendering a Morph
                // instead of recycling the shared canvas a
                // new unshared one get created
                // see newCanvas() function
                target[property].dataset.morphicShare = "true";
            }
            c[property] = target[property];
        }
    } else {
        c = {};
        for (property in target) {
            c[property] = target[property];
        }
    }
    return c;
}
