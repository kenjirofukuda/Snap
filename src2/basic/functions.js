// Global Functions ////////////////////////////////////////////////////

function nop() {
    // do explicitly nothing
    return null;
}

function localize(string) {
    // override this function with custom localizations
    return string;
}

function isNil(thing) {
    return thing === undefined || thing === null;
}

function contains(list, element) {
    // answer true if element is a member of list
    return list.indexOf(element) !== -1;
}

function detect(list, predicate) {
    // answer the first element of list for which predicate evaluates
    // true, otherwise answer null
    var i, size = list.length;
    for (i = 0; i < size; i += 1) {
        if (predicate.call(null, list[i])) {
            return list[i];
        }
    }
    return null;
}

function sizeOf(object) {
    // answer the number of own properties
    var size = 0, key;
    for (key in object) {
        if (Object.prototype.hasOwnProperty.call(object, key)) {
            size += 1;
        }
    }
    return size;
}

function isString(target) {
    return typeof target === 'string' || target instanceof String;
}

function isObject(target) {
    return target !== null &&
        (typeof target === 'object' || target instanceof Object);
}

function radians(degrees) {
    return degrees * Math.PI / 180;
}

function degrees(radians) {
    return radians * 180 / Math.PI;
}

function fontHeight(height) {
    var minHeight = Math.max(height, MorphicPreferences.minimumFontHeight);
    return minHeight * 1.2; // assuming 1/5 font size for ascenders
}

function isWordChar(aCharacter) {
    // can't use \b or \w because they ignore diacritics
    return aCharacter.match(/[A-zÀ-ÿ0-9]/);
}

function isURLChar(aCharacter) {
    return aCharacter.match(/[A-z0-9./:?&_+%-]/);
}

function isURL(text) {
    return /^https?:\/\//.test(text);
}

function newCanvas(extentPoint, nonRetina, recycleMe) {
    // answer a new empty instance of Canvas, don't display anywhere
    // nonRetina - optional Boolean "false"
    // by default retina support is automatic
    // optional existing canvas to be used again, unless it is marked as
    // being shared among Morphs (dataset property "morphicShare")
    var canvas, ext;
    nonRetina = nonRetina || false;
    ext = (extentPoint ||
            (recycleMe ? new Point(recycleMe.width, recycleMe.height)
                : new Point(0, 0))).ceil();
    if (recycleMe &&
            !recycleMe.dataset.morphicShare &&
            (recycleMe.isRetinaEnabled || false) !== nonRetina &&
            ext.x === recycleMe.width && ext.y === recycleMe.height
    ) {
        canvas = recycleMe;
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
        return canvas;
    } else {
        canvas = document.createElement('canvas');
        canvas.width = ext.x;
        canvas.height = ext.y;
    }
    if (nonRetina && canvas.isRetinaEnabled) {
        canvas.isRetinaEnabled = false;
    }
    return canvas;
}

function copyCanvas(aCanvas) {
    // answer a deep copy of a canvas element respecting its retina status
    var c;
    if (aCanvas && aCanvas.width && aCanvas.height) {
        c = newCanvas(
            new Point(aCanvas.width, aCanvas.height),
            !aCanvas.isRetinaEnabled
        );
        c.getContext("2d").drawImage(aCanvas, 0, 0);
        return c;
    }
    return aCanvas;
}

function getMinimumFontHeight() {
    // answer the height of the smallest font renderable in pixels
    var str = 'I',
        size = 50,
        canvas = document.createElement('canvas'),
        ctx,
        maxX,
        data,
        x,
        y;
    canvas.width = size;
    canvas.height = size;
    ctx = canvas.getContext('2d');
    ctx.font = '1px serif';
    maxX = ctx.measureText(str).width;
    ctx.fillStyle = 'black';
    ctx.textBaseline = 'bottom';
    ctx.fillText(str, 0, size);
    for (y = 0; y < size; y += 1) {
        for (x = 0; x < maxX; x += 1) {
            data = ctx.getImageData(x, y, 1, 1);
            if (data.data[3] !== 0) {
                return size - y + 1;
            }
        }
    }
    return 0;
}

function getDocumentPositionOf(aDOMelement) {
    // answer the relative coordinates of a DOM element in the viewport
    var rect = aDOMelement.getBoundingClientRect(),
    scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
    scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    return {x: rect.left + scrollLeft, y:rect.top + scrollTop};
}

function copy(target) {
    // answer a shallow copy of target
    var value, c, property, keys, l, i;
    if (typeof target !== 'object') {
        return target;
    }
    value = target.valueOf();
    if (target !== value) {
        return new target.constructor(value);
    }
    if (target instanceof target.constructor &&
            target.constructor !== Object) {
        c = Object.create(target.constructor.prototype);
        keys = Object.keys(target);
        for (l = keys.length, i = 0; i < l; i += 1) {
            property = keys[i];
            if (target[property] instanceof HTMLCanvasElement) {
                // tag canvas elements as being shared,
                // so the next time when rerendering a Morph
                // instead of recycling the shared canvas a
                // new unshared one get created
                // see newCanvas() function
                target[property].dataset.morphicShare = 'true';
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