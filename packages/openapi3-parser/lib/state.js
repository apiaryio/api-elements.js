class State {
  constructor() {
    this.registeredIds = new Set();

    this.registeredSchemes = new Set();
    this.oauthFlows = {};

    this.warnings = {}; // {string: Annotation}
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

  hasWarning(message) {
    const annotation = this.warnings[message];

    if (annotation !== undefined) {
      annotation.count += 1;
      return true;
    }

    return false;
  }

  registerWarning(annotation) {
    // eslint-disable-next-line no-param-reassign
    annotation.count = 1;
    this.warnings[annotation.content] = annotation;
  }
}

module.exports = State;
