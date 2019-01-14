class State {
  constructor() {
    this.registeredIds = new Set();
  }

  registerId(id) {
    return this.registeredIds.add(id);
  }
}

module.exports = State;
