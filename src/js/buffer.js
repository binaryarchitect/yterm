module.exports = class Buffer {
  constructor() {
    this.buffer = [];
    this.cursor = 0;
  }

  write(data, replace = true) {
    const len = this.size();
    if (this.cursor !== len) {
      const input = data.split('');
      this.buffer.splice.apply(
        this.buffer,
        [this.cursor, replace ? input.length : 0].concat(input)
      );
      this.cursor += input.length;
    } else {
      this.buffer.push(data);
      this.cursor += data.length;
    }
  }

  move(amount) {
    const to = this.cursor + amount;
    const result = to >= 0 && to <= this.size() ? amount : 0;
    if (result !== 0) this.cursor = to;
    return result;
  }

  size() {
    return this.buffer.length;
  }

  back() {
    this.buffer.splice(this.cursor - 1, 1);
    this.cursor--;
  }

  get() {
    return this.buffer.join('');
  }

  flush() {
    this.buffer = [];
    this.cursor = 0;
  }
};
