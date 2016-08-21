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
    this.result.push(this.api);

    this.api.title = this.blueprint.name;

    if (this.blueprint.location) {
      const {Member: MemberElement} = this.minim.elements;
      const member = new MemberElement('HOST', this.blueprint.location);
      member.meta.set('classes', ['user']);
      this.api.attributes.set('meta', [member]);
    }

    if (this.blueprint.description) {
      const description = new Copy(this.blueprint.description);
      this.api.content.push(description);
    }

    // TODO: Sections
    // TODO: Validators

    return done(null, this.result);
  }
}
