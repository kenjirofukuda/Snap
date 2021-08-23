// var ColorPaletteMorph;

// ColorPaletteMorph inherits from Morph:

// ColorPaletteMorph.prototype = new Morph();
// ;

// ColorPaletteMorph instance creation:

class ColorPaletteMorph extends Morph {
    constructor(target, sizePoint) {
        super()
        this.init(
            target || null,
            sizePoint || new Point(80, 50)
        );
    }
    init(target, size) {
        super.init();
        this.isCachingImage = true;
        this.target = target;
        this.targetSetter = 'color';
        this.setExtent(size);
        this.choice = null;
    }
    render(ctx) {
        var ext = this.extent(), x, y, h, l;

        this.choice = BLACK;
        for (x = 0; x <= ext.x; x += 1) {
            h = 360 * x / ext.x;
            for (y = 0; y <= ext.y; y += 1) {
                l = 100 - (y / ext.y * 100);
                ctx.fillStyle = 'hsl(' + h + ',100%,' + l + '%)';
                ctx.fillRect(x, y, 1, 1);
            }
        }
    }
    mouseMove(pos) {
        this.choice = this.getPixelColor(pos);
        this.updateTarget();
    }
    mouseDownLeft(pos) {
        this.choice = this.getPixelColor(pos);
        this.updateTarget();
    }
    updateTarget() {
        if (this.target instanceof Morph && this.choice !== null) {
            if (this.target[this.targetSetter] instanceof Function) {
                this.target[this.targetSetter](this.choice);
            } else {
                this.target[this.targetSetter] = this.choice;
                this.target.rerender();
            }
        }
    }
    // ColorPaletteMorph menu:
    developersMenu() {
        var menu = ColorPaletteMorph.uber.developersMenu.call(this);
        menu.addLine();
        menu.addItem(
            'set target',
            "setTarget",
            'choose another morph\nwhose color property\n will be' +
            ' controlled by this one'
        );
        return menu;
    }
    setTarget() {
        var choices = this.overlappedMorphs(), menu = new MenuMorph(this, 'choose target:');

        choices.push(this.world());
        choices.forEach(each => {
            menu.addItem(each.toString().slice(0, 50), () => {
                this.target = each;
                this.setTargetSetter();
            });
        });
        if (choices.length === 1) {
            this.target = choices[0];
            this.setTargetSetter();
        } else if (choices.length > 0) {
            menu.popUpAtHand(this.world());
        }
    }
    setTargetSetter() {
        var choices = this.target.colorSetters(), menu = new MenuMorph(this, 'choose target property:');

        choices.forEach(each => {
            menu.addItem(each, () => this.targetSetter = each);
        });
        if (choices.length === 1) {
            this.targetSetter = choices[0];
        } else if (choices.length > 0) {
            menu.popUpAtHand(this.world());
        }
    }
}

ColorPaletteMorph.uber = Morph.prototype;










