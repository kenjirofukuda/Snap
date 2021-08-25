/** 
 * I can be used for slider
 * @extends Morph
 */
class CircleBoxMorph extends Morph {
    constructor(orientation) {
        super();
        CircleBoxMorph.prototype.init.call(this, orientation);
    }
    /** 
     * @param orientation {string} 'virtical' || 'horizontal' 
     */
    init(orientation) { 
        super.init();
        this.orientation = orientation || 'virtical';
        this.autoOrient = true;
        this.setExtent(new Point(20, 100));
    }
    autoOrientation() {
        if (this.height() > this.width()) {
            this.orientation = 'vertical';
        } else {
            this.orientation = 'horizontal';
        }
    }
    render(ctx) {
        var w = this.width(), h = this.height(), radius;

        if (this.autoOrient) {
            this.autoOrientation();
        }

        if (this.orientation === 'vertical') {
            radius = w / 2;
            ctx.beginPath();

            // top semi-circle
            ctx.arc(
                radius,
                radius,
                radius,
                radians(180),
                radians(0),
                false
            );

            // right line
            ctx.lineTo(
                w,
                h - radius
            );

            // bottom semi-circle
            ctx.arc(
                radius,
                h - radius,
                radius,
                radians(0),
                radians(180),
                false
            );

        } else {
            radius = h / 2;
            ctx.beginPath();

            // left semi-circle
            ctx.arc(
                radius,
                radius,
                radius,
                radians(90),
                radians(-90),
                false
            );

            // top line
            ctx.lineTo(
                w - radius,
                0
            );

            // right semi-circle
            ctx.arc(
                w - radius,
                radius,
                radius,
                radians(-90),
                radians(90),
                false
            );
        }
        ctx.closePath();
        ctx.fillStyle = this.color.toString();
        ctx.fill();
    }
    // CircleBoxMorph menu:
    developersMenu() {
        var menu = super.developersMenu();
        menu.addLine();
        if (this.orientation === 'vertical') {
            menu.addItem(
                "horizontal...",
                'toggleOrientation',
                'toggle the\norientation'
            );
        } else {
            menu.addItem(
                "vertical...",
                'toggleOrientation',
                'toggle the\norientation'
            );
        }
        return menu;
    }
    toggleOrientation() {
        var center = this.center();
        this.changed();
        if (this.orientation === 'vertical') {
            this.orientation = 'horizontal';
        } else {
            this.orientation = 'vertical';
        }
        this.setExtent(new Point(this.height(), this.width()));
        this.setCenter(center);
    }
}






