// Globals
const HIDDEN_DOCK_MARGIN = 3;
const INCREMENT = 0.05;
const MOVE_BY = 0.05;
const CONTROL_SHIFT = ['ctrl', 'shift'];
const CONTROL_ALT_SHIFT = ['ctrl', 'alt', 'shift'];

// Relative directions
const LEFT = 'left';
const RIGHT = 'right';
const CENTER = 'center';

// Cardinal directions
const NW = 'nw';
const NE = 'ne';
const SE = 'se';
const SW = 'sw';

class ChainWindow {

  constructor(window1, margin = 10) {
    this.window = window1;
    this.margin = margin;
    this.frame = this.window.frame();
    this.parent = this.window.screen().flippedVisibleFrame();
  }

  // Difference frame
  difference() {
    return {
      x: this.parent.x - this.frame.x,
      y: this.parent.y - this.frame.y,
      width: this.parent.width - this.frame.width,
      height: this.parent.height - this.frame.height,
    };
  }

  // Set frame
  set() {
    this.window.setFrame(this.frame);
    this.frame = this.window.frame();
    return this;
  }

  // Move to screen
  screen(screen) {
    this.parent = screen.flippedVisibleFrame();
    return this;
  }

  // Move to cardinal directions NW, NE, SE, SW or relative direction CENTER
  to(direction) {
    const difference = this.difference();

    // X-coordinate
    switch (direction) {
      case NW: case SW:
        this.frame.x = this.parent.x + this.margin;
        break;
      case NE: case SE:
        this.frame.x = (this.parent.x + difference.width) - this.margin;
        break;
      case CENTER:
        this.frame.x = this.parent.x + (difference.width / 2);
        break;
      default:
        break;
    }

    // Y-coordinate
    switch (direction) {
      case NW: case NE:
        this.frame.y = this.parent.y + this.margin;
        break;
      case SE: case SW:
        this.frame.y = (this.parent.y + difference.height) - this.margin;
        break;
      case CENTER:
        this.frame.y = this.parent.y + (difference.height / 2);
        break;
      default:
        break;
    }

    return this;
  }

  // TODO :: REFACTOR
  move(factor) {
    const difference = this.difference();
    if (factor.width != null) {
      const step = this.parent.width * factor.width;
      // left & right
      if (step < 0) {
        if (this.frame.x + step < this.parent.x + this.margin) {
          this.frame.x = this.parent.x + this.margin;
        } else {
          this.frame.x += step;
        }
      }
      if (step > 0) {
        if (this.frame.x + this.frame.width + step > this.parent.width - this.margin) {
          this.frame.x = (this.parent.x + difference.width) - this.margin;
        } else {
          this.frame.x += step;
        }
      }
    }
    if (factor.height != null) {
      const step = this.parent.height * factor.height;
      // top & bottom
      if (step < 0) {
        if (this.frame.y + step < this.parent.y + this.margin) {
          this.frame.y = this.parent.y + this.margin;
        } else {
          this.frame.y += step;
        }
      }
      if (step > 0) {
        if (this.frame.y + this.frame.height + step > this.parent.height - this.margin) {
          this.frame.y = (this.parent.y + difference.height) - this.margin;
        } else {
          this.frame.y += step;
        }
      }
    }
    return this;
  }

  // Resize SE-corner by factor
  resize(factor) {
    const difference = this.difference();
    if (factor.width != null) {
      const delta = Math.min(this.parent.width * factor.width,
                             (difference.x + difference.width) - this.margin);
      this.frame.width += delta;
    }
    if (factor.height != null) {
      const delta = Math.min(this.parent.height * factor.height,
                    (difference.height - this.frame.y) + this.margin + HIDDEN_DOCK_MARGIN);
      this.frame.height += delta;
    }
    return this;
  }

  // Maximize to fill whole screen
  maximize() {
    this.frame.width = this.parent.width - (2 * this.margin);
    this.frame.height = this.parent.height - (2 * this.margin);
    return this;
  }

  // Halve width
  halve() {
    this.frame.width /= 2;
    return this;
  }

  halveVertically() {
    this.frame.height /= 2;
    return this;
  }

  // Fit to screen
  fit() {
    const difference = this.difference();
    if (difference.width < 0 || difference.height < 0) { this.maximize(); }
    return this;
  }

  // Fill relatively to LEFT or RIGHT-side of screen, or fill whole screen
  fill(direction) {
    this.maximize();
    if ([LEFT, RIGHT].includes(direction)) { this.halve(); }
    switch (direction) {
      case LEFT: this.to(NW); break;
      case RIGHT: this.to(NE); break;
      default: this.to(NW);
    }
    return this;
  }

}

