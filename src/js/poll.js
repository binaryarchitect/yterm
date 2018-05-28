const callbacks = [];

class CallbackManager {
  static callback(data) {
    const runner = CallbackManager.run.bind(null, data);
    callbacks.forEach(runner);
  }

  static run(data, cb) {
    if (typeof cb === 'function') cb(data);
  }

  static addCallback(cb) {
    if (cb && callbacks.indexOf(cb) === -1) {
      return callbacks.push(cb);
    }
  }

  static removeCallback(cb) {
    if (typeof cb !== 'number') {
      cb = callbacks.indexOf(cb);
      callbacks.splice(cb, 1);
    }
    if (cb >= 0 && cb < callbacks.length) callbacks.splice(cb, 1);
  }
}

class HttpPoller {
  constructor(payload) {
    this.timer = -1;
    this.generator(payload);
    this.options = {
      timeout: 4000,
      rate: 3000
    };
  }

  get manager() {
    return CallbackManager;
  }

  callback(cb) {
    this.manager.removeCallback(this.cb_id);
    this.cb_id = this.manager.addCallback(cb);
  }

  start(addr) {
    clearInterval(this.timer);
    this.timer = setInterval(this.tick.bind(this, addr), this.options.rate);
  }

  stop() {
    clearInterval(this.timer);
  }

  generator(payload = () => {}) {
    this.payload = payload;
  }

  tick(addr) {
    const script = document.createElement('script');
    const timeout = setTimeout(this.timeout.bind(this, script), this.options.timeout);
    script.onload = this.loaded.bind(this, script, timeout);
    document.body.appendChild(script);
    script.src = addr + '/?' + escape(this.payload());
  }

  timeout(script) {
    script.remove();
    (window._callback || (() => {}))(null, new Error('Connection timed out'));
  }

  loaded(script, timeout) {
    clearTimeout(timeout);
    script.remove();
  }
}

window._callback = CallbackManager.callback;

export default HttpPoller;
