class MenuMorph extends BoxMorph {
    constructor(target, title, environment, fontSize) {
        super();
        MenuMorph.prototype.init.call(this, target, title, environment, fontSize);

        /*
        if target is a function, use it as callback:
        execute target as callback function with the action property
        of the triggered MenuItem as argument.
        Use the environment, if it is specified.
        Note: if action is also a function, instead of becoming
        the argument itself it will be called to answer the argument.
        For selections, Yes/No Choices etc.
    
        else (if target is not a function):
    
            if action is a function:
            execute the action with target as environment (can be null)
            for lambdafied (inline) actions
    
            else if action is a String:
            treat it as function property of target and execute it
            for selector-like actions
        */
    }
    init(target, title, environment, fontSize) {
        // additional properties:
        this.target = target;
        this.title = title || null;
        this.environment = environment || null;
        this.fontSize = fontSize || null;
        this.items = [];
        this.label = null;
        this.world = null;
        this.isListContents = false;
        this.hasFocus = false;
        this.selection = null;
        this.submenu = null;

        // initialize inherited properties:
        super.init();

        // override inherited properties:
        this.isDraggable = false;
        this.noDropShadow = true;
        this.fullShadowSource = false;

        // immutable properties:
        this.border = null;
        this.edge = null;
    }
    addItem(labelString,
        action,
        hint,
        color,
        bold,
        italic,
        doubleClickAction,
        shortcut,
        verbatim // optional bool, don't translate if true
    ) {
        /*
        labelString is normally a single-line string. But it can also be one
        of the following:
    
            * a multi-line string (containing line breaks)
            * an icon (either a Morph or a Canvas)
            * a tuple of format: [icon, string]
        */
        this.items.push([
            verbatim ? labelString || 'close' : localize(labelString || 'close'),
            action === 0 ? 0 : action || nop,
            hint,
            color,
            bold || false,
            italic || false,
            doubleClickAction,
            shortcut,
            verbatim
        ]);
    }
    addMenu(label, aMenu, indicator, verbatim) {
        this.addPair(
            label,
            aMenu,
            isNil(indicator) ? '\u25ba' : indicator,
            null,
            verbatim // don't translate
        );
    }
    addPair(label,
        action,
        shortcut,
        hint,
        verbatim // don't translate
    ) {
        this.addItem(
            label,
            action,
            hint,
            null,
            null,
            null,
            null,
            shortcut,
            verbatim
        );
    }
    addLine(width) {
        this.items.push([0, width || 1]);
    }
    createLabel() {
        var text;
        if (this.label !== null) {
            this.label.destroy();
        }
        text = new TextMorph(
            localize(this.title),
            this.fontSize || MorphicPreferences.menuFontSize,
            MorphicPreferences.menuFontName,
            true,
            false,
            'center'
        );
        text.alignment = 'center';
        text.color = WHITE;
        text.backgroundColor = this.borderColor;
        text.fixLayout();
        this.label = new BoxMorph(3, 0);
        if (MorphicPreferences.isFlat) {
            this.label.edge = 0;
        }
        this.label.color = this.borderColor;
        this.label.borderColor = this.borderColor;
        this.label.setExtent(text.extent().add(4));
        this.label.add(text);
        this.label.text = text;
    }
    createItems() {
        var item, fb, x, y, isLine = false;

        this.children.forEach(m => m.destroy());
        this.children = [];
        if (!this.isListContents) {
            this.edge = MorphicPreferences.isFlat ? 0 : 5;
            this.border = MorphicPreferences.isFlat ? 1 : 2;
        }
        this.color = WHITE;
        this.borderColor = new Color(60, 60, 60);
        this.setExtent(new Point(0, 0));

        y = 2;
        x = this.left() + 4;
        if (!this.isListContents) {
            if (this.title) {
                this.createLabel();
                this.label.setPosition(this.bounds.origin.add(4));
                this.add(this.label);
                y = this.label.bottom();
            } else {
                y = this.top() + 4;
            }
        }
        y += 1;
        this.items.forEach(tuple => {
            isLine = false;
            if (tuple instanceof StringFieldMorph ||
                tuple instanceof ColorPickerMorph ||
                tuple instanceof SliderMorph ||
                tuple instanceof DialMorph) {
                item = tuple;
            } else if (tuple[0] === 0) {
                isLine = true;
                item = new Morph();
                item.color = this.borderColor;
                item.setHeight(tuple[1]);
            } else {
                item = new MenuItemMorph(
                    this.target,
                    tuple[1],
                    tuple[0],
                    this.fontSize || MorphicPreferences.menuFontSize,
                    MorphicPreferences.menuFontName,
                    this.environment,
                    tuple[2],
                    tuple[3],
                    tuple[4],
                    tuple[5],
                    tuple[6],
                    tuple[7] // shortcut
                );
            }
            if (isLine) {
                y += 1;
            }
            item.setPosition(new Point(x, y));
            this.add(item);
            y = y + item.height();
            if (isLine) {
                y += 1;
            }
        });

        fb = this.fullBounds();
        this.setExtent(fb.extent().add(4));
        this.adjustWidths();
    }
    maxWidth() {
        var w = 0;

        if (this.parent instanceof FrameMorph) {
            if (this.parent.scrollFrame instanceof ScrollFrameMorph) {
                w = this.parent.scrollFrame.width();
            }
        }
        this.children.forEach(item => {
            if (item instanceof MenuItemMorph) {
                w = Math.max(
                    w,
                    item.label.width() + 8 +
                    (item.shortcut ? item.shortcut.width() + 4 : 0)
                );
            } else if ((item instanceof StringFieldMorph) ||
                (item instanceof ColorPickerMorph) ||
                (item instanceof SliderMorph) ||
                (item instanceof DialMorph)) {
                w = Math.max(w, item.width());
            }
        });
        if (this.label) {
            w = Math.max(w, this.label.width());
        }
        return w;
    }
    adjustWidths() {
        var w = this.maxWidth();
        this.children.forEach(item => {
            if (!(item instanceof DialMorph)) {
                item.setWidth(w);
            }
            item.fixLayout();
            if (item === this.label) {
                item.text.setPosition(
                    item.center().subtract(
                        item.text.extent().floorDivideBy(2)
                    )
                );
            }
        });
    }
    unselectAllItems() {
        this.children.forEach(item => {
            if (item instanceof MenuItemMorph) {
                if (item.userState !== 'normal') {
                    item.userState = 'normal';
                    item.rerender();
                }
            } else if (item instanceof ScrollFrameMorph) {
                item.contents.children.forEach(morph => {
                    if (morph instanceof MenuItemMorph &&
                        morph.userState !== 'normal') {
                        morph.userState = 'normal';
                        morph.rerender();
                    }
                });
            }
        });
    }
    // MenuMorph popping up
    popup(world, pos) {
        var scroller;

        this.createItems();
        this.setPosition(pos);
        this.addShadow(new Point(2, 2), 80);
        this.keepWithin(world);

        if (this.bottom() > world.bottom()) {
            // scroll menu items if the menu is taller than the world
            this.removeShadow();
            scroller = this.scroll();
            this.bounds.corner.y = world.bottom() - 2;
            this.addShadow(new Point(2, 2), 80);
            scroller.setHeight(world.bottom() - scroller.top() - 6);
            scroller.adjustScrollBars(); // ?
        }

        if (world.activeMenu) {
            world.activeMenu.destroy();
        }
        if (this.items.length < 1 && !this.title) { // don't show empty menus
            return;
        }
        world.add(this);
        world.activeMenu = this;
        this.world = world; // optionally enable keyboard support
        this.fullChanged();
    }
    scroll() {
        // private - move all items into a scroll frame
        var scroller = new ScrollFrameMorph(), start = this.label ? 1 : 0, first = this.children[start];

        scroller.setPosition(first.position());
        this.children.slice(start).forEach(morph => scroller.addContents(morph));
        this.add(scroller);
        scroller.setWidth(first.width());
        return scroller;
    }
    popUpAtHand(world) {
        var wrrld = world || this.world;
        this.popup(wrrld, wrrld.hand.position());
    }
    popUpCenteredAtHand(world) {
        var wrrld = world || this.world;
        this.fixLayout();
        this.createItems();
        this.popup(
            wrrld,
            wrrld.hand.position().subtract(
                this.extent().floorDivideBy(2)
            )
        );
    }
    popUpCenteredInWorld(world) {
        var wrrld = world || this.world;
        this.fixLayout();
        this.createItems();
        this.popup(
            wrrld,
            wrrld.center().subtract(
                this.extent().floorDivideBy(2)
            )
        );
    }
    // MenuMorph submenus
    closeRootMenu() {
        if (this.parent instanceof MenuMorph) {
            this.parent.closeRootMenu();
        } else {
            this.destroy();
        }
    }
    closeSubmenu() {
        if (this.submenu) {
            this.submenu.destroy();
            this.submenu = null;
            this.unselectAllItems();
            this.world.activeMenu = this;
        }
    }
    // MenuMorph keyboard accessibility
    getFocus() {
        this.world.keyboardFocus = this;
        this.selection = null;
        this.selectFirst();
        this.hasFocus = true;
    }
    processKeyDown(event) {
        // console.log(event.keyCode);
        switch (event.keyCode) {
            case 13: // 'enter'
            case 32: // 'space'
                if (this.selection) {
                    this.selection.mouseClickLeft();
                    if (this.submenu) {
                        this.submenu.getFocus();
                    }
                }
                return;
            case 27: // 'esc'
                return this.destroy();
            case 37: // 'left arrow'
                return this.leaveSubmenu();
            case 38: // 'up arrow'
                return this.selectUp();
            case 39: // 'right arrow'
                return this.enterSubmenu();
            case 40: // 'down arrow'
                return this.selectDown();
            default:
                nop();
        }
    }
    processKeyUp(event) {
        nop(event);
    }
    processKeyPress(event) {
        nop(event);
    }
    selectFirst() {
        var scroller, items, i;

        scroller = detect(
            this.children,
            morph => morph instanceof ScrollFrameMorph
        );
        items = scroller ? scroller.contents.children : this.children;
        for (i = 0; i < items.length; i += 1) {
            if (items[i] instanceof MenuItemMorph) {
                this.select(items[i]);
                return;
            }
        }
    }
    selectUp() {
        var scroller, triggers, idx;

        scroller = detect(
            this.children,
            morph => morph instanceof ScrollFrameMorph
        );
        triggers = (scroller ? scroller.contents.children : this.children).filter(
            each => each instanceof MenuItemMorph
        );
        if (!this.selection) {
            if (triggers.length) {
                this.select(triggers[0]);
            }
            return;
        }
        idx = triggers.indexOf(this.selection) - 1;
        if (idx < 0) {
            idx = triggers.length - 1;
        }
        this.select(triggers[idx]);
    }
    selectDown() {
        var scroller, triggers, idx;

        scroller = detect(
            this.children,
            morph => morph instanceof ScrollFrameMorph
        );
        triggers = (scroller ? scroller.contents.children : this.children).filter(
            each => each instanceof MenuItemMorph
        );
        if (!this.selection) {
            if (triggers.length) {
                this.select(triggers[0]);
            }
            return;
        }
        idx = triggers.indexOf(this.selection) + 1;
        if (idx >= triggers.length) {
            idx = 0;
        }
        this.select(triggers[idx]);
    }
    enterSubmenu() {
        if (this.selection && this.selection.action instanceof MenuMorph) {
            this.selection.popUpSubmenu();
            if (this.submenu) {
                this.submenu.getFocus();
            }
        }
    }
    leaveSubmenu() {
        var menu = this.parent;
        if (this.parent instanceof MenuMorph) {
            menu.submenu = null;
            menu.hasFocus = true;
            this.destroy();
            menu.world.keyboardFocus = menu;
            menu.world.activeMenu = menu;
        }
    }
    select(aMenuItem) {
        this.unselectAllItems();
        aMenuItem.userState = 'highlight';
        aMenuItem.rerender();
        aMenuItem.scrollIntoView();
        this.selection = aMenuItem;
    }
    destroy() {
        if (this.hasFocus) {
            this.world.keyboardFocus = null;
        }
        if (!this.isListContents && (this.world.activeMenu === this)) {
            this.world.activeMenu = null;
        }
        super.destroy();
    }
}





























