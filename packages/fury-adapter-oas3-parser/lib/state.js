class State {
  constructor() {
    this.registeredIds = new Set();

    this.registeredSchemes = new Set();
    this.oauthFlows = {};
  }

  registerId(id) {
    if (this.registeredIds.has(id)) {
      return false;
    }

    this.registeredIds.add(id);
    return true;
  }

  oauthFlow(id, flow) {
    this.oauthFlows[id] = this.oauthFlows[id] || new Set();
    this.oauthFlows[id].add(flow);

    return this.registerScheme(flow);
  }

  registerScheme(id) {
    if (this.registeredSchemes.has(id)) {
      return false;
    }

    this.registeredSchemes.add(id);
    return true;
  }

  hasScheme(id) {
    return this.registeredSchemes.has(id);
  }
}

module.exports = State;
