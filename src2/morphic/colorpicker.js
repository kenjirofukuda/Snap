class ColorPickerMorph extends Morph {
    constructor(defaultColor) {
        super();
        ColorPickerMorph.prototype.init.call(this, defaultColor);
    }
    init(defaultColor) {
        this.choice = defaultColor || WHITE;
        super.init();
        this.color = WHITE;
        this.setExtent(new Point(80, 80));
    }
    fixLayout() {
        var cpal, gpal, x, y;

        this.children.forEach((child) => child.destroy());
        this.children = [];
        this.feedback = new Morph();
        this.feedback.color = this.choice;
        this.feedback.setExtent(new Point(20, 20));
        cpal = new ColorPaletteMorph(
            this.feedback,
            new Point(this.width(), 50)
        );
        gpal = new GrayPaletteMorph(this.feedback, new Point(this.width(), 5));
        cpal.setPosition(this.bounds.origin);
        this.add(cpal);
        gpal.setPosition(cpal.bottomLeft());
        this.add(gpal);
        x =
            gpal.left() +
            Math.floor((gpal.width() - this.feedback.width()) / 2);
        y =
            gpal.bottom() +
            Math.floor(
                (this.bottom() - gpal.bottom() - this.feedback.height()) / 2
            );
        this.feedback.setPosition(new Point(x, y));
        this.add(this.feedback);
    }
    getChoice() {
        return this.feedback.color;
    }
    rootForGrab() {
        return this;
    }
}