// Chain a Window-object
Window.prototype.chain = function winChain() {
  return new ChainWindow(this);
};

// To direction in screen
Window.prototype.to = function winTo(direction, screen) {
  const window = this.chain();
  if (screen != null) { window.screen(screen).fit(); }
  return window.to(direction).set();
};

// Fill in screen
Window.prototype.fill = function winFill(direction, screen) {
  const window = this.chain();
  if (screen != null) { window.screen(screen); }
  window.fill(direction).set();
  // Ensure position for windows larger than expected
  if (direction === RIGHT) { return window.to(NE).set(); }
  return window;
};

// Resize by factor
Window.prototype.resize = function winResize(factor) {
  return this.chain().resize(factor).set();
};

Window.prototype.move = function winMove(factor) {
  return this.chain().move(factor).set();
};

Window.prototype.halve = function winFoldHorz() {
  return this.chain().halve().set();
};

Window.prototype.halveVertically = function winFoldVert() {
  return this.chain().halveVertically().set();
};


function guard(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}

Key.on('e', CONTROL_SHIFT, () => guard(Window.focused(), x => x.halve()));

Key.on('r', CONTROL_SHIFT, () => guard(Window.focused(), x => x.halveVertically()));

// Position Bindings
Key.on('q', CONTROL_SHIFT, () => guard(Window.focused(), x => x.to(NW)));

Key.on('w', CONTROL_SHIFT, () => guard(Window.focused(), x => x.to(NE)));

Key.on('s', CONTROL_SHIFT, () => guard(Window.focused(), x => x.to(SE)));

Key.on('a', CONTROL_SHIFT, () => guard(Window.focused(), x => x.to(SW)));

Key.on('c', CONTROL_SHIFT, () => guard(Window.focused(), x => x.to(CENTER)));

Key.on('q', CONTROL_ALT_SHIFT, () => {
  const window = Window.focused();
  return guard(window, x => x.to(NW, window.screen().next()));
});

Key.on('w', CONTROL_ALT_SHIFT, () => {
  const window = Window.focused();
  return guard(window, x => x.to(NE, window.screen().next()));
});

Key.on('s', CONTROL_ALT_SHIFT, () => {
  const window = Window.focused();
  return guard(window, x => x.to(SE, window.screen().next()));
});

Key.on('a', CONTROL_ALT_SHIFT, () => {
  const window = Window.focused();
  return guard(window, x => x.to(SW, window.screen().next()));
});

Key.on('c', CONTROL_ALT_SHIFT, () => {
  const window = Window.focused();
  return guard(window, x => x.to(CENTER, window.screen().next()));
});

// Fill Bindings

Key.on('f', CONTROL_SHIFT, () => guard(Window.focused(), x => x.fill()));

Key.on('o', CONTROL_SHIFT, () => guard(Window.focused(), x => x.fill(LEFT)));

Key.on('p', CONTROL_SHIFT, () => guard(Window.focused(), x => x.fill(RIGHT)));

Key.on('f', CONTROL_ALT_SHIFT, () => {
  const window = Window.focused();
  return guard(window, x => x.fill('', window.screen().next()));
});

Key.on('o', CONTROL_ALT_SHIFT, () => {
  const window = Window.focused();
  return guard(window, x => x.fill(LEFT, window.screen().next()));
});

Key.on('p', CONTROL_ALT_SHIFT, () => {
  const window = Window.focused();
  return guard(window, x => x.fill(RIGHT, window.screen().next()));
});

// Size Bindings

Key.on('l', CONTROL_SHIFT, () => guard(Window.focused(), x => x.move({ width: MOVE_BY })));

Key.on('h', CONTROL_SHIFT, () => guard(Window.focused(), x => x.move({ width: -MOVE_BY })));

Key.on('j', CONTROL_SHIFT, () => guard(Window.focused(), x => x.move({ height: MOVE_BY })));

Key.on('k', CONTROL_SHIFT, () => guard(Window.focused(), x => x.move({ height: -MOVE_BY })));

Key.on('l', CONTROL_ALT_SHIFT, () => guard(Window.focused(), x => x.resize({ width: INCREMENT })));

Key.on('h', CONTROL_ALT_SHIFT, () => guard(Window.focused(), x => x.resize({ width: -INCREMENT })));

Key.on('j', CONTROL_ALT_SHIFT, () => guard(Window.focused(), x => x.resize({ height: INCREMENT })));

Key.on('k', CONTROL_ALT_SHIFT, () => guard(Window.focused(), x => x.resize({ height: -INCREMENT })));

// Focus Bindings

Key.on('<', CONTROL_SHIFT, () => {
  const array = Window.recent();
  const last = array[array.length - 1];
  return guard(last, x => x.focus());
});
