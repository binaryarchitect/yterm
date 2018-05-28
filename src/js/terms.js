import { Terminal } from 'xterm';

module.exports = class InteractiveTerm extends Terminal {
  constructor(props) {
    super(props);

    this.input = '';
  }

  componentDidMount() {
    super.componentDidMount();

    if (!this.props.ttyInstance) {
      this.tty._repl = new Repl(line => {
        if (this.tty) {
          this.writeln(line);
          this.tty.prompt();
        }
      });

      this.tty.prompt = () => {
        this.tty.write('\u001b[33m$ \u001b[0m');
      };

      this.tty.writeln(
        '\u001b[32mThis is a basic interactive representation of a web browser javascript console\u001b[0m'
      );
      this.tty.writeln('\u001b[32mType some keys and commands to play around\u001b[0m');
      this.tty.prompt();

      this.tty.on('key', (key, ev) => {
        const printable = !ev.altKey && !ev.altGraphKey && !ev.ctrlKey && !ev.metaKey;
        // Ignore arrow keys
        if (
          ev.code === 'ArrowUp' ||
          ev.code === 'ArrowDown' ||
          ev.code === 'ArrowLeft' ||
          ev.code === 'ArrowRight'
        ) {
          return;
        }

        if (ev.keyCode === 13) {
          this.write('\r\n');
          this.tty._repl.process(this.input);
          this.input = '';
        } else if (ev.keyCode === 8) {
          if (this.tty.buffer.x > 2) {
            this.tty.write('\b \b');
            this.input = this.input.slice(0, -1);
          }
        } else if (printable) {
          this.input += key;
          this.tty.write(key);
        }
      });
    }
  }

  componentWillUnmount() {
    if (!this.props.persistent) {
      this.tty._repl.destroy();
    }

    super.componentWillUnmount();
  }
};
