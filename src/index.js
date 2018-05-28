// import _ from 'lodash';
import { Terminal } from 'xterm';
import * as fit from 'xterm/lib/addons/fit/fit';
import { Promise } from 'bluebird';
import Buffer from './js/buffer';
import Exec from './js/exec';
import Colors from './js/colors';

import './sass/index.scss';

Terminal.applyAddon(fit);

const term = new Terminal({
  scrollBack: 500,
  fontSize: 30,
  cols: 50,
  rows: 17,
  enableBold: true,
  fontFamily: 'Lucida Console, monospace'
});

const buffer = new Buffer();

const systemLib = {
  _main_: {
    term,
    buffer
  },
  clear() {
    term.clear();
    buffer.flush();
    return undefined;
  },
  echo(text) {
    term.write(text);
  },
  connect() {
    term.write('TODO');
  }
};

const exec = new Exec(systemLib);

term.open(document.getElementById('terminal'));

term.fit();

term.write('$ ');

term.on('key', (key, ev) => {
  // console.log(key, ev);
  // term.writeln(JSON.stringify([ev.charCode, ev.keyCode, ev.key]));

  //console.log(ev.keyCode, ev);

  if (ev.charCode === 0) {
    if (
      ev.code === 'ArrowUp' ||
      ev.code === 'ArrowDown' ||
      ev.code === 'ArrowLeft' ||
      ev.code === 'ArrowRight' ||
      (ev.keyCode >= 37 && ev.keyCode <= 40)
    ) {
      if (ev.keyCode === 37 || ev.keyCode === 39) {
        const move = buffer.move(ev.keyCode === 37 ? -1 : ev.keyCode === 39);
        if (move !== 0) term.write(key);
      }
    } else if (ev.keyCode === 13) {
      // RETURN
      try {
        const input = buffer.get();
        buffer.flush();
        if (input.length > 0) {
          term.write('\r\n');
          const result = exec.try(input);
          if (typeof result === 'function') {
            term.write('function ' + result.name);
          } else if (result !== undefined) {
            term.write(JSON.stringify(result));
          }
        }
      } catch (e) {
        term.write([Colors.RED, 'Error: ' + e.message, Colors.NC].join(''));
      }
      term.write('\r\n$ ');
    } else if (ev.keyCode === 8) {
      // Backspace
      if (buffer.size() > 0) {
        term.write('\b \b');
        buffer.back();
      }
    }
  } else {
    const printable = !ev.altKey && !ev.altGraphKey && !ev.ctrlKey && !ev.metaKey;
    if (printable) {
      buffer.write(key);
      term.write(key);
    }
  }
});
