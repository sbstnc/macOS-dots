'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Globals
var HIDDEN_DOCK_MARGIN = 3;
var INCREMENT = 0.05;
var MOVE_BY = 0.05;
var CONTROL_SHIFT = ['ctrl', 'shift'];
var CONTROL_ALT_SHIFT = ['ctrl', 'alt', 'shift'];

// Relative directions
var LEFT = 'left';
var RIGHT = 'right';
var CENTER = 'center';

// Cardinal directions
var NW = 'nw';
var NE = 'ne';
var SE = 'se';
var SW = 'sw';

var ChainWindow = function () {
  function ChainWindow(window1) {
    var margin = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 10;

    _classCallCheck(this, ChainWindow);

    this.window = window1;
    this.margin = margin;
    this.frame = this.window.frame();
    this.parent = this.window.screen().flippedVisibleFrame();
  }

  // Difference frame


  _createClass(ChainWindow, [{
    key: 'difference',
    value: function difference() {
      return {
        x: this.parent.x - this.frame.x,
        y: this.parent.y - this.frame.y,
        width: this.parent.width - this.frame.width,
        height: this.parent.height - this.frame.height
      };
    }

    // Set frame

  }, {
    key: 'set',
    value: function set() {
      this.window.setFrame(this.frame);
      this.frame = this.window.frame();
      return this;
    }

    // Move to screen

  }, {
    key: 'screen',
    value: function screen(_screen) {
      this.parent = _screen.flippedVisibleFrame();
      return this;
    }

    // Move window to space

  }, {
    key: 'space',
    value: function space(_space) {
      var _this = this;

      var normalSpaces = Space.all().filter(function (s) {
        return s.isNormal();
      });
      if (_space <= normalSpaces.length) {
        var targetSpace = normalSpaces[_space - 1];
        var targetScreen = targetSpace.screens()[0];

        this.window.setFullScreen(false);
        this.window.spaces().map(function (s) {
          return s.removeWindows([_this.window]);
        });
        targetSpace.addWindows([this.window]);

        var prevScreen = this.window.screen().visibleFrame();
        var nextScreen = targetScreen.visibleFrame();
        var xRatio = nextScreen.width / prevScreen.width;
        var yRatio = nextScreen.height / prevScreen.height;

        this.frame.x = nextScreen.x + (this.frame.x - prevScreen.x) * xRatio + (1 - xRatio) * Math.round(0.5 * this.frame.width);
        this.frame.y = nextScreen.y + (this.frame.y - prevScreen.y) * yRatio + (1 - yRatio) * Math.round(0.5 * this.frame.height);
        this.screen(targetScreen);
      }
      return this;
    }

    // Move to cardinal directions NW, NE, SE, SW or relative direction CENTER

  }, {
    key: 'to',
    value: function to(direction) {
      var difference = this.difference();

      // X-coordinate
      switch (direction) {
        case NW:
        case SW:
          this.frame.x = this.parent.x + this.margin;
          break;
        case NE:
        case SE:
          this.frame.x = this.parent.x + difference.width - this.margin;
          break;
        case CENTER:
          this.frame.x = this.parent.x + difference.width / 2;
          break;
        default:
          break;
      }

      // Y-coordinate
      switch (direction) {
        case NW:
        case NE:
          this.frame.y = this.parent.y + this.margin;
          break;
        case SE:
        case SW:
          this.frame.y = this.parent.y + difference.height - this.margin;
          break;
        case CENTER:
          this.frame.y = this.parent.y + difference.height / 2;
          break;
        default:
          break;
      }

      return this;
    }

    // Move window by factor

  }, {
    key: 'move',
    value: function move(factor) {
      var difference = this.difference();
      var stepX = this.parent.width * factor.width || 0,
          stepY = // default to 0
      this.parent.height * factor.height || 0;
      // a single move can never occur in both dimensions -> addition is safe

      switch (Math.sign(stepX + stepY)) {
        case -1:
          // move left or up
          this.frame.x = Math.max(this.frame.x + stepX, this.parent.x + this.margin);
          this.frame.y = Math.max(this.frame.y + stepY, this.parent.y + this.margin);
          break;
        case 1:
          // move right or down
          this.frame.x = Math.min(this.frame.x + stepX, this.parent.x + difference.width - this.margin);
          this.frame.y = Math.min(this.frame.y + stepY, this.parent.y + difference.height - this.margin);
          break;
        default:
      }
      return this;
    }

    // Resize SE-corner by factor

  }, {
    key: 'resize',
    value: function resize(factor) {
      var difference = this.difference();
      if (factor.width != null) {
        var delta = Math.min(this.parent.width * factor.width, difference.x + difference.width - this.margin);
        this.frame.width += delta;
      }
      if (factor.height != null) {
        var _delta = Math.min(this.parent.height * factor.height, difference.height - this.frame.y + this.margin + HIDDEN_DOCK_MARGIN);
        this.frame.height += _delta;
      }
      return this;
    }

    // Maximize to fill whole screen

  }, {
    key: 'maximize',
    value: function maximize() {
      this.frame.width = this.parent.width - 2 * this.margin;
      this.frame.height = this.parent.height - 2 * this.margin;
      return this;
    }

    // Halve width

  }, {
    key: 'halve',
    value: function halve() {
      this.frame.width /= 2;
      return this;
    }
  }, {
    key: 'halveVertically',
    value: function halveVertically() {
      this.frame.height /= 2;
      return this;
    }

    // Fit to screen

  }, {
    key: 'fit',
    value: function fit() {
      var difference = this.difference();
      if (difference.width < 0 || difference.height < 0) {
        this.maximize();
      }
      return this;
    }

    // Fill relatively to LEFT or RIGHT-side of screen, or fill whole screen

  }, {
    key: 'fill',
    value: function fill(direction) {
      this.maximize();
      if ([LEFT, RIGHT].includes(direction)) {
        this.halve();
      }
      switch (direction) {
        case LEFT:
          this.to(NW);
          break;
        case RIGHT:
          this.to(NE);
          break;
        default:
          this.to(NW);
      }
      return this;
    }
  }]);

  return ChainWindow;
}();

