/* global Point */
class Rectangle {
    constructor(left, top, right, bottom) {
        this.init(new Point((left || 0), (top || 0)),
            new Point((right || 0), (bottom || 0)));
    }
    init(originPoint, cornerPoint) {
        this.origin = originPoint;
        this.corner = cornerPoint;
    }
    // Rectangle string representation: e.g. '[0@0 | 160@80]'
    toString() {
        return '[' + this.origin.toString() + ' | ' +
            this.extent().toString() + ']';
    }
    // Rectangle copying:
    copy() {
        return new Rectangle(
            this.left(),
            this.top(),
            this.right(),
            this.bottom()
        );
    }
    // Rectangle accessing - setting:
    setTo(left, top, right, bottom) {
        // note: all inputs are optional and can be omitted
        this.origin = new Point(
            left || ((left === 0) ? 0 : this.left()),
            top || ((top === 0) ? 0 : this.top())
        );

        this.corner = new Point(
            right || ((right === 0) ? 0 : this.right()),
            bottom || ((bottom === 0) ? 0 : this.bottom())
        );
    }
    // Rectangle mutating
    setExtent(aPoint) {
        this.setWidth(aPoint.x);
        this.setHeight(aPoint.y);
    }
    setWidth(width) {
        this.corner.x = this.origin.x + width;
    }
    setHeight(height) {
        this.corner.y = this.origin.y + height;
    }
    // Rectangle accessing - getting:
    area() {
        //requires width() and height() to be defined
        var w = this.width();
        if (w < 0) {
            return 0;
        }
        return Math.max(w * this.height(), 0);
    }
    bottom() {
        return this.corner.y;
    }
    bottomCenter() {
        return new Point(this.center().x, this.bottom());
    }
    bottomLeft() {
        return new Point(this.origin.x, this.corner.y);
    }
    bottomRight() {
        return this.corner.copy();
    }
    boundingBox() {
        return this;
    }
    center() {
        return this.origin.add(
            this.corner.subtract(this.origin).floorDivideBy(2)
        );
    }
    corners() {
        return [this.origin,
        this.bottomLeft(),
        this.corner,
        this.topRight()];
    }
    extent() {
        return this.corner.subtract(this.origin);
    }
    height() {
        return this.corner.y - this.origin.y;
    }
    left() {
        return this.origin.x;
    }
    leftCenter() {
        return new Point(this.left(), this.center().y);
    }
    right() {
        return this.corner.x;
    }
    rightCenter() {
        return new Point(this.right(), this.center().y);
    }
    top() {
        return this.origin.y;
    }
    topCenter() {
        return new Point(this.center().x, this.top());
    }
    topLeft() {
        return this.origin;
    }
    topRight() {
        return new Point(this.corner.x, this.origin.y);
    }
    width() {
        return this.corner.x - this.origin.x;
    }
    position() {
        return this.origin;
    }
    // Rectangle comparison:
    eq(aRect) {
        return this.origin.eq(aRect.origin) &&
            this.corner.eq(aRect.corner);
    }
    abs() {
        var newOrigin, newCorner;

        newOrigin = this.origin.abs();
        newCorner = this.corner.max(newOrigin);
        return newOrigin.corner(newCorner);
    }
    // Rectangle functions:
    insetBy(delta) {
        // delta can be either a Point or a Number
        var result = new Rectangle();
        result.origin = this.origin.add(delta);
        result.corner = this.corner.subtract(delta);
        return result;
    }
    expandBy(delta) {
        // delta can be either a Point or a Number
        var result = new Rectangle();
        result.origin = this.origin.subtract(delta);
        result.corner = this.corner.add(delta);
        return result;
    }
    growBy(delta) {
        // delta can be either a Point or a Number
        var result = new Rectangle();
        result.origin = this.origin.copy();
        result.corner = this.corner.add(delta);
        return result;
    }
    intersect(aRect) {
        var result = new Rectangle();
        result.origin = this.origin.max(aRect.origin);
        result.corner = this.corner.min(aRect.corner);
        return result;
    }
    merge(aRect) {
        var result = new Rectangle();
        result.origin = this.origin.min(aRect.origin);
        result.corner = this.corner.max(aRect.corner);
        return result;
    }
    mergeWith(aRect) {
        // mutates myself
        this.origin = this.origin.min(aRect.origin);
        this.corner = this.corner.max(aRect.corner);
    }
    round() {
        return this.origin.round().corner(this.corner.round());
    }
    spread() {
        // round me by applying floor() to my origin and ceil() to my corner
        // avoids artefacts on retina displays
        return this.origin.floor().corner(this.corner.ceil());
    }
    amountToTranslateWithin(aRect) {
        /*
            Answer a Point, delta, such that self + delta is forced within
            aRectangle. when all of me cannot be made to fit, prefer to keep
            my topLeft inside. Taken from Squeak.
        */
        var dx = 0, dy = 0;

        if (this.right() > aRect.right()) {
            dx = aRect.right() - this.right();
        }
        if (this.bottom() > aRect.bottom()) {
            dy = aRect.bottom() - this.bottom();
        }
        if ((this.left() + dx) < aRect.left()) {
            dx = aRect.left() - this.left();
        }
        if ((this.top() + dy) < aRect.top()) {
            dy = aRect.top() - this.top();
        }
        return new Point(dx, dy);
    }
    regionsAround(aRect) {
        // answer a list of rectangles surrounding another one,
        // use this to clip "holes"
        var regions = [];
        if (!this.intersects(aRect)) {
            return regions;
        }
        // left
        if (aRect.left() > this.left()) {
            regions.push(
                new Rectangle(
                    this.left(),
                    this.top(),
                    aRect.left(),
                    this.bottom()
                )
            );
        }
        // above:
        if (aRect.top() > this.top()) {
            regions.push(
                new Rectangle(
                    this.left(),
                    this.top(),
                    this.right(),
                    aRect.top()
                )
            );
        }
        // right:
        if (aRect.right() < this.right()) {
            regions.push(
                new Rectangle(
                    aRect.right(),
                    this.top(),
                    this.right(),
                    this.bottom()
                )
            );
        }
        // below:
        if (aRect.bottom() < this.bottom()) {
            regions.push(
                new Rectangle(
                    this.left(),
                    aRect.bottom(),
                    this.right(),
                    this.bottom()
                )
            );
        }
        return regions;
    }
    // Rectangle testing:
    containsPoint(aPoint) {
        return this.origin.le(aPoint) && aPoint.lt(this.corner);
    }
    containsRectangle(aRect) {
        return aRect.origin.gt(this.origin) &&
            aRect.corner.lt(this.corner);
    }
    intersects(aRect) {
        var ro = aRect.origin, rc = aRect.corner;
        return (rc.x >= this.origin.x) &&
            (rc.y >= this.origin.y) &&
            (ro.x <= this.corner.x) &&
            (ro.y <= this.corner.y);
    }
    isNearTo(aRect, threshold) {
        var ro = aRect.origin, rc = aRect.corner, border = threshold || 0;
        return (rc.x + border >= this.origin.x) &&
            (rc.y + border >= this.origin.y) &&
            (ro.x - border <= this.corner.x) &&
            (ro.y - border <= this.corner.y);
    }
    // Rectangle transforming:
    scaleBy(scale) {
        // scale can be either a Point or a scalar
        var o = this.origin.multiplyBy(scale), c = this.corner.multiplyBy(scale);
        return new Rectangle(o.x, o.y, c.x, c.y);
    }
    translateBy(delta) {
        // delta can be either a Point or a number
        var o = this.origin.add(delta), c = this.corner.add(delta);
        return new Rectangle(o.x, o.y, c.x, c.y);
    }
    // Rectangle converting:
    asArray() {
        return [this.left(), this.top(), this.right(), this.bottom()];
    }
    asArray_xywh() {
        return [this.left(), this.top(), this.width(), this.height()];
    }
}

















































