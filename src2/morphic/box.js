/** 
 * I can have an optionally rounded border 
 * @extends Morph
 */
class BoxMorph extends Morph {
    constructor(edge, border, borderColor) {
        super()
        BoxMorph.prototype.init.call(this, edge, border, borderColor);
    }

    init(edge, border, borderColor) {
        this.edge = edge || 4;
        this.border = border || ((border === 0) ? 0 : 2);
        this.borderColor = borderColor || BLACK;
        super.init();
    }

    // BoxMorph drawing:
    render(ctx) {
        if ((this.edge === 0) && (this.border === 0)) {
            super.render(ctx);
            return;
        }
        ctx.fillStyle = this.color.toString();
        ctx.beginPath();
        this.outlinePath(
            ctx,
            Math.max(this.edge - this.border, 0),
            this.border
        );
        ctx.closePath();
        ctx.fill();
        if (this.border > 0) {
            ctx.lineWidth = this.border;
            ctx.strokeStyle = this.borderColor.toString();
            ctx.beginPath();
            this.outlinePath(ctx, this.edge, this.border / 2);
            ctx.closePath();
            ctx.stroke();
        }
    }
    outlinePath(ctx, corner, inset) {
        var w = this.width(), h = this.height(), radius = Math.min(corner, (Math.min(w, h) - inset) / 2), offset = radius + inset;

        // top left:
        ctx.arc(
            offset,
            offset,
            radius,
            radians(-180),
            radians(-90),
            false
        );
        // top right:
        ctx.arc(
            w - offset,
            offset,
            radius,
            radians(-90),
            radians(-0),
            false
        );
        // bottom right:
        ctx.arc(
            w - offset,
            h - offset,
            radius,
            radians(0),
            radians(90),
            false
        );
        // bottom left:
        ctx.arc(
            offset,
            h - offset,
            radius,
            radians(90),
            radians(180),
            false
        );
    }
    // BoxMorph menus:
    developersMenu() {
        var menu = super.developersMenu();
        menu.addLine();
        menu.addItem(
            "border width...",
            () => {
                this.prompt(
                    menu.title + '\nborder\nwidth:',
                    this.setBorderWidth,
                    this,
                    this.border.toString(),
                    null,
                    0,
                    100,
                    true
                );
            },
            'set the border\'s\nline size'
        );
        menu.addItem(
            "border color...",
            () => {
                this.pickColor(
                    menu.title + '\nborder color:',
                    this.setBorderColor,
                    this,
                    this.borderColor
                );
            },
            'set the border\'s\nline color'
        );
        menu.addItem(
            "corner size...",
            () => {
                this.prompt(
                    menu.title + '\ncorner\nsize:',
                    this.setCornerSize,
                    this,
                    this.edge.toString(),
                    null,
                    0,
                    100,
                    true
                );
            },
            'set the corner\'s\nradius'
        );
        return menu;
    }
    setBorderWidth(size) {
        // for context menu demo purposes
        var newSize;
        if (typeof size === 'number') {
            this.border = Math.max(size, 0);
        } else {
            newSize = parseFloat(size);
            if (!isNaN(newSize)) {
                this.border = Math.max(newSize, 0);
            }
        }
        this.changed();
    }
    setBorderColor(color) {
        // for context menu demo purposes
        if (color) {
            this.borderColor = color;
            this.changed();
        }
    }
    setCornerSize(size) {
        // for context menu demo purposes
        var newSize;
        if (typeof size === 'number') {
            this.edge = Math.max(size, 0);
        } else {
            newSize = parseFloat(size);
            if (!isNaN(newSize)) {
                this.edge = Math.max(newSize, 0);
            }
        }
        this.changed();
    }
    colorSetters() {
        // for context menu demo purposes
        return ['color', 'borderColor'];
    }
    numericalSetters() {
        // for context menu demo purposes
        var list = super.numericalSetters();
        list.push('setBorderWidth', 'setCornerSize');
        return list;
    }
}










