class SliderButtonMorph extends CircleBoxMorph {
    constructor(orientation) {
        super(orientation);
        this.init(orientation);
    }
    init(orientation) {
        this.color = new Color(80, 80, 80);
        this.highlightColor = new Color(90, 90, 140);
        this.pressColor = new Color(80, 80, 160);
        this.userState = 'normal'; // 'highlight', 'pressed'
        this.is3D = false;
        this.hasMiddleDip = true;
        super.init(orientation);
    }
    render(ctx) {
        var colorBak = this.color;
        if (this.userState === 'highlight') {
            this.color = this.highlightColor;
        } else if (this.userState === 'pressed') {
            this.color = this.pressColor;
        }
        super.render(ctx);
        if (this.is3D || !MorphicPreferences.isFlat) {
            this.renderEdges(ctx);
        }
        this.color = colorBak;
    }
    renderEdges(ctx) {
        var gradient, radius, w = this.width(), h = this.height();

        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        if (this.orientation === 'vertical') {
            ctx.lineWidth = w / 3;
            gradient = ctx.createLinearGradient(
                0,
                0,
                ctx.lineWidth,
                0
            );
            gradient.addColorStop(0, 'white');
            gradient.addColorStop(1, this.color.toString());

            ctx.strokeStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(ctx.lineWidth * 0.5, w / 2);
            ctx.lineTo(ctx.lineWidth * 0.5, h - w / 2);
            ctx.stroke();

            gradient = ctx.createLinearGradient(
                w - ctx.lineWidth,
                0,
                w,
                0
            );
            gradient.addColorStop(0, this.color.toString());
            gradient.addColorStop(1, 'black');

            ctx.strokeStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(w - ctx.lineWidth * 0.5, w / 2);
            ctx.lineTo(w - ctx.lineWidth * 0.5, h - w / 2);
            ctx.stroke();

            if (this.hasMiddleDip) {
                gradient = ctx.createLinearGradient(
                    ctx.lineWidth,
                    0,
                    w - ctx.lineWidth,
                    0
                );

                radius = w / 4;
                gradient.addColorStop(0, 'black');
                gradient.addColorStop(0.35, this.color.toString());
                gradient.addColorStop(0.65, this.color.toString());
                gradient.addColorStop(1, 'white');

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(
                    w / 2,
                    h / 2,
                    radius,
                    radians(0),
                    radians(360),
                    false
                );
                ctx.closePath();
                ctx.fill();
            }
        } else if (this.orientation === 'horizontal') {
            ctx.lineWidth = h / 3;
            gradient = ctx.createLinearGradient(
                0,
                0,
                0,
                ctx.lineWidth
            );
            gradient.addColorStop(0, 'white');
            gradient.addColorStop(1, this.color.toString());

            ctx.strokeStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(h / 2, ctx.lineWidth * 0.5);
            ctx.lineTo(w - h / 2, ctx.lineWidth * 0.5);
            ctx.stroke();

            gradient = ctx.createLinearGradient(
                0,
                h - ctx.lineWidth,
                0,
                h
            );
            gradient.addColorStop(0, this.color.toString());
            gradient.addColorStop(1, 'black');

            ctx.strokeStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(h / 2, h - ctx.lineWidth * 0.5);
            ctx.lineTo(w - h / 2, h - ctx.lineWidth * 0.5);
            ctx.stroke();

            if (this.hasMiddleDip) {
                gradient = ctx.createLinearGradient(
                    0,
                    ctx.lineWidth,
                    0,
                    h - ctx.lineWidth
                );

                radius = h / 4;
                gradient.addColorStop(0, 'black');
                gradient.addColorStop(0.35, this.color.toString());
                gradient.addColorStop(0.65, this.color.toString());
                gradient.addColorStop(1, 'white');

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(
                    this.width() / 2,
                    this.height() / 2,
                    radius,
                    radians(0),
                    radians(360),
                    false
                );
                ctx.closePath();
                ctx.fill();
            }
        }
    }
    //SliderButtonMorph events:
    mouseEnter() {
        this.userState = 'highlight';
        this.rerender();
    }
    mouseLeave() {
        this.userState = 'normal';
        this.rerender();
    }
    mouseDownLeft(pos) {
        this.userState = 'pressed';
        this.rerender();
        this.escalateEvent('mouseDownLeft', pos);
    }
    mouseClickLeft() {
        this.userState = 'highlight';
        this.rerender();
    }
    mouseMove() {
        // prevent my parent from getting picked up
        nop();
    }
}

SliderButtonMorph.prototype.autoOrientation = nop;