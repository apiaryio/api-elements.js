import ApiaryBlueprintParser from 'apiary-blueprint-parser';

export default class Parser {
  constructor({minim, source}) {
    this.minim = minim;
    this.source = source;
  }

  parse(done) {
    const {
      Category, Copy, ParseResult,
    } = this.minim.elements;

    this.result = new ParseResult();

    try {
      this.blueprint = ApiaryBlueprintParser.parse(this.source);
    } catch (err) {
      const {Annotation} = this.minim.elements;
      const annotation = new Annotation(err.message);
      annotation.classes.push('error');
      this.result.push(annotation);

      return done(err, this.result);
    }

    this.api = new Category();
    this.api.classes.push('api');
    this.api.title = this.blueprint.name;

    if (this.blueprint.location) {
      const {Member: MemberElement} = this.minim.elements;
      const member = new MemberElement('HOST', this.blueprint.location);
      member.meta.set('classes', ['user']);
      this.api.attributes.set('meta', [member]);
    }

    if (this.blueprint.description) {
      const description = new Copy(this.blueprint.description);
      this.api.push(description);
    }

    for (const section of this.blueprint.sections) {
      const group = this.handleSection(section);
      this.api.content.push(group);
    }

    // TODO: Validators

    this.result.push(this.api);
    return done(null, this.result);
  }

  handleSection(section) {
    // A "resource" in Apiary blueprint isn't the same as a "resource" in API
    // Elements. It maps closer to an "action".

    const {Copy, Category, Resource} = this.minim.elements;

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
      resource.href = section.resources[0].url;

      for (const action of section.resources) {
        const transition = this.handleResource(action);

        if (action.url !== section.resources[0].url) {
          transition.href = action.url;
        }

        resource.push(transition);
      }

      group.push(resource);
    }

    return group;
  }

  handleResource(resource) {
    const {Copy, Transition, HttpTransaction} = this.minim.elements;
    const transition = new Transition();
    transition.title = resource.method;

    if (resource.description) {
      transition.push(new Copy(resource.description));
    }

    const request = this.handleRequest(resource, resource.request);
    for (const response of resource.responses) {
      const transaction = new HttpTransaction();
      transaction.push(request);
      transaction.push(this.handleResponse(response));
      transition.push(transaction);
    }

    return transition;
  }

  handleRequest(resource, request) {
    const {Asset, HttpRequest} = this.minim.elements;
    const httpRequest = new HttpRequest();
    httpRequest.method = resource.method;
    httpRequest.headers = this.handleHeaders(request.headers);

    if (request.body) {
      const bodyAsset = new Asset(request.body);
      bodyAsset.classes.push('messageBody');
      httpRequest.push(bodyAsset);
    }

    return httpRequest;
  }

  handleResponse(response) {
    const {Asset, HttpResponse} = this.minim.elements;
    const httpResponse = new HttpResponse();
    httpResponse.statusCode = response.status;
    httpResponse.headers = this.handleHeaders(response.headers);

    if (response.body) {
      const bodyAsset = new Asset(response.body);
      bodyAsset.classes.push('messageBody');
      httpResponse.push(bodyAsset);
    }

    return httpResponse;
  }

  handleHeaders(headers) {
    if (Object.keys(headers).length === 0) {
      return null;
    }

    const {HttpHeaders} = this.minim.elements;
    const {Member: MemberElement} = this.minim.elements;

    const httpHeaders = new HttpHeaders();

    for (const header of Object.keys(headers)) {
      httpHeaders.push(new MemberElement(header, headers[header]));
    }

    return httpHeaders;
  }
}
