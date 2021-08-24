// ShadowMorph /////////////////////////////////////////////////////////

// ShadowMorph inherits from Morph:

// ShadowMorph.prototype = new Morph();
// ;
// ShadowMorph.uber = Morph.prototype;

// ShadowMorph instance creation:

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



