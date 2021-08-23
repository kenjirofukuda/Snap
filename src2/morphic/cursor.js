// CursorMorph /////////////////////////////////////////////////////////

// I am a String/Text editing widget

// CursorMorph: referenced constructors

// var CursorMorph;

// CursorMorph inherits from BlinkerMorph:

// CursorMorph.prototype = new BlinkerMorph();
// ;
// CursorMorph.uber = BlinkerMorph.prototype;

// CursorMorph preferences settings:

// CursorMorph.prototype.viewPadding = 1;

// CursorMorph instance creation:

class CursorMorph extends BlinkerMorph {
    constructor(aStringOrTextMorph, aTextarea) {
        super()
        this.init(aStringOrTextMorph, aTextarea);
    }
    init(aStringOrTextMorph, aTextarea) {
        var ls;

        // additional properties:
        this.keyDownEventUsed = false;
        this.target = aStringOrTextMorph;
        this.originalContents = this.target.text;
        this.originalAlignment = this.target.alignment;
        this.slot = this.target.text.length;
        this.textarea = aTextarea;

        super.init();

        // override inherited defaults
        ls = fontHeight(this.target.fontSize);
        this.setExtent(new Point(Math.max(Math.floor(ls / 20), 1), ls));

        if (this.target instanceof TextMorph &&
            (this.target.alignment !== 'left')) {
            this.target.setAlignmentToLeft();
        }
        this.textarea.value = this.target.text;
        this.textarea.style.fontSize = this.target.fontSize + 'px';
        this.gotoSlot(this.slot);
        this.updateTextAreaPosition();
        this.syncTextareaSelectionWith(this.target);
    }
    // CursorMorph event handling
    /*
         There are three cases when the textarea gets inputs:
    
         1. Inputs that represent special shortcuts of Snap!, so we
         don't want the textarea to handle it. These events are captured in
         "keydown" event handler.
    
         2. inputs that change the content of the textarea, we need to update
         the content of its target morph accordingly. This is handled in
         the "input" event handler.
    
         3. input that change the textarea without triggering an "input" event,
         e.g. selection change, cursor movements. These are handled in the
         "keyup" event handler.
    
         Note that some changes in case 2 are not caused by keyboards (for
         example, select a word by clicking in IME window), so there are overlaps
         between case 2 and case 3. but no one can replace the other.
     */
    processKeyDown(event) {
        /* Special shortcuts
            - ctrl-d, ctrl-i and ctrl-p: doit, inspect it and print it
            - tab: goto next text field
            - esc: discard the editing
            - enter / shift+enter: accept the editing
        */
        var keyName = event.key, shift = event.shiftKey, singleLineText = this.target instanceof StringMorph, dest;

        if (!isNil(this.target.receiver) && (event.ctrlKey || event.metaKey)) {
            if (keyName === 'd') {
                event.preventDefault();
                this.target.doIt();
                return;
            } else if (keyName === 'i') {
                event.preventDefault();
                this.target.inspectIt();
                return;
            } else if (keyName === 'p') {
                event.preventDefault();
                this.target.showIt();
                return;
            }
        }

        if (keyName === 'Tab' || keyName === 'U+0009') {
            if (shift) {
                this.target.backTab(this.target);
            } else {
                this.target.tab(this.target);
            }
            event.preventDefault();
            this.target.escalateEvent('reactToEdit', this.target);
        } else if (keyName === 'Escape') {
            this.cancel();
        } else if (keyName === "Enter" && (singleLineText || shift)) {
            this.accept();
        } else {
            // catch "up arrow" and "down arrow" keys
            if (keyName === 'ArrowDown') {
                dest = this.target.downFrom(this.slot);
                this.textarea.setSelectionRange(dest, dest);
                // to do: allow holding shift to select
                event.preventDefault();
            }
            if (keyName === 'ArrowUp') {
                dest = this.target.upFrom(this.slot);
                this.textarea.setSelectionRange(dest, dest);
                // to do: allow holding shift to select
                event.preventDefault();
            }
            this.target.escalateEvent('reactToKeystroke', event);
        }
    }
    processKeyUp(event) {
        // handle selection change and cursor position change.
        var textarea = this.textarea, target = this.target;

        if (textarea.selectionStart === textarea.selectionEnd) {
            target.startMark = null;
            target.endMark = null;
        } else {
            if (textarea.selectionDirection === 'backward') {
                target.startMark = textarea.selectionEnd;
                target.endMark = textarea.selectionStart;
            } else {
                target.startMark = textarea.selectionStart;
                target.endMark = textarea.selectionEnd;
            }
        }
        target.fixLayout();
        target.rerender();
        this.gotoSlot(textarea.selectionEnd);
    }
    processInput(event) {
        // handle content change.
        var target = this.target, textarea = this.textarea, filteredContent, caret;

        // filter invalid chars for numeric fields
        function filterText(content) {
            var points = 0, hasE = false, result = '', i, ch, valid;
            for (i = 0; i < content.length; i += 1) {
                ch = content.charAt(i);
                valid = (
                    ('0' <= ch && ch <= '9') || // digits
                    (ch.toLowerCase() === 'e') || // scientific notation
                    ((i === 0 || hasE) && ch === '-') || // leading '-' or sc. not.
                    (ch === '.' && points === 0) // at most '.'
                );
                if (valid) {
                    result += ch;
                    if (ch === '.') {
                        points += 1;
                    }
                    if (ch.toLowerCase() === 'e') {
                        hasE = true;
                    }
                }
            }
            return result;
        }

        if (target.isNumeric) {
            filteredContent = filterText(textarea.value);
        } else {
            filteredContent = textarea.value;
        }

        if (filteredContent.length < textarea.value.length) {
            textarea.value = filteredContent;
            caret = Math.min(textarea.selectionStart, filteredContent.length);
            textarea.selectionEnd = caret;
            textarea.selectionStart = caret;
        }
        // target morph: copy the content and selection status to the target.
        target.text = filteredContent;

        if (textarea.selectionStart === textarea.selectionEnd) {
            target.startMark = null;
            target.endMark = null;
        } else {
            if (textarea.selectionDirection === 'backward') {
                target.startMark = textarea.selectionEnd;
                target.endMark = textarea.selectionStart;
            } else {
                target.startMark = textarea.selectionStart;
                target.endMark = textarea.selectionEnd;
            }
        }
        target.changed();
        target.fixLayout();
        target.rerender();

        // cursor morph: copy the caret position to cursor morph.
        this.gotoSlot(textarea.selectionStart);

        this.updateTextAreaPosition();

        // the "reactToInput" event gets triggered AFTER "reactToKeystroke"
        this.target.escalateEvent('reactToInput', event);
    }
    // CursorMorph synching:
    updateTextAreaPosition() {
        var pos = getDocumentPositionOf(this.target.world().worldCanvas), origin = this.target.bounds.origin.add(new Point(pos.x, pos.y));

        function number2px(n) {
            return Math.ceil(n) + 'px';
        }

        this.textarea.style.top = number2px(origin.y);
        this.textarea.style.left = number2px(origin.x);
    }
    syncTextareaSelectionWith(targetMorph) {
        var start = targetMorph.startMark, end = targetMorph.endMark;

        if (start === end) {
            this.textarea.setSelectionRange(this.slot, this.slot, 'none');
        } else if (start < end) {
            this.textarea.setSelectionRange(start, end, 'forward');
        } else {
            this.textarea.setSelectionRange(end, start, 'backward');
        }
        this.textarea.focus();
    }
    // CursorMorph navigation:
    gotoSlot(slot) {
        var length = this.target.text.length, pos = this.target.slotPosition(slot), right, left;
        this.slot = slot < 0 ? 0 : slot > length ? length : slot;
        if (this.parent && this.target.isScrollable) {
            right = this.parent.right() - this.viewPadding;
            left = this.parent.left() + this.viewPadding;
            if (pos.x > right) {
                this.target.setLeft(this.target.left() + right - pos.x);
                pos.x = right;
            }
            if (pos.x < left) {
                left = Math.min(this.parent.left(), left);
                this.target.setLeft(this.target.left() + left - pos.x);
                pos.x = left;
            }
            if (this.target.right() < right &&
                right - this.target.width() < left) {
                pos.x += right - this.target.right();
                this.target.setRight(right);
            }
        }
        this.show();
        this.setPosition(pos);
        if (this.parent
            && this.parent.parent instanceof ScrollFrameMorph
            && this.target.isScrollable) {
            this.parent.parent.scrollCursorIntoView(this);
        }
    }
    gotoPos(aPoint) {
        this.gotoSlot(this.target.slotAt(aPoint));
        this.show();
    }
    // CursorMorph selecting:
    updateSelection(shift) {
        if (shift) {
            if (isNil(this.target.endMark) && isNil(this.target.startMark)) {
                this.target.startMark = this.slot;
                this.target.endMark = this.slot;
            } else if (this.target.endMark !== this.slot) {
                this.target.endMark = this.slot;
                this.target.changed();
            }
        } else {
            this.target.clearSelection();
        }
    }
    // CursorMorph editing:
    accept() {
        var world = this.root();
        if (world) {
            world.stopEditing();
        }
        this.escalateEvent('accept', this);
    }
    cancel() {
        var world = this.root();
        this.undo();
        if (world) {
            world.stopEditing();
        }
        this.escalateEvent('cancel', this);
    }
    undo() {
        this.target.text = this.originalContents;
        this.target.changed();
        this.target.fixLayout();
        this.target.changed();
        this.gotoSlot(0);
    }
    // CursorMorph destroying:
    destroy() {
        if (this.target.alignment !== this.originalAlignment) {
            this.target.alignment = this.originalAlignment;
            this.target.changed();
        }
        super.destroy();
        this.target.world().resetKeyboardHandler();
    }
}

CursorMorph.uber = BlinkerMorph.prototype;
CursorMorph.prototype.viewPadding = 1;












