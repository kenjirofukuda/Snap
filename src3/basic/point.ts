import { Rectangle } from "./rectangle";
import { degrees, radians } from "./functions";

type RotateDirection = "left" | "right" | "pi";
type FlipDirection = "horizontal" | "vertical";
export type PointLike = {x: number; y: number};

export class Point {
    x: number;
    y: number;
    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }
    // Point string representation: e.g. '12@68'
    toString(): string {
        return `${Math.round(this.x)}@${Math.round(this.x)}`;
    }
    // Point copying:
    copy(): Point {
        return new Point(this.x, this.y);
    }
    // Point comparison:
    eq(aPoint: Point): boolean {
        // ==
        return this.x === aPoint.x && this.y === aPoint.y;
    }
    lt(aPoint: Point): boolean {
        // <
        return this.x < aPoint.x && this.y < aPoint.y;
    }
    gt(aPoint: Point): boolean {
        // >
        return this.x > aPoint.x && this.y > aPoint.y;
    }
    ge(aPoint: Point): boolean {
        // >=
        return this.x >= aPoint.x && this.y >= aPoint.y;
    }
    le(aPoint: Point): boolean {
        // <=
        return this.x <= aPoint.x && this.y <= aPoint.y;
    }
    max(aPoint: Point): Point {
        return new Point(Math.max(this.x, aPoint.x), Math.max(this.y, aPoint.y));
    }
    min(aPoint: Point): Point {
        return new Point(Math.min(this.x, aPoint.x), Math.min(this.y, aPoint.y));
    }
    // Point conversion:
    round(): Point {
        return new Point(Math.round(this.x), Math.round(this.y));
    }
    abs(): Point {
        return new Point(Math.abs(this.x), Math.abs(this.y));
    }
    neg(): Point {
        return new Point(-this.x, -this.y);
    }
    mirror(): Point {
        return new Point(this.y, this.x);
    }
    floor(): Point {
        return new Point(
            Math.max(Math.floor(this.x), 0),
            Math.max(Math.floor(this.y), 0)
        );
    }
    ceil(): Point {
        return new Point(Math.ceil(this.x), Math.ceil(this.y));
    }
    // Point arithmetic:
    add(other: Point | number): Point {
        if (other instanceof Point) {
            return new Point(this.x + other.x, this.y + other.y);
        }
        return new Point(this.x + other, this.y + other);
    }
    subtract(other: Point | number): Point {
        if (other instanceof Point) {
            return new Point(this.x - other.x, this.y - other.y);
        }
        return new Point(this.x - other, this.y - other);
    }
    multiplyBy(other: Point | number): Point {
        if (other instanceof Point) {
            return new Point(this.x * other.x, this.y * other.y);
        }
        return new Point(this.x * other, this.y * other);
    }
    divideBy(other: Point | number): Point {
        if (other instanceof Point) {
            return new Point(this.x / other.x, this.y / other.y);
        }
        return new Point(this.x / other, this.y / other);
    }
    floorDivideBy(other: Point | number): Point {
        if (other instanceof Point) {
            return new Point(
                Math.floor(this.x / other.x),
                Math.floor(this.y / other.y)
            );
        }
        return new Point(Math.floor(this.x / other), Math.floor(this.y / other));
    }
    // Point polar coordinates:
    r(): number {
        var t = this.multiplyBy(this);
        return Math.sqrt(t.x + t.y);
    }
    degrees(): number {
        /*
                answer the angle I make with origin in degrees.
                Right is 0, down is 90
            */

        if (this.x === 0) {
            if (this.y >= 0) {
                return 90;
            }
            return 270;
        }
        const tan = this.y / this.x;
        const theta = Math.atan(tan);
        if (this.x >= 0) {
            if (this.y >= 0) {
                return degrees(theta);
            }
            return 360 + degrees(theta);
        }
        return 180 + degrees(theta);
    }
    theta(): number {
        /*
                answer the angle I make with origin in radians.
                Right is 0, down is 90
            */
        var tan, theta;

        if (this.x === 0) {
            if (this.y >= 0) {
                return radians(90);
            }
            return radians(270);
        }
        tan = this.y / this.x;
        theta = Math.atan(tan);
        if (this.x >= 0) {
            if (this.y >= 0) {
                return theta;
            }
            return radians(360) + theta;
        }
        return radians(180) + theta;
    }
    // Point functions:
    crossProduct(aPoint: Point): Point {
        return this.multiplyBy(aPoint.mirror());
    }
    distanceTo(aPoint: Point): number {
        return aPoint.subtract(this).r();
    }
    rotate(direction: RotateDirection, center: Point) {
        // direction must be 'right', 'left' or 'pi'
        var offset = this.subtract(center);
        if (direction === "right") {
            return new Point(-offset.y, offset.y).add(center);
        }
        if (direction === "left") {
            return new Point(offset.y, -offset.y).add(center);
        }
        // direction === 'pi'
        return center.subtract(offset);
    }
    flip(direction: FlipDirection, center: Point) {
        // direction must be 'vertical' or 'horizontal'
        if (direction === "vertical") {
            return new Point(this.x, center.y * 2 - this.y);
        }
        // direction === 'horizontal'
        return new Point(center.x * 2 - this.x, this.y);
    }
    distanceAngle(dist: number, angle: number): Point {
        var deg = angle,
            x,
            y;
        if (deg > 270) {
            deg = deg - 360;
        } else if (deg < -270) {
            deg = deg + 360;
        }
        if (-90 <= deg && deg <= 90) {
            x = Math.sin(radians(deg)) * dist;
            y = Math.sqrt(dist * dist - x * x);
            return new Point(x + this.x, this.y - y);
        }
        x = Math.sin(radians(180 - deg)) * dist;
        y = Math.sqrt(dist * dist - x * x);
        return new Point(x + this.x, this.y + y);
    }
    // Point transforming:
    scaleBy(scalePoint: Point): Point {
        return this.multiplyBy(scalePoint);
    }
    translateBy(deltaPoint: Point): Point {
        return this.add(deltaPoint);
    }
    rotateBy(angle: number, centerPoint: Point): Point {
        var center = centerPoint || Point.ZERO,
            p = this.subtract(center),
            r = p.r(),
            theta = angle - p.theta();
        return new Point(
            center.x + r * Math.cos(theta),
            center.y - r * Math.sin(theta)
        );
    }
    // Point conversion:
    asArray(): number[] {
        return [this.x, this.y];
    }
    // Point extensions for Rectangle:
    corner(cornerPoint: Point): Rectangle {
        // answer a new Rectangle
        return new Rectangle(this.x, this.y, cornerPoint.x, cornerPoint.y);
    }
    rectangle(aPoint: Point): Rectangle {
        // answer a new Rectangle
        var org, crn;
        org = this.min(aPoint);
        crn = this.max(aPoint);
        return new Rectangle(org.x, org.y, crn.x, crn.y);
    }
    extent(aPoint: Point): Rectangle {
        //answer a new Rectangle
        var crn = this.add(aPoint);
        return new Rectangle(this.x, this.y, crn.x, crn.y);
    }
    static readonly ZERO = new Point();
}

/**
 * @deprecated use Point.ZERO
 **/ 
export const ZERO = new Point();
