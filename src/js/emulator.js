import Colors from './colors';
import Unicode from './unicode';

export default class Emulator {
  constructor(term, buffer) {
    this.t = term;
    this.b = buffer;
  }

  get prefix() {
    return '$ ';
  }

  get scope() {
    return {
      term: this.t,
      buffer: this.b
    };
  }

  _out(value) {
    const { term } = this.scope;
    term.write(value);
  }

  _write(value) {
    const { term, buffer } = this.scope;
    buffer.write(value);
    term.write(value);
  }

  shift(key, dir) {
    const { term, buffer } = this.scope;
    buffer.move(dir);
    if (bufer.move(dir) !== 0) term.write(key);
  }

  prompt() {
    const { term, buffer } = this.scope;
    term.write('\r\n');
    term.write(this.prefix);
    term.write(buffer.get());
    return this;
  }

  focus() {
    this.scope.term.focus();
    return this;
  }

  return(then) {
    const { term, buffer } = this.scope;
    try {
      const input = buffer.get();
      if (input.length > 0) {
        term.write('\r\n');
        buffer.flush();
        const result = then(input);
        if (typeof result === 'function') {
          term.write('function ' + result.name);
        } else if (result !== undefined) {
          term.write(JSON.stringify(result));
        }
      }
    } catch (e) {
      term.write([Colors.RED, 'Error: ' + e.message, Colors.NC].join(''));
    }
    this.prompt();
  }

  write(value) {
    this._out(Unicode.clearLine + value);
    this.prompt();
  }
}
