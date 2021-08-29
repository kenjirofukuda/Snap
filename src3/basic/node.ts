
class MorphicNode {
    parent: MorphicNode | null = null;
    children: MorphicNode[] = [];

    constructor(parent?: MorphicNode , childrenArray?: MorphicNode[]) {
        MorphicNode.prototype.init.call(this, parent, childrenArray); // temporary
    }
    init(parent?: MorphicNode, childrenArray?: MorphicNode[]): void {
        this.parent = parent || null;
        this.children = childrenArray || [];
    }
    // Node string representation: e.g. 'a Node[3]'
    toString(): string {
        return 'a Node' + '[' + this.children.length.toString() + ']';
    }
    // Node accessing:
    addChild(aNode: MorphicNode): void {
        this.children.push(aNode);
        aNode.parent = this;
    }
    addChildFirst(aNode: MorphicNode): void {
        this.children.splice(0, 0, aNode);
        aNode.parent = this;
    }
    removeChild(aNode: MorphicNode) {
        const idx = this.children.indexOf(aNode);
        if (idx !== -1) {
            this.children.splice(idx, 1);
        }
    }
    // Node functions:
    root(): MorphicNode | null {
        if (this.parent == null) {
            return this;
        }
        return this.parent.root();
    }
    depth(): number {
        if (this.parent === null) {
            return 0;
        }
        return this.parent.depth() + 1;
    }
    allChildren(): MorphicNode[] {
        // includes myself
        let result: MorphicNode[] = [ this ];
        this.children.forEach((child) => {
        });
        return result;
    }
    forAllChildren(aFunction: (arg0: MorphicNode) => void) {
        if (this.children.length > 0) {
            this.children.forEach((child) => child.forAllChildren(aFunction));
        }
        aFunction(this);
    }
    anyChild(aPredicate: (arg0: MorphicNode) => boolean): boolean {
        // includes myself
        if (aPredicate(this)) {
            return true;
        }
        for (let i = 0; i < this.children.length; i += 1) {
            if (this.children[i].anyChild(aPredicate)) {
                return true;
            }
        }
        return false;
    }
    allLeafs() {
        let result: MorphicNode[] = [];
        this.allChildren().forEach(element => {
            if (element.children.length === 0) {
                result.push(element);
            }
        });
        return result;
    }
    allParents(): MorphicNode[] {
        // includes m
        let result: MorphicNode[] = [ this ];
        if (this.parent !== null) {
            result = result.concat(this.parent.allParents());
        }
        return result;
    }
    siblings(): MorphicNode[] {
        if (this.parent === null) {
            return [];
        }
        return this.parent.children.filter(child => child !== this);
    }
    parentThatIsA(...params: object[]): MorphicNode | null {
        // including myself
        // Note: you can pass in multiple constructors to test for
        for (let i = 0; i < arguments.length; i += 1) {
            if (this instanceof arguments[i]) {
                return this;
            }
        }
        if (!this.parent) {
            return null;
        }
        return this.parentThatIsA.apply(this.parent, params);
    }
    parentThatIsAnyOf(...constructors: object[]) {
        // deprecated, use parentThatIsA instead
        return this.parentThatIsA(constructors);
    }
}