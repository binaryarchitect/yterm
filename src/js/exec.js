import _ from 'lodash';
import Colors from './colors';

class Memory {
  constructor() {
    this._memory = {};
  }

  get keys() {
    return _.keys(this._memory);
  }

  set(key, value) {
    this._memory[key] = value;
    return this;
  }

  get(key) {
    return this._memory[key];
  }
}

export default class Exec {
  constructor(sys) {
    this.mem = new Memory();
    this.sys = sys;
  }

  try(code) {
    const payload = {
      mem: this.mem,
      sys: this.sys,
      _,
      colors: Colors
    };
    return Function(`return ( ({${_.keys(payload).join(',')}}) => { return (${code}) } );`)()(
      payload
    );
  }
}
