'use strict';

export default class Conzole {
  constructor(active = true) {
    this.active = active;
    this.el = document.getElementById('conzole');
  }

  write(text) {
    if (!this.active) return;
    const line = document.createElement('div');
    line.classList.add('cline');
    line.innerText = text;
    this.el.appendChild(line);
  }
}
