// Morphs //////////////////////////////////////////////////////////////

// Morph: referenced constructors

// var Morph;
var WorldMorph;
var HandMorph;
// var ShadowMorph;
var FrameMorph;
// var MenuMorph;
// var HandleMorph;
var StringFieldMorph;
// var ckerMorph;
var SliderMorph;
var ScrollFrameMorph;
var InspectorMorph;
// var StringMorph;
var TextMorph;

// Morph inherits from Node:

// Morph.prototype = new Node();
// Morph.prototype.constructor = Morph;
// Morph.uber = Node.prototype;

// Morph settings:

// Morph.prototype.shadowBlur = 4;

// Morph instance creation:

class Morph extends Node {
    shadowBlur = 4;

    constructor(parent, childrenArray) {
        super(parent, childrenArray)
        this.isMorph = true; // used to optimize deep copying
        this.cachedImage = null;
        this.isCachingImage = false;
        this.shouldRerender = false;
        this.bounds = new Rectangle(0, 0, 50, 40);
        this.holes = []; // list of "untouchable" regions (rectangles)
        this.color = new Color(80, 80, 80);
        this.texture = null; // optional url of a fill-image
        this.cachedTexture = null; // internal cache of actual bg image
        this.alpha = 1;
        this.isVisible = true;
        this.isDraggable = false;
        this.isTemplate = false;
        this.acceptsDrops = false;
        this.isFreeForm = false;
        this.noDropShadow = false;
        this.fullShadowSource = true;
        this.fps = 0;
        this.customContextMenu = null;
        this.lastTime = Date.now();
        this.onNextStep = null; // optional function to be run once
    }

