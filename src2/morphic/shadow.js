class ShadowMorph extends Morph {
    constructor() {
        super()
        ShadowMorph.prototype.init.call(this); // temporary
    }
    init() {
        this.isCachingImage = true;
    }
    topMorphAt() {
        return null;
    }
}



