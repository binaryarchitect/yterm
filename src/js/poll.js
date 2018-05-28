export default class HttpPoller {
  constructor() {
    this.timer = -1;
  }

  start(addr) {
    clearInterval(timer);
    this.timer = setInterval(this.tick.bind(this, addr), 5000);
  }

  tick(addr) {
    const script = document.createElement('script');
    script.onload = this.loaded.bind(this, script);
    document.body.appendChild(script);
    script.src = addr;
  }

  loaded(script) {
    script.remove();
  }
}
