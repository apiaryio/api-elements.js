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

    const blueprint = ApiaryBlueprintParser.parse(this.source);

    this.api = new Category();
    this.api.classes.push('api');
    this.result.push(this.api);

    this.api.title = blueprint.name;

    if (blueprint.location) {
      const {Member: MemberElement} = this.minim.elements;
      const member = new MemberElement('HOST', blueprint.location);
      member.meta.set('classes', ['user']);
      this.api.attributes.set('meta', [member]);
    }

    if (blueprint.description) {
      const description = new Copy(blueprint.description);
      this.api.content.push(description);
    }

    // TODO: Sections
    // TODO: Validators

    return done(null, this.result);
  }
}
