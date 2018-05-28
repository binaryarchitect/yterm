'use strict';

import { Promise } from 'bluebird';

export default class PastePoint {
  constructor() {
    this.el = document.createElement('textarea');
    this.el.classList.add('pastepoint');
    this.callback = () => {};
    this.hide();
    // this.el.addEventListener('keypress', this.keypress.bind(this));
    this.el.addEventListener('paste', this.paste.bind(this), false);
    document.body.appendChild(this.el);
  }

  get value() {
    return this.el.value;
  }

  handler(callback) {
    this.callback = callback || (() => {});
  }

  show() {
    this.el.classList.remove('hidden');
    this.el.focus();
  }

  hide() {
    this.el.classList.add('hidden');
  }

  paste(evt) {
    this.callback(
      Promise.resolve(evt)
        .then(x => {
          x.target.focus();
          return x;
        })
        .delay(50)
        .then(x => {
          x.target.select();
          return x;
        })
        .delay(50)
        .then(x => {
          return evt.target.value;
        })
        .delay(50)
        .tap(() => {
          this.hide();
        })
    );
  }

  keypress(evt) {
    // if (evt.keyCode === 0 && evt.charCode === 118 && evt.ctrlKey === true) {
    //   this.hide();
    //   setTimeout(() => {
    //     console.log(this.value);
    //   }, 5000);
    //   setTimeout(this.callback.bind(evt, evt.target.value), 500);
    // }
  }
}
