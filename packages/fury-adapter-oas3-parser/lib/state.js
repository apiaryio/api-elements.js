class State {
  constructor() {
    this.registeredIds = new Set();
  }

  registerId(id) {
    if (this.registeredIds.has(id)) {
      return false;
    }

    this.registeredIds.add(id);
    return true;
  }
}

module.exports = State;
