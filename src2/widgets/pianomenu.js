// PianoMenuMorph //////////////////////////////////////////////////////
/* 
    I am a menu that looks like a piano keyboard.
*/

// PianoMenuMorph inherits from MenuMorph

// PianoMenuMorph.prototype = new MenuMorph();
// ;
// super = MenuMorph.prototype;

// PianoMenuMorph instance creation:

class PianoMenuMorph extends MenuMorph {
    constructor(target, environment, fontSize, soundType) {
        super(target,null, environment,fonstSize)
        this.init(target, environment, fontSize, soundType);
    }
    init(target,
        environment,
        fontSize,
        soundType // number 1 - 4: 'sine', 'square', 'sawtooth' or 'triangle'
    ) {
        var choices, key;
        this.soundType = soundType;
        super.init(target, null, environment, fontSize);
        choices = {
            'C (48)': 48,
            'D (50)': 50,
            'C# (49)': 49,
            'E (52)': 52,
            'Eb (51)': 51,
            'F (53)': 53,
            'G (55)': 55,
            'F# (54)': 54,
            'A (57)': 57,
            'G# (56)': 56,
            'B (59)': 59,
            'Bb (58)': 58,
            'C (60)': 60,
            'D (62)': 62,
            'C# (61)': 61,
            'E (64)': 64,
            'Eb (63)': 63,
            'F (65)': 65,
            'G (67)': 67,
            'F# (66)': 66,
            'A (69)': 69,
            'G# (68)': 68,
            'B (71)': 71,
            'Bb (70)': 70,
            'C (72)': 72
        };
        for (key in choices) {
            if (Object.prototype.hasOwnProperty.call(choices, key)) {
                this.addItem(key, choices[key]);
            }
        }
    }
    createItems() {
        var item, fb, x, y, label, blackkey, key, keycolor, keywidth, keyheight, keyposition;

        this.children.forEach(m => m.destroy());
        this.children = [];
        if (!this.isListContents) {
            this.edge = MorphicPreferences.isFlat ? 0 : 5;
            this.border = MorphicPreferences.isFlat ? 1 : 2;
        }
        this.color = WHITE;
        this.borderColor = new Color(60, 60, 60);
        this.bounds.setExtent(ZERO);

        x = this.left() + 1;
        y = this.top() + (this.fontSize * 1.5) + 2;
        label = new StringMorph('', this.fontSize);
        this.items.forEach(tuple => {
            blackkey = tuple[0][1] !== " ";
            key = new BoxMorph(1, 1);
            if (blackkey) {
                keycolor = BLACK;
                keywidth = this.fontSize; // 9;
                keyheight = this.fontSize * 2.5;
                keyposition = new Point(x + 2 - (this.fontSize * 2), y);
            } else {
                keycolor = WHITE;
                keywidth = this.fontSize * 1.5;
                keyheight = this.fontSize * 4;
                keyposition = new Point(x + 1, y);
                x += keywidth - 1;
            }
            key.setColor(keycolor);
            key.setWidth(keywidth);
            key.setHeight(keyheight);
            item = new PianoKeyMorph(
                this.target,
                tuple[1],
                [key, tuple[0]],
                this.fontSize || MorphicPreferences.menuFontSize,
                MorphicPreferences.menuFontName,
                this.environment,
                tuple[2],
                tuple[3],
                tuple[4],
                tuple[5],
                tuple[6],
                label // String to change
            );
            item.setPosition(keyposition);
            this.add(item);
        });
        fb = this.fullBounds();
        label.setPosition(new Point((fb.width() / 2) - this.fontSize, 2));
        this.add(label);
        fb = this.fullBounds();
        this.bounds.setExtent(fb.extent().add(2));
    }
    // PianoMenuMorph keyboard selecting a key:
    select(aPianoKeyItem) {
        this.unselectAllItems();
        aPianoKeyItem.mouseEnter();
        this.selection = aPianoKeyItem;
        this.world.keyboardFocus = this;
        this.hasFocus = true;
    }
    unselectAllItems() {
        this.children.forEach(item => {
            if (item instanceof MenuItemMorph) {
                item.mouseLeave();
            }
        });
        this.changed();
    }
    selectKey(midiNum) {
        var key;
        if (isNil(midiNum)) {
            return;
        }
        key = detect(
            this.children,
            each => each.action === midiNum
        );
        if (key) {
            this.select(key);
        } else {
            this.selectKey(48);
        }
    }
    // PianoMenuMorph keyboard navigation & entry:
    processKeyDown(event) {
        // console.log(event.keyCode);
        switch (event.keyCode) {
            case 13: // 'enter'
            case 32: // 'space'
                if (this.selection) {
                    this.selection.mouseClickLeft();
                }
                return;
            case 27: // 'esc'
                return this.destroy();
            case 37: // 'left arrow'
            case 40: // 'down arrow'
            case 189: // -
                return this.selectDown();
            case 38: // 'up arrow'
            case 39: // 'right arrow'
            case 187: // +
            case 220: // #
                return this.selectUp();
            default:
                switch (event.key) {
                    case 'C':
                        return this.selectKey(48);
                    case 'c':
                        return this.selectKey(60);
                    case 'D':
                        return this.selectKey(50);
                    case 'd':
                        return this.selectKey(62);
                    case 'E':
                        return this.selectKey(52);
                    case 'e':
                        return this.selectKey(64);
                    case 'F':
                        return this.selectKey(53);
                    case 'f':
                        return this.selectKey(65);
                    case 'G':
                        return this.selectKey(55);
                    case 'g':
                        return this.selectKey(67);
                    case 'A':
                        return this.selectKey(57);
                    case 'a':
                        return this.selectKey(69);
                    case 'B':
                    case 'H':
                        return this.selectKey(59);
                    case 'b':
                    case 'h':
                        return this.selectKey(71);
                    default:
                        nop();
                }
        }
    }
    selectUp() {
        var next = 48;
        if (this.selection) {
            next = this.selection.action + 1;
            if (next > 72) {
                next = 48;
            }
        }
        this.selectKey(next);
    }
    selectDown() {
        var next = 48;
        if (this.selection) {
            next = this.selection.action - 1;
            if (next < 48) {
                next = 72;
            }
        }
        this.selectKey(next);
    }
    destroy() {
        this.children.forEach(key => {
            if (key.note) {
                key.note.stop();
            }
        });
        super.destroy();
    }
}









