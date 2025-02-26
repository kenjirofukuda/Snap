/* global Morph, Color */
/* eslint-noundef: "error" */
/* eslint-env broser */
/**
 * can be used for text cursors
 * @extends Morph
 */
// eslint-disable-next-line no-unused-vars
class BlinkerMorph extends Morph {
    constructor(rate) {
        super()
        BlinkerMorph.prototype.init.call(this, rate)
    }

    init(rate) {
        Morph.prototype.init.call(this);
        this.color = new Color(0, 0, 0);
        this.fps = rate || 2;
    }

    // BlinkerMorph stepping:
    step() {
        this.toggleVisibility();
    }
}



