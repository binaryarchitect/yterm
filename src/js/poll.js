export default class HttpPoller {
  constructor(payload) {
    this.timer = -1;
    this.generator(payload);
  }

  start(addr) {
    clearInterval(this.timer);
    this.timer = setInterval(this.tick.bind(this, addr), 1000);
  }

  stop() {
    clearInterval(this.timer);
  }

  generator(payload = () => {}) {
    this.payload = payload;
  }

  tick(addr) {
    const script = document.createElement('script');
    const timeout = setTimeout(this.timeout.bind(this, script), 2000);
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
