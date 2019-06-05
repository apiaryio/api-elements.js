const url = require('url');
const ApiaryBlueprintParser = require('apiary-blueprint-parser');

class Parser {
  constructor({ namespace, source }) {
    this.namespace = namespace;
    this.source = source;
  }

  parse() {
    const {
      Annotation, Category, Copy, ParseResult,
    } = this.namespace.elements;

    this.result = new ParseResult();

    try {
      this.blueprint = ApiaryBlueprintParser.parse(this.source);
    } catch (err) {
      const annotation = new Annotation(err.message);
      annotation.classes.push('error');
      this.result.push(annotation);

      if (err.offset) {
        const { SourceMap } = this.namespace.elements;
        annotation.attributes.set('sourceMap', [
          new SourceMap([[err.offset, 1]]),
        ]);
      }

      return this.result;
    }

    this.api = new Category();
    this.api.classes.push('api');
    this.api.title = this.blueprint.name;

    if (this.blueprint.location) {
      const { Member: MemberElement } = this.namespace.elements;
      const member = new MemberElement('HOST', this.blueprint.location);
      member.meta.set('classes', ['user']);
      this.api.attributes.set('metadata', [member]);
    }

    if (this.blueprint.description) {
      const description = new Copy(this.blueprint.description);
      this.api.push(description);
    }

    this.blueprint.sections.forEach((section) => {
      const group = this.handleSection(section);
      this.api.content.push(group);
    });

    this.result.push(this.api);
    return this.result;
  }

  // Parses a URL from the Apiary Blueprint AST
  // Depending on the contents of the blueprint location it may need removing paths
  parseURL(path) {
    if (this.blueprint.location) {
      const host = url.parse(this.blueprint.location);

      if (host.path && host.path !== '/' && path.startsWith(host.path)) {
        const newPath = path.slice(host.path.length);

        if (!newPath.startsWith('/')) {
          return `/${newPath}`;
        }

        return newPath;
      }
    }

    return path;
  }

  handleSection(section) {
    // A "resource" in Apiary blueprint isn't the same as a "resource" in API
    // Elements. It maps closer to an "action".

    const { Copy, Category, Resource } = this.namespace.elements;

    const group = new Category();
    group.title = section.name;
    group.classes.push('resourceGroup');

    if (section.description) {
      group.content.push(new Copy(section.description));
    }

    if (section.resources.length > 0) {
      // A section in Apiary Blueprint actually contains "actions" not "resources"
      // We will use the first "resource" (actually "action") for the name.

      const resource = new Resource();
      resource.href = this.parseURL(section.resources[0].url);

      section.resources.forEach((action) => {
        const transition = this.handleResource(action);

        if (action.url !== resource.href) {
          transition.href = this.parseURL(action.url);
        }

        resource.push(transition);
      });

      group.push(resource);
    }

    return group;
  }

  handleResource(resource) {
    const { Copy, Transition, HttpTransaction } = this.namespace.elements;
    const transition = new Transition();
    transition.title = resource.method;

    const schema = this.retrieveSchema(resource.method, this.parseURL(resource.url));

    if (resource.description) {
      transition.push(new Copy(resource.description));
    }

    const request = this.handleRequest(resource, resource.request, schema.request);

    resource.responses.forEach((response) => {
      const transaction = new HttpTransaction();
      transaction.push(request);
      transaction.push(this.handleResponse(response, schema.response));
      transition.push(transaction);
    });

    return transition;
  }

  handleRequest(resource, request, schema) {
    const { Asset, HttpRequest } = this.namespace.elements;
    const httpRequest = new HttpRequest();
    httpRequest.method = resource.method;
    const headers = this.handleHeaders(request.headers);
    if (headers) {
      httpRequest.headers = headers;
    }

    if (request.body) {
      const bodyAsset = new Asset(request.body);
      bodyAsset.classes.push('messageBody');
      httpRequest.push(bodyAsset);

      if (schema) {
        httpRequest.push(this.handleSchema(schema));
      }
    }

    return httpRequest;
  }

  handleResponse(response, schema) {
    const { Asset, HttpResponse } = this.namespace.elements;
    const httpResponse = new HttpResponse();

    httpResponse.statusCode = response.status;
    const headers = this.handleHeaders(response.headers);
    if (headers) {
      httpResponse.headers = headers;
    }

    if (response.body) {
      const bodyAsset = new Asset(response.body);
      bodyAsset.classes.push('messageBody');
      httpResponse.push(bodyAsset);

      if (schema) {
        httpResponse.push(this.handleSchema(schema));
      }
    }

    return httpResponse;
  }

  handleHeaders(headers) {
    if (Object.keys(headers).length === 0) {
      return null;
    }

    const { HttpHeaders } = this.namespace.elements;
    const { Member: MemberElement } = this.namespace.elements;

    const httpHeaders = new HttpHeaders();

    Object.keys(headers).forEach((header) => {
      httpHeaders.push(new MemberElement(header, headers[header]));
    });

    return httpHeaders;
  }

  // Create schema asset
  handleSchema(body) {
    const { Asset } = this.namespace.elements;
    const asset = new Asset(body);
    asset.classes.push('messageBodySchema');
    asset.contentType = 'application/schema+json';
    return asset;
  }

  // Search for a schema by method and path in the blueprints validations
  retrieveSchema(method, path) {
    const schema = { request: null, response: null };

    this.blueprint.validations.forEach((validation) => {
      if (validation.method === method && validation.url === path) {
        let validationSchema;

        try {
          validationSchema = JSON.parse(validation.body);
        } catch (error) {
          // Handle the invalid schema for schema.request
        }

        if (validationSchema && validationSchema.request) {
          schema.request = JSON.stringify(validationSchema.request, null, 2);
        }

        if (validationSchema && validationSchema.response) {
          schema.response = JSON.stringify(validationSchema.response, null, 2);
        }

        if (schema.request === null && schema.response === null) {
          schema.request = validation.body;
        }
      }
    });

    return schema;
  }
}

module.exports = Parser;
