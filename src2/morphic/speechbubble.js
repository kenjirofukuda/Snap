/** 
 * I am a comic-style speech bubble that can display either a string,
 * a Morph, a Canvas or a toString() representation of anything else.
 * If I am invoked using popUp() I behave like a tool tip.
 * 
 * @extends BlinkerMorph
 */
class SpeechBubbleMorph extends BoxMorph {
    constructor(contents,
        color,
        edge,
        border,
        borderColor,
        padding,
        isThought,
        noShadow) {
        super(
            edge || 6,
            border || ((border === 0) ? 0 : 1),
            borderColor || new Color(140, 140, 140)
        );
        SpeechBubbleMorph.prototype.init.call(
            this, contents, color, edge, border, borderColor,padding, isThought, noShadow)
    }
    
    init(contents,
        color,
        edge,
        border,
        borderColor,
        padding,
        isThought,
        noShadow // explicit TRUE to suppress
    ) {
        this.isPointingRight = true; // orientation of text
        this.contents = contents || '';
        this.padding = padding || 0; // additional vertical pixels
        this.isThought = isThought || false; // draw "think" bubble
        this.isClickable = false;
        super.init(
            edge || 6,
            border || ((border === 0) ? 0 : 1),
            borderColor || new Color(140, 140, 140)
        );
        this.hasShadow = noShadow !== true;
        this.noDropShadow = true;
        this.fullShadowSource = false;
        this.color = color || new Color(230, 230, 230);
        this.fixLayout();
    }
    // SpeechBubbleMorph invoking:
    popUp(world, pos, isClickable) {
        this.fixLayout();
        this.setPosition(pos.subtract(new Point(0, this.height())));
        this.keepWithin(world);
        world.add(this);
        this.fullChanged();
        world.hand.destroyTemporaries();
        world.hand.temporaries.push(this);

        if (!isClickable) {
            this.mouseEnter = this.destroy;
        } else {
            this.isClickable = true;
        }
    }
    // SpeechBubbleMorph drawing:
    fixLayout() {
        // determine my extent and arrange my contents
        if (this.contentsMorph) {
            this.contentsMorph.destroy();
        }
        if (this.contents instanceof Morph) {
            this.contentsMorph = this.contents;
        } else if (isString(this.contents)) {
            this.contentsMorph = new TextMorph(
                this.contents,
                MorphicPreferences.bubbleHelpFontSize,
                null,
                false,
                true,
                'center'
            );
        } else if (this.contents instanceof HTMLCanvasElement) {
            this.contentsMorph = new Morph();
            this.contentsMorph.setExtent(new Point(
                this.contents.width,
                this.contents.height
            ));
            this.contentsMorph.cachedImage = this.contents;
        } else {
            this.contentsMorph = new TextMorph(
                this.contents.toString(),
                MorphicPreferences.bubbleHelpFontSize,
                null,
                false,
                true,
                'center'
            );
        }
        this.add(this.contentsMorph);

        // adjust my layout
        this.bounds.setExtent(
            new Point(
                this.contentsMorph.width() +
                (this.padding ? this.padding * 2 : this.edge * 2),
                this.contentsMorph.height() +
                this.edge +
                this.border * 2 +
                this.padding * 2 +
                2
            )
        );

        // position my contents
        this.contentsMorph.setPosition(this.position().add(
            new Point(
                this.padding || this.edge,
                this.border + this.padding + 1
            )
        ));

        // refresh a shallow shadow
        if (this.hasShadow) {
            this.removeShadow();
            this.addShadow(new Point(2, 2), 80);
        }
    }
    outlinePath(ctx, radius, inset) {
        var offset = radius + inset, w = this.width(), h = this.height(), rad;

        function circle(x, y, r) {
            ctx.moveTo(x + r, y);
            ctx.arc(x, y, r, radians(0), radians(360));
        }

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
            h - offset - radius,
            radius,
            radians(0),
            radians(90),
            false
        );
        if (!this.isThought) { // draw speech bubble hook
            if (this.isPointingRight) {
                ctx.lineTo(
                    offset + radius,
                    h - offset
                );
                ctx.lineTo(
                    radius / 2 + inset,
                    h - inset
                );
            } else { // pointing left
                ctx.lineTo(
                    w - (radius / 2 + inset),
                    h - inset
                );
                ctx.lineTo(
                    w - (offset + radius),
                    h - offset
                );
            }
        }
        // bottom left:
        ctx.arc(
            offset,
            h - offset - radius,
            radius,
            radians(90),
            radians(180),
            false
        );
        if (this.isThought === true) { // use anything but "true" to draw nothing
            // close large bubble:
            ctx.lineTo(
                inset,
                offset
            );
            // draw thought bubbles:
            if (this.isPointingRight) {
                // tip bubble:
                rad = radius / 4;
                circle(
                    rad + inset,
                    h - rad - inset,
                    rad
                );
                // middle bubble:
                rad = radius / 3.2;
                circle(
                    (rad * 2) + inset,
                    h - rad - (inset * 2),
                    rad
                );
                // top bubble:
                rad = radius / 2.8;
                circle(
                    (rad * 3) + inset * 2,
                    h - rad - (inset * 4),
                    rad
                );
            } else { // pointing left
                // tip bubble:
                rad = radius / 4;
                circle(
                    w - (rad + inset),
                    h - rad - inset,
                    rad
                );
                // middle bubble:
                rad = radius / 3.2;
                circle(
                    w - (rad * 2 + inset),
                    h - rad - inset * 2,
                    rad
                );
                // top bubble:
                rad = radius / 2.8;
                circle(
                    w - (rad * 3 + inset * 2),
                    h - rad - inset * 4,
                    rad
                );
            }
        }
    }
    // SpeechBubbleMorph shadow
    /*
        only take the 'plain' image, so the box rounding and the
        shadow doesn't become conflicted by embedded scrolling panes
    */
    shadowImage(off, color) {
        // for "flat" design mode
        var fb, img, outline, sha, ctx, offset = off || new Point(7, 7), clr = color || new Color(0, 0, 0);
        fb = this.extent();
        img = this.getImage();
        outline = newCanvas(fb);
        ctx = outline.getContext('2d');
        ctx.drawImage(img, 0, 0);
        ctx.globalCompositeOperation = 'destination-out';
        ctx.drawImage(
            img,
            -offset.x,
            -offset.y
        );
        sha = newCanvas(fb);
        ctx = sha.getContext('2d');
        ctx.drawImage(outline, 0, 0);
        ctx.globalCompositeOperation = 'source-atop';
        ctx.fillStyle = clr.toString();
        ctx.fillRect(0, 0, fb.x, fb.y);
        return sha;
    }
    shadowImageBlurred(off, color) {
        var fb, img, sha, ctx, offset = off || new Point(7, 7), blur = this.shadowBlur, clr = color || new Color(0, 0, 0);
        fb = this.extent().add(blur * 2);
        img = this.getImage();
        sha = newCanvas(fb);
        ctx = sha.getContext('2d');
        ctx.shadowOffsetX = offset.x;
        ctx.shadowOffsetY = offset.y;
        ctx.shadowBlur = blur;
        ctx.shadowColor = clr.toString();
        ctx.drawImage(
            img,
            blur - offset.x,
            blur - offset.y
        );
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowBlur = 0;
        ctx.globalCompositeOperation = 'destination-out';
        ctx.drawImage(
            img,
            blur - offset.x,
            blur - offset.y
        );
        return sha;
    }
}







