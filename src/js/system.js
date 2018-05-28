class SystemLibrary {
  constructor(emu) {
    this.emu = emu;
  }

  get network() {
    return this._network;
  }

  set network(network) {
    this._network = network;
  }

  clear() {
    this.emu.scope.term.clear();
    this.emu.scope.buffer.flush();
    return undefined;
  }

  log(text) {
    this.emu._out(text);
  }

  echo(text) {
    this.emu.write(text);
  }
}

export default SystemLibrary;
