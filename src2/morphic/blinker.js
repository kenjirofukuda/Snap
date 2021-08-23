// BlinkerMorph ////////////////////////////////////////////////////////

// can be used for text cursors

// var BlinkerMorph;

// // BlinkerMorph inherits from Morph:

// BlinkerMorph.prototype = new Morph();
// ;
// BlinkerMorph.uber = Morph.prototype;

// BlinkerMorph instance creation:

class BlinkerMorph extends Morph {
    constructor(rate) {
        super()
        this.color = new Color(0, 0, 0);
        this.fps = rate || 2;
    }
    
    // init(rate) {
    //     super.init();
    //     this.color = new Color(0, 0, 0);
    //     this.fps = rate || 2;
    // }
    // BlinkerMorph stepping:
    step() {
        this.toggleVisibility();
    }
}



