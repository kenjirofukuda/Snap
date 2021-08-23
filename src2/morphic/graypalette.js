// GrayPaletteMorph ///////////////////////////////////////////////////

// var GrayPaletteMorph;

// GrayPaletteMorph inherits from ColorPaletteMorph:

// GrayPaletteMorph.prototype = new ColorPaletteMorph();
// ;


// GrayPaletteMorph instance creation:

class GrayPaletteMorph extends ColorPaletteMorph {
    constructor(target, sizePoint) {
        super(target, sizePoint || new Point(80, 10));
    }

    render(ctx) {
        var ext = this.extent(), gradient;

        this.choice = BLACK;
        gradient = ctx.createLinearGradient(0, 0, ext.x, ext.y);
        gradient.addColorStop(0, 'black');
        gradient.addColorStop(1, 'white');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, ext.x, ext.y);
    }
}

GrayPaletteMorph.uber = ColorPaletteMorph.prototype;