    // Morph initialization:
    init() {
        console.log("Morph>>init")
        super.init();
        this.isMorph = true; // used to optimize deep copying
        this.cachedImage = null;
        this.isCachingImage = false;
        this.shouldRerender = false;
        this.bounds = new Rectangle(0, 0, 50, 40);
        this.holes = []; // list of "untouchable" regions (rectangles)
        this.color = new Color(80, 80, 80);
        this.texture = null; // optional url of a fill-image
        this.cachedTexture = null; // internal cache of actual bg image
        this.alpha = 1;
        this.isVisible = true;
        this.isDraggable = false;
        this.isTemplate = false;
        this.acceptsDrops = false;
        this.isFreeForm = false;
        this.noDropShadow = false;
        this.fullShadowSource = true;
        this.fps = 0;
        this.customContextMenu = null;
        this.lastTime = Date.now();
        this.onNextStep = null; // optional function to be run once
    }
    // Morph string representation: e.g. 'a Morph 2 [20@45 | 130@250]'
    toString() {
        return 'a ' +
            (this.constructor.name ||
                this.constructor.toString().split(' ')[1].split('(')[0]) +
            ' ' +
            this.children.length.toString() + ' ' +
            this.bounds;
    }
    // Morph deleting:
    destroy() {
        if (this.parent !== null) {
            this.fullChanged();
            this.parent.removeChild(this);
        }
    }
    // Morph stepping:
    stepFrame() {
        if (!this.step) {
            return null;
        }
        var current, elapsed, leftover, nxt;
        current = Date.now();
        elapsed = current - this.lastTime;
        if (this.fps > 0) {
            leftover = (1000 / this.fps) - elapsed;
        } else {
            leftover = 0;
        }
        if (leftover < 1) {
            this.lastTime = current;
            if (this.onNextStep) {
                nxt = this.onNextStep;
                this.onNextStep = null;
                nxt.call(this);
            }
            this.step();
            this.children.forEach(child => child.stepFrame());
        }
    }
    nextSteps(arrayOfFunctions) {
        var lst = arrayOfFunctions || [], nxt = lst.shift();
        if (nxt) {
            this.onNextStep = () => {
                nxt.call(this);
                this.nextSteps(lst);
            };
        }
    }
    // Morph accessing - geometry getting:
    left() {
        return this.bounds.left();
    }
    right() {
        return this.bounds.right();
    }
    top() {
        return this.bounds.top();
    }
    bottom() {
        return this.bounds.bottom();
    }
    center() {
        return this.bounds.center();
    }
    bottomCenter() {
        return this.bounds.bottomCenter();
    }
    bottomLeft() {
        return this.bounds.bottomLeft();
    }
    bottomRight() {
        return this.bounds.bottomRight();
    }
    boundingBox() {
        return this.bounds;
    }
    corners() {
        return this.bounds.corners();
    }
    leftCenter() {
        return this.bounds.leftCenter();
    }
    rightCenter() {
        return this.bounds.rightCenter();
    }
    topCenter() {
        return this.bounds.topCenter();
    }
    topLeft() {
        return this.bounds.topLeft();
    }
    topRight() {
        return this.bounds.topRight();
    }
    position() {
        return this.bounds.origin;
    }
    extent() {
        return this.bounds.extent();
    }
    width() {
        return this.bounds.width();
    }
    height() {
        return this.bounds.height();
    }
    fullBounds() {
        var result;
        result = this.bounds;
        this.children.forEach(child => {
            if (child.isVisible) {
                result = result.merge(child.fullBounds());
            }
        });
        return result;
    }
    fullBoundsNoShadow() {
        // answer my full bounds but ignore any shadow
        var result;
        result = this.bounds;
        this.children.forEach(child => {
            if (!(child instanceof ShadowMorph) && (child.isVisible)) {
                result = result.merge(child.fullBounds());
            }
        });
        return result;
    }
    visibleBounds() {
        // answer which part of me is not clipped by a Frame
        var visible = this.bounds, frames = this.allParents().filter(p => p instanceof FrameMorph);
        frames.forEach(f => visible = visible.intersect(f.bounds));
        return visible;
    }
    // Morph accessing - simple changes:
    moveBy(delta) {
        var children = this.children, i = children.length;
        this.changed();
        this.bounds = this.bounds.translateBy(delta);
        this.changed();
        for (i; i > 0; i -= 1) {
            children[i - 1].moveBy(delta);
        }
    }
    setPosition(aPoint) {
        var delta = aPoint.subtract(this.topLeft());
        if (!(delta.eq(ZERO))) {
            this.moveBy(delta);
        }
    }
    setLeft(x) {
        this.setPosition(
            new Point(
                x,
                this.top()
            )
        );
    }
    setRight(x) {
        this.setPosition(
            new Point(
                x - this.width(),
                this.top()
            )
        );
    }
    setTop(y) {
        this.setPosition(
            new Point(
                this.left(),
                y
            )
        );
    }
    setBottom(y) {
        this.setPosition(
            new Point(
                this.left(),
                y - this.height()
            )
        );
    }
    setCenter(aPoint) {
        this.setPosition(
            aPoint.subtract(
                this.extent().floorDivideBy(2)
            )
        );
    }
    setFullCenter(aPoint) {
        this.setPosition(
            aPoint.subtract(
                this.fullBounds().extent().floorDivideBy(2)
            )
        );
    }
    keepWithin(aMorph) {
        // make sure I am completely within another Morph's bounds
        var leftOff, rightOff, topOff, bottomOff;
        rightOff = this.fullBounds().right() - aMorph.right();
        if (rightOff > 0) {
            this.moveBy(new Point(-rightOff, 0));
        }
        leftOff = this.fullBounds().left() - aMorph.left();
        if (leftOff < 0) {
            this.moveBy(new Point(-leftOff, 0));
        }
        bottomOff = this.fullBounds().bottom() - aMorph.bottom();
        if (bottomOff > 0) {
            this.moveBy(new Point(0, -bottomOff));
        }
        topOff = this.fullBounds().top() - aMorph.top();
        if (topOff < 0) {
            this.moveBy(new Point(0, -topOff));
        }
    }
    scrollIntoView() {
        var leftOff, rightOff, topOff, bottomOff, sf = this.parentThatIsA(ScrollFrameMorph);
        if (!sf) { return; }
        rightOff = Math.min(
            this.fullBounds().right() - sf.right(),
            sf.contents.right() - sf.right()
        );
        if (rightOff > 0) {
            sf.contents.moveBy(new Point(-rightOff, 0));
        }
        leftOff = this.fullBounds().left() - sf.left();
        if (leftOff < 0) {
            sf.contents.moveBy(new Point(-leftOff, 0));
        }
        topOff = this.fullBounds().top() - sf.top();
        if (topOff < 0) {
            sf.contents.moveBy(new Point(0, -topOff));
        }
        bottomOff = this.fullBounds().bottom() - sf.bottom();
        if (bottomOff > 0) {
            sf.contents.moveBy(new Point(0, -bottomOff));
        }
        sf.adjustScrollBars();
    }
    // Morph accessing - dimensional changes requiring a complete redraw
    setExtent(aPoint) {
        if (aPoint.eq(this.extent())) { return; }
        this.changed();
        this.bounds.setWidth(aPoint.x);
        this.bounds.setHeight(aPoint.y);
        this.fixLayout();
        this.rerender();
    }
    setWidth(width) {
        this.setExtent(new Point(width || 0, this.height()));
    }
    setHeight(height) {
        this.setExtent(new Point(this.width(), height || 0));
    }
    setColor(aColor) {
        if (aColor) {
            if (!this.color.eq(aColor)) {
                this.color = aColor;
                this.rerender();
            }
        }
    }
    // Morph rendering:
    getImage() {
        var img;
        if (this.cachedImage && !this.shouldRerender) {
            return this.cachedImage;
        }
        img = newCanvas(this.extent(), false, this.cachedImage);
        if (this.isCachingImage) {
            this.cachedImage = img;
        }
        this.render(img.getContext('2d'));
        this.shouldRerender = false;
        return img;
    }
    render(aContext) {
        aContext.fillStyle = this.getRenderColor().toString();
        aContext.fillRect(0, 0, this.width(), this.height());
        if (this.cachedTexture) {
            this.renderCachedTexture(aContext);
        } else if (this.texture) {
            this.renderTexture(this.texture, aContext);
        }
    }
    getRenderColor() {
        // can be overriden by my heirs or instances
        return this.color;
    }
    fixLayout() {
        // implemented by my heirs
        // determine my extent and arrange my submorphs, if any
        // default is to do nothing
        // NOTE: If you need to set the extent, in order to avoid
        // infinite recursion instead of calling setExtent() (which will
        // in turn call fixLayout() again) directly modify the bounds
        // property, e.g. like this: this.bounds.setExtent()
        return;
    }
    fixHolesLayout() {
        // implemented by my heirs
        // arrange my untouchable areas, if any
        // default is to do nothing
        return;
    }
    // Morph displaying:
    renderTexture(url, ctx) {
        this.cachedTexture = new Image();
        this.cachedTexture.onload = () => this.changed();
        this.cachedTexture.src = this.texture = url;
    }
    renderCachedTexture(ctx) {
        var bg = this.cachedTexture, cols = Math.floor(this.width() / bg.width), lines = Math.floor(this.height() / bg.height), x, y;

        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.rect(0, 0, this.width(), this.height());
        ctx.clip();
        for (y = 0; y <= lines; y += 1) {
            for (x = 0; x <= cols; x += 1) {
                ctx.drawImage(bg, x * bg.width, y * bg.height);
            }
        }
        ctx.restore();
    }
    drawOn(ctx, rect) {
        var clipped = rect.intersect(this.bounds), pos = this.position(), pic, src, w, h, sl, st;

        if (!clipped.extent().gt(ZERO)) { return; }
        ctx.save();
        ctx.globalAlpha = this.alpha;
        if (this.isCachingImage) {
            pic = this.getImage();
            src = clipped.translateBy(pos.neg());
            sl = src.left();
            st = src.top();
            w = Math.min(src.width(), pic.width - sl);
            h = Math.min(src.height(), pic.height - st);
            if (w < 1 || h < 1) { return; }
            ctx.drawImage(
                pic,
                sl,
                st,
                w,
                h,
                clipped.left(),
                clipped.top(),
                w,
                h
            );
        } else { // render directly on target canvas
            ctx.beginPath();
            ctx.rect(clipped.left(), clipped.top(), clipped.width(), clipped.height());
            ctx.clip();
            ctx.translate(pos.x, pos.y);
            this.render(ctx);
            if (MorphicPreferences.showHoles) { // debug hole rendering
                ctx.translate(-pos.x, -pos.y);
                ctx.globalAlpha = 0.25;
                ctx.fillStyle = 'white';
                this.holes.forEach(hole => {
                    var sect = hole.translateBy(pos).intersect(clipped);
                    ctx.fillRect(
                        sect.left(),
                        sect.top(),
                        sect.width(),
                        sect.height()
                    );
                });
            }
        }
        ctx.restore();
    }
    fullDrawOn(aContext, aRect) {
        if (!this.isVisible) { return; }
        this.drawOn(aContext, aRect);
        this.children.forEach(child => child.fullDrawOn(aContext, aRect));
    }
    hide() {
        this.isVisible = false;
        this.changed();
    }
    show() {
        this.isVisible = true;
        this.changed();
    }
    toggleVisibility() {
        this.isVisible = !this.isVisible;
        this.changed();
    }
    // Morph full image:
    fullImage() {
        var fb = this.fullBounds(), img = newCanvas(fb.extent()), ctx = img.getContext('2d');
        ctx.translate(-fb.origin.x, -fb.origin.y);
        this.fullDrawOn(ctx, fb);
        return img;
    }
    // Morph shadow:
    shadowImage(off, color) {
        // for flat design mode
        var fb, img, outline, sha, ctx, offset = off || new Point(7, 7), clr = color || new Color(0, 0, 0);
        if (this.fullShadowSource) {
            fb = this.fullBounds().extent();
            img = this.fullImage();
        } else { // optimization when all submorphs are contained inside
            fb = this.extent();
            img = this.getImage();
        }
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
        if (this.fullShadowSource) {
            fb = this.fullBounds().extent().add(blur * 2);
            img = this.fullImage();
        } else { // optimization when all submorphs are contained inside
            fb = this.extent().add(blur * 2);
            img = this.getImage();
        }
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
    shadow(off, a, color) {
        var shadow = new ShadowMorph(), offset = off || new Point(7, 7), alpha = a || ((a === 0) ? 0 : 0.2), fb = this.fullBounds();
        shadow.setExtent(fb.extent().add(this.shadowBlur * 2));
        if (useBlurredShadows /*&& !MorphicPreferences.isFlat*/) {
            shadow.cachedImage = this.shadowImageBlurred(offset, color);
            shadow.alpha = alpha;
            shadow.setPosition(fb.origin.add(offset).subtract(this.shadowBlur));
        } else {
            shadow.cachedImage = this.shadowImage(offset, color);
            shadow.alpha = alpha;
            shadow.setPosition(fb.origin.add(offset));
        }
        shadow.shouldRerender = false;
        return shadow;
    }
    addShadow(off, a, color) {
        var shadow, offset = off || new Point(7, 7), alpha = a || ((a === 0) ? 0 : 0.2);
        shadow = this.shadow(offset, alpha, color);
        this.addBack(shadow);
        this.fullChanged();
        return shadow;
    }
    getShadow() {
        var shadows;
        shadows = this.children.slice(0).reverse().filter(
            child => child instanceof ShadowMorph
        );
        if (shadows.length !== 0) {
            return shadows[0];
        }
        return null;
    }
    removeShadow() {
        var shadow = this.getShadow();
        if (shadow !== null) {
            this.fullChanged();
            this.removeChild(shadow);
        }
    }
    // Morph pen trails:
    penTrails() {
        // answer my pen trails canvas. default is to answer my image
        // NOTE: clients calling this also want to make sure the
        // obtained canvas will be around at the next display cycle,
        // so they might also wish to set the receiver's "isCachingImage"
        // property to "true".
        return this.getImage();
    }
    // Morph updating:
    rerender() {
        this.shouldRerender = true;
        this.changed();
    }
    changed() {
        var w = this.root();
        if (w instanceof WorldMorph) {
            w.broken.push(this.visibleBounds().spread());
        }
        if (this.parent) {
            this.parent.childChanged(this);
        }
    }
    fullChanged() {
        var w = this.root();
        if (w instanceof WorldMorph) {
            w.broken.push(
                this.fullBounds().spread()
            );
        }
    }
    childChanged() {
        // react to a change in one of my children,
        // default is to just pass this message on upwards
        // override this method for Morphs that need to adjust accordingly
        if (this.parent) {
            this.parent.childChanged(this);
        }
    }
    // Morph accessing - structure:
    world() {
        var root = this.root();
        if (root instanceof WorldMorph) {
            return root;
        }
        if (root instanceof HandMorph) {
            return root.world;
        }
        return null;
    }
    add(aMorph) {
        var owner = aMorph.parent;
        if (owner !== null) {
            owner.removeChild(aMorph);
        }
        this.addChild(aMorph);
    }
    addBack(aMorph) {
        var owner = aMorph.parent;
        if (owner !== null) {
            owner.removeChild(aMorph);
        }
        this.addChildFirst(aMorph);
    }
    topMorphAt(point) {
        var i, result;
        if (!this.isVisible) { return null; }
        for (i = this.children.length - 1; i >= 0; i -= 1) {
            result = this.children[i].topMorphAt(point);
            if (result) { return result; }
        }
        if (this.bounds.containsPoint(point)) {
            if (this.holes.some(
                any => any.translateBy(this.position()).containsPoint(point))) {
                return null;
            }
            if (this.isFreeForm) {
                if (!this.isTransparentAt(point)) {
                    return this;
                }
            } else {
                return this;
            }
        }
        return null;
    }
    topMorphSuchThat(predicate) {
        var next;
        if (predicate.call(null, this)) {
            next = detect(
                this.children.slice(0).reverse(),
                predicate
            );
            if (next) {
                return next.topMorphSuchThat(predicate);
            }
            return this;
        }
        return null;
    }
    overlappedMorphs() {
        //exclude the World
        var world = this.world(), fb = this.fullBounds(), allParents = this.allParents(), allChildren = this.allChildren(), morphs;

        morphs = world.allChildren();
        return morphs.filter(m => {
            return m.isVisible &&
                m !== this &&
                m !== world &&
                !contains(allParents, m) &&
                !contains(allChildren, m) &&
                m.fullBounds().intersects(fb);
        });
    }
    // Morph pixel access:
    getPixelColor(aPoint) {
        var point, context, data;
        point = aPoint.subtract(this.bounds.origin);
        context = this.getImage().getContext('2d');
        data = context.getImageData(point.x, point.y, 1, 1);
        return new Color(
            data.data[0],
            data.data[1],
            data.data[2],
            data.data[3] / 255
        );
    }
    isTransparentAt(aPoint) {
        var point, context, data;
        if (this.bounds.containsPoint(aPoint)) {
            if (this.texture) {
                return false;
            }
            point = aPoint.subtract(this.bounds.origin);
            context = this.getImage().getContext('2d');
            data = context.getImageData(
                Math.floor(point.x),
                Math.floor(point.y),
                1,
                1
            );
            return data.data[3] === 0;
        }
        return false;
    }
    // Morph duplicating:
    copy() {
        var c = copy(this);
        c.parent = null;
        c.children = [];
        c.bounds = this.bounds.copy();
        return c;
    }
    fullCopy() {
        /*
        Produce a copy of me with my entire tree of submorphs. Morphs
        mentioned more than once are all directed to a single new copy.
        Other properties are also *shallow* copied, so you must override
        to deep copy Arrays and (complex) Objects
        */
        var map = new Map(), c;
        c = this.copyRecordingReferences(map);
        c.forAllChildren(m => m.updateReferences(map));
        return c;
    }
    copyRecordingReferences(map) {
        /*
        Recursively copy this entire composite morph, recording the
        correspondence between old and new morphs in the given dictionary.
        This dictionary will be used to update intra-composite references
        in the copy. See updateReferences().
    
        Note: This default implementation copies ONLY morphs. If a morph
        stores morphs in other properties that it wants to copy, then it
        should override this method to do so. The same goes for morphs that
        contain other complex data that should be copied when the morph is
        duplicated.
        */
        var c = this.copy();
        map.set(this, c);
        this.children.forEach(m => c.add(m.copyRecordingReferences(map)));
        return c;
    }
    updateReferences(map) {
        /*
        Update intra-morph references within a composite morph that has
        been copied. For example, if a button refers to morph X in the
        orginal composite then the copy of that button in the new composite
        should refer to the copy of X in new composite, not the original X.
        */
        var properties = Object.keys(this), l = properties.length, property, value, reference, i;
        for (i = 0; i < l; i += 1) {
            property = properties[i];
            value = this[property];
            if (value && value.isMorph) {
                reference = map.get(value);
                if (reference) { this[property] = reference; }
            }
        }
    }
    // Morph dragging and dropping:
    rootForGrab() {
        if (this instanceof ShadowMorph) {
            return this.parent.rootForGrab();
        }
        if (this.parent instanceof ScrollFrameMorph) {
            return this.parent;
        }
        if (this.parent === null ||
            this.parent instanceof WorldMorph ||
            this.parent instanceof FrameMorph ||
            this.isDraggable === true) {
            return this;
        }
        return this.parent.rootForGrab();
    }
    isCorrectingOutsideDrag() {
        // make sure I don't "trail behind" the hand when dragged
        // override for morphs that you want to be dragged outside
        // their full bounds
        return true;
    }
    wantsDropOf(aMorph) {
        // default is to answer the general flag - change for my heirs
        if ((aMorph instanceof HandleMorph) ||
            (aMorph instanceof MenuMorph) ||
            (aMorph instanceof InspectorMorph)) {
            return false;
        }
        return this.acceptsDrops;
    }
    pickUp(wrrld) {
        var world = wrrld || this.world();
        this.setPosition(
            world.hand.position().subtract(
                this.extent().floorDivideBy(2)
            )
        );
        world.hand.grab(this);
    }
    isPickedUp() {
        return this.parentThatIsA(HandMorph) !== null;
    }
    situation() {
        // answer a dictionary specifying where I am right now, so
        // I can slide back to it if I'm dropped somewhere else
        if (this.parent) {
            return {
                origin: this.parent,
                position: this.position().subtract(this.parent.position())
            };
        }
        return null;
    }
    slideBackTo(situation,
        msecs,
        onBeforeDrop,
        onComplete) {
        var pos = situation.origin.position().add(situation.position);
        this.glideTo(
            pos,
            msecs,
            null,
            () => {
                situation.origin.add(this);
                if (onBeforeDrop) { onBeforeDrop(); }
                if (this.justDropped) { this.justDropped(); }
                if (situation.origin.reactToDropOf) {
                    situation.origin.reactToDropOf(this);
                }
                if (onComplete) { onComplete(); }
            }
        );
    }
    // Morph animating:
    glideTo(endPoint, msecs, easing, onComplete) {
        var world = this.world(), horizontal = new Animation(
            x => this.setLeft(x),
            () => this.left(),
            -(this.left() - endPoint.x),
            msecs === 0 ? 0 : msecs || 100,
            easing
        );
        world.animations.push(horizontal);
        world.animations.push(new Animation(
            y => this.setTop(y),
            () => this.top(),
            -(this.top() - endPoint.y),
            msecs === 0 ? 0 : msecs || 100,
            easing,
            () => {
                horizontal.setter(horizontal.destination);
                horizontal.isActive = false;
                onComplete();
            }

        ));
    }
    fadeTo(endAlpha, msecs, easing, onComplete) {
        // include all my children, restore all original transparencies
        // on completion, so I can be recovered
        var world = this.world(), oldAlpha = this.alpha;
        this.children.forEach(child => child.fadeTo(endAlpha, msecs, easing));
        world.animations.push(new Animation(
            n => {
                this.alpha = n;
                this.changed();
            },
            () => this.alpha,
            endAlpha - this.alpha,
            msecs === 0 ? 0 : msecs || 200,
            easing,
            () => {
                this.alpha = oldAlpha;
                if (onComplete) { onComplete(); }
            }
        ));
    }
    perish(msecs, onComplete) {
        this.fadeTo(
            0,
            msecs === 0 ? 0 : msecs || 100,
            null,
            () => {
                this.destroy();
                if (onComplete) { onComplete(); }
            }
        );
    }
    resize() {
        this.world().activeHandle = new HandleMorph(this);
    }
    move() {
        this.world().activeHandle = new HandleMorph(
            this,
            null,
            null,
            null,
            null,
            'move'
        );
    }
    moveCenter() {
        this.world().activeHandle = new HandleMorph(
            this,
            null,
            null,
            null,
            null,
            'moveCenter'
        );
    }
    hint(msg) {
        var m, text;
        text = msg;
        if (msg) {
            if (msg.toString) {
                text = msg.toString();
            }
        } else {
            text = 'NULL';
        }
        m = new MenuMorph(this, text);
        m.isDraggable = true;
        m.popUpCenteredAtHand(this.world());
    }
    inform(msg) {
        var m, text;
        text = msg;
        if (msg) {
            if (msg.toString) {
                text = msg.toString();
            }
        } else {
            text = 'NULL';
        }
        m = new MenuMorph(this, text);
        m.addItem("Ok");
        m.isDraggable = true;
        m.popUpCenteredAtHand(this.world());
    }
    prompt(msg,
        callback,
        environment,
        defaultContents,
        width,
        floorNum,
        ceilingNum,
        isRounded,
        action = nop) {
        var menu, entryField, slider, isNumeric;
        if (ceilingNum) {
            isNumeric = true;
        }
        menu = new MenuMorph(
            callback || null,
            msg || '',
            environment || null
        );
        entryField = new StringFieldMorph(
            defaultContents || '',
            width || 100,
            MorphicPreferences.prompterFontSize,
            MorphicPreferences.prompterFontName,
            false,
            false,
            isNumeric
        );
        menu.items.push(entryField);
        if (ceilingNum || MorphicPreferences.useSliderForInput) {
            slider = new SliderMorph(
                floorNum || 0,
                ceilingNum,
                parseFloat(defaultContents),
                Math.floor((ceilingNum - floorNum) / 4),
                'horizontal'
            );
            slider.alpha = 1;
            slider.color = new Color(225, 225, 225);
            slider.button.color = menu.borderColor;
            slider.button.highlightColor = slider.button.color.copy();
            slider.button.highlightColor.b += 100;
            slider.button.pressColor = slider.button.color.copy();
            slider.button.pressColor.b += 150;
            slider.setHeight(MorphicPreferences.prompterSliderSize);
            if (isRounded) {
                slider.action = (num) => {
                    entryField.changed();
                    entryField.text.text = Math.round(num).toString();
                    entryField.text.fixLayout();
                    entryField.text.changed();
                    entryField.text.edit();
                    action(Math.round(num));
                };
            } else {
                slider.action = (num) => {
                    entryField.changed();
                    entryField.text.text = num.toString();
                    entryField.text.fixLayout();
                    entryField.text.changed();
                    action(num);
                };
            }
            menu.items.push(slider);
        }

        menu.addLine(2);
        menu.addItem('Ok', () => entryField.string());
        menu.addItem(
            'Cancel',
            () => {
                action(defaultContents);
                return null;
            }
        );
        menu.isDraggable = true;
        menu.popUpAtHand(this.world());
        entryField.text.edit();
    }
    pickColor(msg,
        callback,
        environment,
        defaultContents) {
        var menu, colorPicker;
        menu = new MenuMorph(
            callback || null,
            msg || '',
            environment || null
        );
        colorPicker = new ColorPickerMorph(defaultContents);
        menu.items.push(colorPicker);
        menu.addLine(2);
        menu.addItem('Ok', () => colorPicker.getChoice());
        menu.addItem('Cancel', () => null);
        menu.isDraggable = true;
        menu.popUpAtHand(this.world());
    }
    inspect(anotherObject) {
        var world = this.world instanceof Function ?
            this.world() : this.root() || this.world, inspector, inspectee = this;

        if (anotherObject) {
            inspectee = anotherObject;
        }
        inspector = new InspectorMorph(inspectee);
        inspector.setPosition(world.hand.position());
        inspector.keepWithin(world);
        world.add(inspector);
        inspector.changed();
    }
    inspectKeyEvent(event) {
        this.inform(
            'Key pressed: ' +
            String.fromCharCode(event.charCode) +
            '\n------------------------' +
            '\ncharCode: ' +
            event.charCode.toString() +
            '\nkeyCode: ' +
            event.keyCode.toString() +
            '\nkey: ' +
            event.key.toString() +
            '\nshiftKey: ' +
            event.shiftKey.toString() +
            '\naltKey: ' +
            event.altKey.toString() +
            '\nctrlKey: ' +
            event.ctrlKey.toString() +
            '\ncmdKey: ' +
            event.metaKey.toString()
        );
    }
    // Morph menus:
    contextMenu() {
        var world;

        if (this.customContextMenu) {
            return this.customContextMenu;
        }
        world = this.world instanceof Function ? this.world() : this.world;
        if (world && world.isDevMode) {
            if (this.parent === world) {
                return this.developersMenu();
            }
            return this.hierarchyMenu();
        }
        return this.userMenu() ||
            (this.parent && this.parent.userMenu());
    }
    hierarchyMenu() {
        var parents = this.allParents(), world = this.world instanceof Function ? this.world() : this.world, menu = new MenuMorph(this, null);

        parents.forEach(each => {
            if (each.developersMenu && (each !== world)) {
                menu.addMenu(
                    each.toString().slice(0, 50),
                    each.developersMenu()
                );
            }
        });
        return menu;
    }
    developersMenu() {
        // 'name' is not an official property of a function, hence:
        var world = this.world instanceof Function ? this.world() : this.world, userMenu = this.userMenu() ||
            (this.parent && this.parent.userMenu()), menu = new MenuMorph(this, this.constructor.name ||
                this.constructor.toString().split(' ')[1].split('(')[0]);
        if (userMenu) {
            menu.addMenu('user features', userMenu);
            menu.addLine();
        }
        menu.addItem(
            "color...",
            () => {
                this.pickColor(
                    menu.title + localize('\ncolor:'),
                    this.setColor,
                    this,
                    this.color
                );
            },
            'choose another color \nfor this morph'
        );
        menu.addItem(
            "transparency...",
            () => {
                this.prompt(
                    menu.title + localize('\nalpha\nvalue:'),
                    this.setAlphaScaled,
                    this,
                    (this.alpha * 100).toString(),
                    null,
                    1,
                    100,
                    true
                );
            },
            'set this morph\'s\nalpha value'
        );
        menu.addItem(
            "resize...",
            'resize',
            'show a handle\nwhich can be dragged\nto change this morph\'s' +
            ' extent'
        );
        menu.addLine();
        menu.addItem(
            "duplicate",
            () => this.fullCopy().pickUp(this.world()),
            'make a copy\nand pick it up'
        );
        menu.addItem(
            "pick up",
            'pickUp',
            'detach and put \ninto the hand'
        );
        menu.addItem(
            "attach...",
            'attach',
            'stick this morph\nto another one'
        );
        menu.addItem(
            "move...",
            'move',
            'show a handle\nwhich can be dragged\nto move this morph'
        );
        menu.addItem(
            "inspect...",
            'inspect',
            'open a window\non all properties'
        );
        menu.addItem(
            "pic...",
            () => window.open(this.fullImage().toDataURL()),
            'open a new window\nwith a picture of this morph'
        );
        menu.addLine();
        if (this.isDraggable) {
            menu.addItem(
                "lock",
                'toggleIsDraggable',
                'make this morph\nunmovable'
            );
        } else {
            menu.addItem(
                "unlock",
                'toggleIsDraggable',
                'make this morph\nmovable'
            );
        }
        menu.addItem("hide", 'hide');
        menu.addItem("delete", 'destroy');
        if (!(this instanceof WorldMorph)) {
            menu.addLine();
            menu.addItem(
                "World...",
                () => world.contextMenu().popUpAtHand(world),
                'show the\nWorld\'s menu'
            );
        }
        return menu;
    }
    userMenu() {
        return null;
    }
    addToDemoMenu(aMorphOrMenuArray) {
        // register a Morph or a Menu with Morphs with the World's demos menu
        // a menu can be added in the form of a two-item array: [name, [morphs]]
        WorldMorph.prototype.customMorphs.push(aMorphOrMenuArray);
    }
    // Morph menu actions
    setAlphaScaled(alpha) {
        // for context menu demo purposes
        var newAlpha, unscaled;
        if (typeof alpha === 'number') {
            unscaled = alpha / 100;
            this.alpha = Math.min(Math.max(unscaled, 0), 1);
        } else {
            newAlpha = parseFloat(alpha);
            if (!isNaN(newAlpha)) {
                unscaled = newAlpha / 100;
                this.alpha = Math.min(Math.max(unscaled, 0), 1);
            }
        }
        this.changed();
    }
    attach() {
        var choices = this.overlappedMorphs(), menu = new MenuMorph(this, 'choose new parent:');

        choices.forEach(each => {
            menu.addItem(each.toString().slice(0, 50), () => {
                each.add(this);
                this.isDraggable = false;
            });
        });
        if (choices.length > 0) {
            menu.popUpAtHand(this.world());
        }
    }
    toggleIsDraggable() {
        // for context menu demo purposes
        this.isDraggable = !this.isDraggable;
    }
    colorSetters() {
        // for context menu demo purposes
        return ['color'];
    }
    numericalSetters() {
        // for context menu demo purposes
        return [
            'setLeft',
            'setTop',
            'setWidth',
            'setHeight',
            'setAlphaScaled'
        ];
    }
    // Morph entry field tabbing:
    allEntryFields() {
        return this.allChildren().filter(each => {
            return each.isEditable &&
                (each instanceof StringMorph ||
                    each instanceof TextMorph);
        });
    }
    nextEntryField(current) {
        var fields = this.allEntryFields(), idx = fields.indexOf(current);
        if (idx !== -1) {
            if (fields.length > idx + 1) {
                return fields[idx + 1];
            }
        }
        return fields[0];
    }
    previousEntryField(current) {
        var fields = this.allEntryFields(), idx = fields.indexOf(current);
        if (idx !== -1) {
            if (idx > 0) {
                return fields[idx - 1];
            }
            return fields[fields.length - 1];
        }
        return fields[0];
    }
    tab(editField) {
        /*
            the <tab> key was pressed in one of my edit fields.
            invoke my "nextTab()" function if it exists, else
            propagate it up my owner chain.
        */
        if (this.nextTab) {
            this.nextTab(editField);
        } else if (this.parent) {
            this.parent.tab(editField);
        }
    }
    backTab(editField) {
        /*
            the <back tab> key was pressed in one of my edit fields.
            invoke my "previousTab()" function if it exists, else
            propagate it up my owner chain.
        */
        if (this.previousTab) {
            this.previousTab(editField);
        } else if (this.parent) {
            this.parent.backTab(editField);
        }
    }
    /*
        the following are examples of what the navigation methods should
        look like. Insert these at the World level for fallback, and at lower
        levels in the Morphic tree (e.g. dialog boxes) for a more fine-grained
        control over the tabbing cycle.
    
    Morph.prototype.nextTab = function (editField) {
        var next = this.nextEntryField(editField);
        editField.clearSelection();
        next.selectAll();
        next.edit();
    };
    
    Morph.prototype.previousTab = function (editField) {
        var prev = this.previousEntryField(editField);
        editField.clearSelection();
        prev.selectAll();
        prev.edit();
    };
    
    */
    // Morph events:
    escalateEvent(functionName, arg) {
        var handler = this.parent;
        while (!handler[functionName] && handler.parent !== null) {
            handler = handler.parent;
        }
        if (handler[functionName]) {
            handler[functionName](arg);
        }
    }
    // Morph eval:
    evaluateString(code) {
        var result;

        try {
            result = eval(code);
            this.changed();
        } catch (err) {
            this.inform(err);
        }
        return result;
    }
    // Morph collision detection:
    isTouching(otherMorph) {
        var data = this.overlappingPixels(otherMorph), len, i;

        if (!data) { return false; }
        len = data[0].length;
        for (i = 3; i < len; i += 4) {
            if (data[0][i] && data[1][i]) { return true; }
        }
        return false;
    }
    overlappingPixels(otherMorph) {
        var fb = this.fullBounds(), otherFb = otherMorph.fullBounds(), oRect = fb.intersect(otherFb), thisImg, thatImg;

        if (oRect.width() < 1 || oRect.height() < 1) {
            return false;
        }
        thisImg = this.fullImage();
        thatImg = otherMorph.fullImage();
        if (thisImg.isRetinaEnabled !== thatImg.isRetinaEnabled) {
            thisImg = normalizeCanvas(thisImg, true);
            thatImg = normalizeCanvas(thatImg, true);
        }
        return [
            thisImg.getContext("2d").getImageData(
                oRect.left() - this.left(),
                oRect.top() - this.top(),
                oRect.width(),
                oRect.height()
            ).data,
            thatImg.getContext("2d").getImageData(
                oRect.left() - otherMorph.left(),
                oRect.top() - otherMorph.top(),
                oRect.width(),
                oRect.height()
            ).data
        ];
    }
}

Morph.prototype.step = nop;


















































































// Morph utilities:

Morph.prototype.nop = nop;




























