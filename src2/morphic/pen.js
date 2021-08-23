// PenMorph ////////////////////////////////////////////////////////////

// I am a simple LOGO-wise turtle.

// PenMorph: referenced constructors

// var PenMorph;

// PenMorph inherits from Morph:

// PenMorph.prototype = new Morph();
// ;
// PenMorph.uber = Morph.prototype;

// PenMorph instance creation:

class PenMorph extends Morph {
    constructor() {
        super()
        this.init();
    }
    init() {
        var size = MorphicPreferences.handleSize * 4;

        // additional properties:
        this.isWarped = false; // internal optimization
        this.heading = 0;
        this.isDown = true;
        this.size = 1;
        this.penPoint = 'tip'; // or 'center"
        this.penBounds = null; // rect around the visible arrow shape

        super.init();
        this.setExtent(new Point(size, size));
    }
    // PenMorph updating - optimized for warping, i.e atomic recursion
    changed() {
        if (this.isWarped) { return; }
        super.changed()

    }
    // PenMorph display:
    render(ctx, facing) {
        // my orientation can be overridden with the "facing" parameter to
        // implement Scratch-style rotation styles
        var start, dest, left, right, len, direction = facing || this.heading;

        len = this.width() / 2;
        start = this.center().subtract(this.bounds.origin);

        if (this.penPoint === 'tip') {
            dest = start.distanceAngle(len * 0.75, direction - 180);
            left = start.distanceAngle(len, direction + 195);
            right = start.distanceAngle(len, direction - 195);
        } else { // 'middle'
            dest = start.distanceAngle(len * 0.75, direction);
            left = start.distanceAngle(len * 0.33, direction + 230);
            right = start.distanceAngle(len * 0.33, direction - 230);
        }

        // cache penBounds
        this.penBounds = new Rectangle(
            Math.min(start.x, dest.x, left.x, right.x),
            Math.min(start.y, dest.y, left.y, right.y),
            Math.max(start.x, dest.x, left.x, right.x),
            Math.max(start.y, dest.y, left.y, right.y)
        );

        // draw arrow shape
        ctx.fillStyle = this.color.toString();
        ctx.beginPath();

        ctx.moveTo(start.x, start.y);
        ctx.lineTo(left.x, left.y);
        ctx.lineTo(dest.x, dest.y);
        ctx.lineTo(right.x, right.y);

        ctx.closePath();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fill();
    }
    // PenMorph access:
    setHeading(degrees) {
        this.heading = ((+degrees % 360) + 360) % 360;
        this.fixLayout();
        this.rerender();
    }
    numericalSetters() {
        // for context menu demo purposes
        return [
            'setLeft',
            'setTop',
            'setWidth',
            'setHeight',
            'setAlphaScaled',
            'setHeading'
        ];
    }
    // PenMorph menu:
    developersMenu() {
        var menu = super.developersMenu();
        menu.addLine();
        menu.addItem(
            'set rotation',
            "setRotation",
            'interactively turn this morph\nusing a dial widget'
        );
        return menu;
    }
    setRotation() {
        var menu, dial, name = this.name || this.constructor.name;
        if (name.length > 10) {
            name = name.slice(0, 9) + '...';
        }
        menu = new MenuMorph(this, name);
        dial = new DialMorph(null, null, this.heading);
        dial.rootForGrab = () => dial;
        dial.target = this;
        dial.action = 'setHeading';
        menu.items.push(dial);
        menu.addLine();
        menu.addItem('(90) right', () => this.setHeading(90));
        menu.addItem('(-90) left', () => this.setHeading(-90));
        menu.addItem('(0) up', () => this.setHeading(0));
        menu.addItem('(180) down', () => this.setHeading(180));
        menu.isDraggable = true;
        menu.popUpAtHand(this.world());
    }
    // PenMorph drawing:
    drawLine(start, dest) {
        var context = this.parent.penTrails().getContext('2d'), from = start.subtract(this.parent.bounds.origin), to = dest.subtract(this.parent.bounds.origin);
        if (this.isDown) {
            context.lineWidth = this.size;
            context.strokeStyle = this.color.toString();
            context.lineCap = 'round';
            context.lineJoin = 'round';
            context.beginPath();
            context.moveTo(from.x, from.y);
            context.lineTo(to.x, to.y);
            context.stroke();
            if (this.isWarped === false) {
                this.world().broken.push(
                    start.rectangle(dest).expandBy(
                        Math.max(this.size / 2, 1)
                    ).intersect(this.parent.visibleBounds()).spread()
                );
            }
        }
    }
    // PenMorph turtle ops:
    turn(degrees) {
        this.setHeading(this.heading + parseFloat(degrees));
    }
    forward(steps) {
        var start = this.center(), dest, dist = parseFloat(steps);
        if (dist >= 0) {
            dest = this.position().distanceAngle(dist, this.heading);
        } else {
            dest = this.position().distanceAngle(
                Math.abs(dist),
                (this.heading - 180)
            );
        }
        this.setPosition(dest);
        this.drawLine(start, this.center());
    }
    down() {
        this.isDown = true;
    }
    up() {
        this.isDown = false;
    }
    clear() {
        this.parent.rerender();
    }
    // PenMorph optimization for atomic recursion:
    startWarp() {
        this.isWarped = true;
    }
    endWarp() {
        this.isWarped = false;
        this.parent.changed();
    }
    warp(fun) {
        this.startWarp();
        fun.call(this);
        this.endWarp();
    }
    warpOp(selector, argsArray) {
        this.startWarp();
        this[selector].apply(this, argsArray);
        this.endWarp();
    }
    // PenMorph demo ops:
    // try these with WARP eg.: this.warp(function () {tree(12, 120, 20)})
    warpSierpinski(length, min) {
        this.warpOp('sierpinski', [length, min]);
    }
    sierpinski(length, min) {
        var i;
        if (length > min) {
            for (i = 0; i < 3; i += 1) {
                this.sierpinski(length * 0.5, min);
                this.turn(120);
                this.forward(length);
            }
        }
    }
    warpTree(level, length, angle) {
        this.warpOp('tree', [level, length, angle]);
    }
    tree(level, length, angle) {
        if (level > 0) {
            this.size = level;
            this.forward(length);
            this.turn(angle);
            this.tree(level - 1, length * 0.75, angle);
            this.turn(angle * -2);
            this.tree(level - 1, length * 0.75, angle);
            this.turn(angle);
            this.forward(-length);
        }
    }
}





















