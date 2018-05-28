'use strict';

const unicode = {
  CLEARLINE: '\x1B[2K'
};

export default new Proxy(unicode, {
  get(target, name) {
    return target[name.toUpperCase()];
  }
});
