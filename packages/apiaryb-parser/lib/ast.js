const combineParts = (separator, builder) => {
  const parts = [];

  builder(parts);

  return parts.join(separator);
};

const escapeBody = (body) => {
  if (/^>\s+|^<\s+|^\s*$/m.test(body)) {
    if (/^>>>\s*$/m.test(body)) {
      if (/^EOT$/m.test(body)) {
        let i = 1;

        while (/^EOT#{i}$/m.test(body)) {
          i += 1;
        }

        return `<<<EOT${i}\n${body}\nEOT${i}`;
      }

      return `<<<EOT\n${body}\nEOT`;
    }

    return `<<<\n${body}\n>>>`;
  }

  return body;
};

// Represents a JSON schema validation.
class JsonSchemaValidation {
  static fromJSON(json) {
    return new (this)({
      method: json.method,
      url: json.url,
      body: json.body,
    });
  }

  constructor(props = {}) {
    this.method = props.method || 'GET';
    this.url = props.url || '/';
    this.body = props.body || null;
  }

  toJSON() {
    return {
      method: this.method,
      url: this.url,
      body: this.body,
    };
  }

  toBlueprint() {
    return combineParts('\n', (parts) => {
      parts.push(`${this.method} ${this.url}`);

      if (this.body) {
        parts.push(escapeBody(this.body));
      }
    });
  }
}

// Represents a request of a resource.
class Request {
  static fromJSON(json) {
    return new (this)({
      headers: json.headers,
      body: json.body,
    });
  }

  constructor(props = {}) {
    this.headers = props.headers || {};
    this.body = props.body || null;
  }

  toJSON() {
    return {
      headers: this.headers,
      body: this.body,
    };
  }

  toBlueprint() {
    return combineParts('\n', (parts) => {
      Object.entries(this.headers).forEach(([name, value]) => {
        parts.push(`> ${name}: ${value}`);
      });

      if (this.body) {
        parts.push(escapeBody(this.body));
      }
    });
  }
}

// Represents a response of a resource.
class Response {
  static fromJSON(json) {
    return new (this)({
      status: json.status,
      headers: json.headers,
      body: json.body,
    });
  }

  constructor(props = {}) {
    this.status = props.status || 200;
    this.headers = props.headers || {};
    this.body = props.body || null;
  }

  toJSON() {
    return {
      status: this.status,
      headers: this.headers,
      body: this.body,
    };
  }

  toBlueprint() {
    return combineParts('\n', (parts) => {
      parts.push(`< ${this.status}`);

      Object.entries(this.headers).forEach(([name, value]) => {
        parts.push(`< ${name}: ${value}`);
      });

      if (this.body) {
        parts.push(escapeBody(this.body));
      }
    });
  }
}

// Represents a resource of an Apiary blueprint.
class Resource {
  static fromJSON(json) {
    return new (this)({
      description: json.description,
      method: json.method,
      url: json.url,
      request: Request.fromJSON(json.request),
      responses: json.responses.map(r => Response.fromJSON(r)),
    });
  }

  constructor(props = {}) {
    this.description = props.description || null;
    this.method = props.method || 'GET';
    this.url = props.url || '/';
    this.request = props.request || new Request();
    this.responses = props.responses || [new Response()];
  }

  getUrlFragment() {
    return `${this.method.toLowerCase()}-${encodeURIComponent(this.url)}`;
  }

  toJSON() {
    return {
      description: this.description,
      method: this.method,
      url: this.url,
      request: this.request.toJSON(),
      responses: this.responses.map(r => r.toJSON()),
    };
  }

  toBlueprint() {
    return combineParts('\n', (parts) => {
      if (this.description) {
        parts.push(this.description);
      }

      parts.push(`${this.method} ${this.url}`);

      const requestBlueprint = this.request.toBlueprint();

      if (requestBlueprint !== '') {
        parts.push(requestBlueprint);
      }

      const responsesBlueprint = combineParts('\n+++++\n', (parts) => {
        this.responses.map(r => parts.push(r.toBlueprint()));
      });

      parts.push(responsesBlueprint);
    });
  }
}

// Represents a section of an Apiary blueprint.
class Section {
  static fromJSON(json) {
    return new (this)({
      name: json.name,
      description: json.description,
      resources: json.resources.map(r => Resource.fromJSON(r)),
    });
  }

  constructor(props = {}) {
    this.name = props.name || null;
    this.description = props.description || null;
    this.resources = props.resources || [];
  }

  toJSON() {
    return {
      name: this.name,
      description: this.description,
      resources: this.resources.map(r => r.toJSON()),
    };
  }

  toBlueprint() {
    return combineParts('\n', (parts) => {
      if (this.name) {
        if (this.description) {
          parts.push(`--\n${this.name}\n${this.description}\n--`);
        } else {
          parts.push(`-- ${this.name} --`);
        }
      }

      this.resources.map(r => parts.push(r.toBlueprint()));
    });
  }
}


// Represents an Apiary blueprint.
class Blueprint {
  static fromJSON(json) {
    return new (this)({
      location: json.location,
      name: json.name,
      description: json.description,
      sections: json.sections.map(s => Section.fromJSON(s)),
      validations: json.validations.map(v => JsonSchemaValidation.fromJSON(v)),
    });
  }

  constructor(props = {}) {
    this.location = props.location || null;
    this.name = props.name || null;
    this.description = props.description || null;
    this.sections = props.sections || [];
    this.validations = props.validations || [];
  }

  resources(opts) {
    const resources = [];

    this.sections.forEach((section) => {
      section.resources.forEach((r) => {
        if ((opts != null ? opts.method : undefined) && (opts.method !== r.method)) { return; }
        if ((opts != null ? opts.url : undefined) && (opts.url !== r.url)) { return; }
        resources.push(r);
      });
    });

    return resources;
  }

  toJSON() {
    return {
      location: this.location,
      name: this.name,
      description: this.description,
      sections: this.sections.map(s => s.toJSON()),
      validations: this.validations.map(v => v.toJSON()),
    };
  }

  toBlueprint() {
    return combineParts('\n', (parts) => {
      if (this.location) {
        parts.push(`HOST: ${this.location}`);
      }

      if (this.name) {
        parts.push(`--- ${this.name} ---`);
      }

      if (this.description) {
        parts.push(`---\n${this.description}\n---`);
      }

      this.sections.forEach(s => parts.push(s.toBlueprint()));

      if (this.validations.length > 0) {
        parts.push('-- JSON Schema Validations --');
      }

      this.validations.forEach(v => parts.push(v.toBlueprint()));
    });
  }
}

module.exports = {
  Blueprint,
  Section,
  Resource,
  Request,
  Response,
  JsonSchemaValidation,
};
