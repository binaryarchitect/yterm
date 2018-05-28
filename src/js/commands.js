class Commands {
  constructor(request, response) {
    this.request = request || (() => {});
    this.response = response || (() => {});
  }

  run(code) {
    this.response(this.request(code));
  }
}

export default Commands;
