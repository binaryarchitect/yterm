import _ from 'lodash';
import Colors from './colors';

class Memory {
  constructor() {
    this._memory = {};
  }

  keys() {
    return _.keys(this._memory);
  }

  set(key, value) {
    this._memory[key] = value;
    return this;
  }

  get(key) {
    if (key === '__keys__') {
      return this.keys();
    } else return this._memory[key];
  }
}

function newMemoryProxy() {
  return new Proxy(new Memory(), {
    get(target, name, receiver) {
      return target.get(name);
    },
    set(target, name, value) {
      target.set(name, value);
      return this;
    }
  });
}

export default class Exec {
  constructor(sys) {
    this.mem = newMemoryProxy();
    this.sys = sys;

    this.sys.network.callback = this.callback.bind(this);
    this.sys.network.generator = this.generator.bind(this);

    this.mem.requests = [];
  }

  try(code) {
    const payload = {
      mem: this.mem,
      sys: this.sys,
      _,
      colors: Colors,
      exec: this
    };
    return Function(`return ( ({${_.keys(payload).join(',')}}) => { return (${code}) } );`)()(
      payload
    );
  }

  remote(q, p = {}) {
    this.mem.requests.push({ q, p });
  }

  callback({ agents, responses, env } = {}) {
    this.mem.agents = agents;
    this.mem.env = env;
    this.mem.last_callback = new Date().getTime();
    this.mem.requests = this.mem.requests.concat(
      _.filter(_.map(responses, this.try.bind(this)), !_.isNil)
    );
  }

  // TODO: limit request count by size
  generator() {
    const result = JSON.stringify({
      q: 'poll',
      r: this.mem.requests || []
    });
    this.mem.requests = [];
    return result;
  }
}
