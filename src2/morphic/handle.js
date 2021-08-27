/* global Point, Color, Morph, WHITE */
/**
 * I am a resize / move handle that can be attached to any Morph
 *
 * @extends Morph
 */

class HandleMorph extends Morph {
    constructor(target, minX, minY, insetX, insetY, type) {
        super();
        // if insetY is missing, it will be the same as insetX
        HandleMorph.prototype.init.call(
            this,
            target,
            minX,
            minY,
            insetX,
            insetY,
            type
        );
    }
    init(target, minX, minY, insetX, insetY, type) {
        var size = MorphicPreferences.handleSize;
        this.target = target || null;
        this.minExtent = new Point(minX || 0, minY || 0);
        this.inset = new Point(insetX || 0, insetY || insetX || 0);
        this.type = type || "resize"; // also: 'move', 'moveCenter', 'movePivot'
        this.isHighlighted = false;
        super.init();
        this.color = WHITE;
        this.isDraggable = false;
        if (this.type === "movePivot") {
            size *= 2;
        }
        this.setExtent(new Point(size, size));
        this.fixLayout();
    }
    // HandleMorph drawing:
    fixLayout() {
        if (this.target) {
            if (this.type === "moveCenter") {
                this.setCenter(this.target.center());
            } else if (this.type === "movePivot") {
                this.setCenter(this.target.rotationCenter());
            } else {
                // 'resize', 'move'
                this.setPosition(
                    this.target
                        .bottomRight()
                        .subtract(this.extent().add(this.inset))
                );
            }
            this.target.add(this);
            this.target.changed();
        }
    }
    render(ctx) {
        if (this.type === "movePivot") {
            if (this.isHighlighted) {
                this.renderCrosshairsOn(ctx, 0.5);
            } else {
                this.renderCrosshairsOn(ctx, 0.6);
            }
        } else {
            if (this.isHighlighted) {
                this.renderHandleOn(ctx, new Color(100, 100, 255), WHITE);
            } else {
                this.renderHandleOn(ctx, this.color, new Color(100, 100, 100));
            }
        }
    }
    renderCrosshairsOn(ctx, fract) {
        var r = this.width() / 2;

        // semi-transparent white background blob
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.beginPath();
        ctx.arc(r, r, r * 0.9, radians(0), radians(360), false);
        ctx.fill();

        // solid black ring
        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(r, r, r * fract, radians(0), radians(360), false);
        ctx.stroke();

        // vertically centered horizontal line
        ctx.moveTo(0, r);
        ctx.lineTo(this.width(), r);
        ctx.stroke();

        // horizontally centered vertical line
        ctx.moveTo(r, 0);
        ctx.lineTo(r, this.height());
        ctx.stroke();
    }
    renderHandleOn(ctx, color, shadowColor) {
        var isSquare = this.type.indexOf("move") === 0,
            p1 = new Point(0, this.height()), // bottom left
            p2 = new Point(this.width(), 0), // top right
            p11,
            p22,
            i;

        ctx.lineWidth = 1;
        ctx.lineCap = "round";
        ctx.strokeStyle = color.toString();

        if (isSquare) {
            p11 = p1.copy();
            p22 = p2.copy();
            for (i = 0; i <= this.height(); i = i + 6) {
                p11.y = p1.y - i;
                p22.y = p2.y - i;

                ctx.beginPath();
                ctx.moveTo(p11.x, p11.y);
                ctx.lineTo(p22.x, p22.y);
                ctx.closePath();
                ctx.stroke();
            }
        }

        p11 = p1.copy();
        p22 = p2.copy();
        for (i = 0; i <= this.width(); i = i + 6) {
            p11.x = p1.x + i;
            p22.x = p2.x + i;

            ctx.beginPath();
            ctx.moveTo(p11.x, p11.y);
            ctx.lineTo(p22.x, p22.y);
            ctx.closePath();
            ctx.stroke();
        }
        ctx.strokeStyle = shadowColor.toString();

        if (isSquare) {
            p11 = p1.copy();
            p22 = p2.copy();
            for (i = -2; i <= this.height(); i = i + 6) {
                p11.y = p1.y - i;
                p22.y = p2.y - i;

                ctx.beginPath();
                ctx.moveTo(p11.x, p11.y);
                ctx.lineTo(p22.x, p22.y);
                ctx.closePath();
                ctx.stroke();
            }
        }

        p11 = p1.copy();
        p22 = p2.copy();
        for (i = 2; i <= this.width(); i = i + 6) {
            p11.x = p1.x + i;
            p22.x = p2.x + i;

            ctx.beginPath();
            ctx.moveTo(p11.x, p11.y);
            ctx.lineTo(p22.x, p22.y);
            ctx.closePath();
            ctx.stroke();
        }
    }
    mouseDownLeft(pos) {
        var world = this.root(),
            offset;

        if (!this.target) {
            return null;
        }
        if (this.type.indexOf("move") === 0) {
            offset = pos.subtract(this.center());
        } else {
            offset = pos.subtract(this.bounds.origin);
        }

        this.step = () => {
            var newPos, newExt;
            if (world.hand.mouseButton) {
                newPos = world.hand.bounds.origin.copy().subtract(offset);
                if (this.type === "resize") {
                    newExt = newPos
                        .add(this.extent().add(this.inset))
                        .subtract(this.target.bounds.origin);
                    newExt = newExt.max(this.minExtent);
                    this.target.setExtent(newExt);

                    this.setPosition(
                        this.target
                            .bottomRight()
                            .subtract(this.extent().add(this.inset))
                    );
                } else if (this.type === "moveCenter") {
                    this.target.setCenter(newPos);
                } else if (this.type === "movePivot") {
                    this.target.setPivot(newPos);
                    this.setCenter(this.target.rotationCenter());
                } else {
                    // type === 'move'
                    this.target.setPosition(
                        newPos.subtract(this.target.extent()).add(this.extent())
                    );
                }
            } else {
                this.step = null;
            }
        };

        if (!this.target.step) {
            this.target.step = nop;
        }
    }
    // HandleMorph dragging and dropping:
    rootForGrab() {
        return this;
    }
    // HandleMorph events:
    mouseEnter() {
        this.isHighlighted = true;
        this.changed();
    }
    mouseLeave() {
        this.isHighlighted = false;
        this.changed();
    }
    // HandleMorph menu:
    attach() {
        var choices = this.overlappedMorphs(),
            menu = new MenuMorph(this, "choose target:");

        choices.forEach((each) => {
            menu.addItem(each.toString().slice(0, 50), () => {
                this.isDraggable = false;
                this.target = each;
                this.fixLayout();
            });
        });
        if (choices.length > 0) {
            menu.popUpAtHand(this.world());
        }
    }
}

HandleMorph.uber = Morph.prototype;

// HandleMorph stepping:

HandleMorph.prototype.step = null;
