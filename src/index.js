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
import getQueryVariable from './js/qs';
import SystemLibrary from './js/system';

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
const buffer = new Buffer();
const emu = new Emulator(term, buffer);
const sys = new SystemLibrary(emu);

class Network {
  constructor() {
    this.poller = new HttpPoller(this.__generator.bind(this));
    this.connected = false;
    this.generator = undefined;
  }

  set generator(gen = () => {}) {
    this._generator = gen;
  }

  set callback(cb) {
    this.poller.callback(cb);
  }

  __generator() {
    return this._generator();
  }

  connect(addr) {
    sys.echo('Connecting...');
    this.poller.start(addr);
    this.cb_id = this.poller.callback(this.tick.bind(this));
  }

  disconnect() {
    sys.echo('Disconnecting...');
    this.poller.stop();
    this.poller.manager.removeCallback(this.cb_id);
    this.connected = false;
  }

  tick(result) {
    if (result !== undefined) {
      if (!this.connected) sys.echo('Connected!');
      this.connected = true;
    }
  }
}

sys.network = new Network();
const exec = new Exec(sys);

term.open(document.getElementById('terminal'));
term.fit();

pastep.handler(chain => {
  return chain.then(value => {
    emu._write(value);
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
      emu._write(key);
    }
  }
});

const url = getQueryVariable('url');
if (url) {
  sys.network.connect(url);
}

emu.prompt().focus();
