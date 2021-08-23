// ShadowMorph /////////////////////////////////////////////////////////

// ShadowMorph inherits from Morph:

// ShadowMorph.prototype = new Morph();
// ;
// ShadowMorph.uber = Morph.prototype;

// ShadowMorph instance creation:

class ShadowMorph extends Morph {
    constructor() {
        super()
        this.init();
    }
    init() {
        super.init();
        this.isCachingImage = true;
    }
    topMorphAt() {
        return null;
    }
}