// Chain a Window-object


Window.prototype.chain = function winChain() {
  return new ChainWindow(this);
};

// To direction in screen
Window.prototype.to = function winTo(direction, screen) {
  var window = this.chain();
  if (screen != null) {
    window.screen(screen).fit();
  }
  return window.to(direction).set();
};

// Fill in screen
Window.prototype.fill = function winFill(direction, screen) {
  var window = this.chain();
  if (screen != null) {
    window.screen(screen);
  }
  window.fill(direction).set();
  // Ensure position for windows larger than expected
  if (direction === RIGHT) {
    return window.to(NE).set();
  }
  return window;
};

Window.prototype.moveToSpace = function winToSpace(space) {
  return this.chain().space(space).set();
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
  return typeof value !== 'undefined' && value !== null ? transform(value) : undefined;
}

var _loop = function _loop(i) {
  Key.on('' + i, CONTROL_SHIFT, function () {
    return guard(Window.focused(), function (x) {
      return x.moveToSpace(i);
    });
  });
};

for (var i = 1; i <= 9; i += 1) {
  _loop(i);
}

Key.on('e', CONTROL_SHIFT, function () {
  return guard(Window.focused(), function (x) {
    return x.halve();
  });
});

Key.on('r', CONTROL_SHIFT, function () {
  return guard(Window.focused(), function (x) {
    return x.halveVertically();
  });
});

// Position Bindings
Key.on('q', CONTROL_SHIFT, function () {
  return guard(Window.focused(), function (x) {
    return x.to(NW);
  });
});

Key.on('w', CONTROL_SHIFT, function () {
  return guard(Window.focused(), function (x) {
    return x.to(NE);
  });
});

