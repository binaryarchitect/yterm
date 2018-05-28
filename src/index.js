// import _ from 'lodash';
import { Terminal } from 'xterm';
import * as fit from 'xterm/lib/addons/fit/fit';
import { Promise } from 'bluebird';

// Internal Includes
import Buffer from './js/buffer';
import Exec from './js/exec';
import Colors from './js/colors';
import HttpPoller from './js/poll';
import PastePoint from './js/pastepoint';
import Emulator from './js/emulator';
import Conzole from './js/conzole';

//Style
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

const conzole = new Conzole(false);
const pastep = new PastePoint();
const poller = new HttpPoller();
const buffer = new Buffer();
const emu = new Emulator(term, buffer);

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
  connect(addr) {
    term.write('Connecting...');
    poller.start(addr);
  },
  disconnect() {
    poller.stop();
  }
};

poller.generator(() => {
  return JSON.stringify({
    q: 'poll',
    r: []
  });
});

// Return from poller
window._callback = ({ agents, responses, env }) => {
  exec.mem.set('agents', agents);
  exec.mem.set('env', env);
};

const exec = new Exec(systemLib);

term.open(document.getElementById('terminal'));
term.fit();
term.write('$ ');

pastep.handler(chain => {
  return chain.then(value => {
    emu.write(value);
    term.focus();
  });
});

term.on('key', (key, ev) => {
  //console.log(ev.keyCode, ev, key);

  conzole.write(['term.on.key', ev.keyCode, ev.charCode].join(' '));

  if (ev.charCode === 0) {
    if (ev.keyCode >= 37 && ev.keyCode <= 40) {
      // arrows left & right
      if (ev.keyCode === 37 || ev.keyCode === 39) {
        emu.shift(key, ev.keyCode === 37 ? -1 : 1);
      }
    } else if (ev.keyCode === 13) {
      //return
      emu.return(exec.try.bind(exec));
    } else if (ev.keyCode === 8) {
      // backspace
      if (buffer.size() > 0) {
        term.write('\b \b');
        buffer.back();
      }
    } else if (ev.keyCode === 86 && (ev.ctrlKey === true || ev.altKey === true)) {
      //paste
      if (document.activeElement !== pastep.el) {
        pastep.show();
      }
    }
  } else {
    //write
    const printable = !ev.altKey && !ev.altGraphKey && !ev.ctrlKey && !ev.metaKey;
    if (printable) {
      emu.write(key);
    }
  }
});