Key.on('s', CONTROL_SHIFT, function () {
  return guard(Window.focused(), function (x) {
    return x.to(SE);
  });
});

Key.on('a', CONTROL_SHIFT, function () {
  return guard(Window.focused(), function (x) {
    return x.to(SW);
  });
});

Key.on('c', CONTROL_SHIFT, function () {
  return guard(Window.focused(), function (x) {
    return x.to(CENTER);
  });
});

Key.on('q', CONTROL_ALT_SHIFT, function () {
  var window = Window.focused();
  return guard(window, function (x) {
    return x.to(NW, window.screen().next());
  });
});

Key.on('w', CONTROL_ALT_SHIFT, function () {
  var window = Window.focused();
  return guard(window, function (x) {
    return x.to(NE, window.screen().next());
  });
});

Key.on('s', CONTROL_ALT_SHIFT, function () {
  var window = Window.focused();
  return guard(window, function (x) {
    return x.to(SE, window.screen().next());
  });
});

Key.on('a', CONTROL_ALT_SHIFT, function () {
  var window = Window.focused();
  return guard(window, function (x) {
    return x.to(SW, window.screen().next());
  });
});

Key.on('c', CONTROL_ALT_SHIFT, function () {
  var window = Window.focused();
  return guard(window, function (x) {
    return x.to(CENTER, window.screen().next());
  });
});

// Fill Bindings

Key.on('f', CONTROL_SHIFT, function () {
  return guard(Window.focused(), function (x) {
    return x.fill();
  });
});

Key.on('o', CONTROL_SHIFT, function () {
  return guard(Window.focused(), function (x) {
    return x.fill(LEFT);
  });
});

Key.on('p', CONTROL_SHIFT, function () {
  return guard(Window.focused(), function (x) {
    return x.fill(RIGHT);
  });
});

Key.on('f', CONTROL_ALT_SHIFT, function () {
  var window = Window.focused();
  return guard(window, function (x) {
    return x.fill('', window.screen().next());
  });
});

Key.on('o', CONTROL_ALT_SHIFT, function () {
  var window = Window.focused();
  return guard(window, function (x) {
    return x.fill(LEFT, window.screen().next());
  });
});

Key.on('p', CONTROL_ALT_SHIFT, function () {
  var window = Window.focused();
  return guard(window, function (x) {
    return x.fill(RIGHT, window.screen().next());
  });
});

// Size Bindings

Key.on('l', CONTROL_SHIFT, function () {
  return guard(Window.focused(), function (x) {
    return x.move({ width: MOVE_BY });
  });
});

Key.on('h', CONTROL_SHIFT, function () {
  return guard(Window.focused(), function (x) {
    return x.move({ width: -MOVE_BY });
  });
});

Key.on('j', CONTROL_SHIFT, function () {
  return guard(Window.focused(), function (x) {
    return x.move({ height: MOVE_BY });
  });
});

Key.on('k', CONTROL_SHIFT, function () {
  return guard(Window.focused(), function (x) {
    return x.move({ height: -MOVE_BY });
  });
});

Key.on('l', CONTROL_ALT_SHIFT, function () {
  return guard(Window.focused(), function (x) {
    return x.resize({ width: INCREMENT });
  });
});

Key.on('h', CONTROL_ALT_SHIFT, function () {
  return guard(Window.focused(), function (x) {
    return x.resize({ width: -INCREMENT });
  });
});

Key.on('j', CONTROL_ALT_SHIFT, function () {
  return guard(Window.focused(), function (x) {
    return x.resize({ height: INCREMENT });
  });
});

Key.on('k', CONTROL_ALT_SHIFT, function () {
  return guard(Window.focused(), function (x) {
    return x.resize({ height: -INCREMENT });
  });
});

// Focus Bindings

Key.on('<', CONTROL_SHIFT, function () {
  var array = Window.recent();
  var last = array[array.length - 1];
  return guard(last, function (x) {
    return x.focus();
  });
});
//# sourceMappingURL=phoenix.js.map
