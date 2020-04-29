const { Fury } = require('fury');
const { expect } = require('../../chai');

const parse = require('../../../../lib/parser/oas/parseInfoObject');
const Context = require('../../../../lib/context');

const { minim: namespace } = new Fury();

describe('#parseInfoObject', () => {
  let context;
  beforeEach(() => {
    context = new Context(namespace);
  });

  it('provides error when info is non-object', () => {
    const info = new namespace.elements.String();

    const parseResult = parse(context, info);

    expect(parseResult.length).to.equal(1);
    expect(parseResult).to.contain.error("'Info Object' is not an object");
  });

  describe('missing required properties', () => {
    it('provides error for missing title', () => {
      const info = new namespace.elements.Object({
        version: '1.0.0',
      });

      const parseResult = parse(context, info);

      expect(parseResult.length).to.equal(1);
      expect(parseResult).to.contain.error("'Info Object' is missing required property 'title'");
    });

    it('provides error for missing version', () => {
      const info = new namespace.elements.Object({
        title: 'My API',
      });

      const parseResult = parse(context, info);

      expect(parseResult.length).to.equal(1);
      expect(parseResult).to.contain.error("'Info Object' is missing required property 'version'");
    });
  });

  describe('required property type checking', () => {
    it('provides error when title is non-string', () => {
      const info = new namespace.elements.Object({
        title: 1,
        version: '1.0.0',
      });

      const parseResult = parse(context, info);

      expect(parseResult.length).to.equal(1);
      expect(parseResult).to.contain.error("'Info Object' 'title' is not a string");
    });

    it('provides error when version is non-string', () => {
      const info = new namespace.elements.Object({
        title: 'My API',
        version: 1,
      });

      const parseResult = parse(context, info);

      expect(parseResult.length).to.equal(1);
      expect(parseResult).to.contain.error("'Info Object' 'version' is not a string");
    });
  });

  describe('optional property type checking', () => {
    it('provides warning when description is non-string', () => {
      const info = new namespace.elements.Object({
        title: 'My API',
        version: '1.0.0',
        description: 1,
      });

      const parseResult = parse(context, info);
      expect(parseResult).to.contain.warning("'Info Object' 'description' is not a string");
    });
  });

  describe('warnings for unsupported properties', () => {
    it('does not provide warning for Info Object extensions', () => {
      const object = new namespace.elements.Object({
        title: 'My API',
        version: '1.0.0',
        'x-extension': {},
      });

      const parseResult = parse(context, object);

      expect(parseResult).to.not.contain.annotations;
    });

    it('provides warning for invalid keys', () => {
      const object = new namespace.elements.Object({
        title: 'My API',
        version: '1.0.0',
        invalid: {},
      });

      const parseResult = parse(context, object);

      expect(parseResult).to.contain.warning("'Info Object' contains invalid key 'invalid'");
    });
  });

  it('provides api category with title and version', () => {
    const info = new namespace.elements.Object({
      title: 'My API',
      version: '1.0.0',
    });

    const parseResult = parse(context, info);
    expect(parseResult.length).to.equal(1);
    expect(parseResult.api.classes.toValue()).to.deep.equal(['api']);
    expect(parseResult.api.title.toValue()).to.equal('My API');
    expect(parseResult.api.attributes.get('version').toValue()).to.equal('1.0.0');
  });

  it('provides api category with description', () => {
    const info = new namespace.elements.Object({
      title: 'My API',
      version: '1.0.0',
      description: 'My API Description',
    });

    const parseResult = parse(context, info);
    expect(parseResult.length).to.equal(1);
    expect(parseResult.api.copy.toValue()).to.deep.equal(['My API Description']);
  });

  it('provides api category with license', () => {
    const info = new namespace.elements.Object({
      title: 'My API',
      version: '1.0.0',
      license: {
        name: 'Apache 2.0',
        url: 'https://www.apache.org/licenses/LICENSE-2.0.html',
      },
    });

    const parseResult = parse(context, info);
    expect(parseResult.length).to.equal(1);

    const license = parseResult.api.links.get(0);
    expect(license.relation.toValue()).to.equal('license');
    expect(license.href.toValue()).to.equal('https://www.apache.org/licenses/LICENSE-2.0.html');
  });

  describe('#termsOfService', () => {
    it('provides a warning when termsOfService is not a string', () => {
      const info = new namespace.elements.Object({
        title: 'My API',
        version: '1.0.0',
        termsOfService: 6,
      });

      const parseResult = parse(context, info);
      expect(parseResult).to.contain.warning("'Info Object' 'termsOfService' is not a string");
    });

    it('provides api category with termsOfService', () => {
      const info = new namespace.elements.Object({
        title: 'My API',
        version: '1.0.0',
        termsOfService: 'http://example.com/terms/',
      });

      const parseResult = parse(context, info);
      expect(parseResult.length).to.equal(1);

      const termsOfService = parseResult.api.links.get(0);
      expect(termsOfService.relation.toValue()).to.equal('terms-of-service');
      expect(termsOfService.href.toValue()).to.equal('http://example.com/terms/');
    });
  });

  describe('#contact', () => {
    it('provides a warning when contact is not an object', () => {
      const info = new namespace.elements.Object({
        title: 'My API',
        version: '1.0.0',
        contact: 6,
      });

      const parseResult = parse(context, info);
      expect(parseResult).to.contain.warning("'Contact Object' is not an object");
    });

    it('provides api category only with contact name', () => {
      const info = new namespace.elements.Object({
        title: 'My API',
        version: '1.0.0',
        contact: {
          name: 'API Support',
        },
      });

      const parseResult = parse(context, info);
      const parsedLinks = parseResult.api.links;
      expect(parsedLinks.length).to.equal(0);
    });

    it('provides api category with contact URL', () => {
      const info = new namespace.elements.Object({
        title: 'My API',
        version: '1.0.0',
        contact: {
          name: 'API Support',
          url: 'http://example.com/support/',
        },
      });

      const parseResult = parse(context, info);
      expect(parseResult.length).to.equal(1);

      const contact = parseResult.api.links.get(0);
      expect(contact.relation.toValue()).to.equal('contact');
      expect(contact.href.toValue()).to.equal('http://example.com/support/');
    });

    it('provides api category with contact email', () => {
      const info = new namespace.elements.Object({
        title: 'My API',
        version: '1.0.0',
        contact: {
          name: 'API Support',
          email: 'support@example.com',
        },
      });

      const parseResult = parse(context, info);
      expect(parseResult.length).to.equal(1);

      const contact = parseResult.api.links.get(0);
      expect(contact.relation.toValue()).to.equal('contact');
      expect(contact.meta.toValue().title).to.equal('API Support');
      expect(contact.href.toValue()).to.equal('mailto:support@example.com');
    });

    it('provides api category with contact URL and email', () => {
      const info = new namespace.elements.Object({
        title: 'My API',
        version: '1.0.0',
        contact: {
          url: 'http://example.com/support/',
          email: 'support@example.com',
        },
      });

      const parseResult = parse(context, info);
      expect(parseResult.length).to.equal(1);

      const contactUrl = parseResult.api.links.get(0);
      expect(contactUrl.relation.toValue()).to.equal('contact');
      expect(contactUrl.href.toValue()).to.equal('http://example.com/support/');

      const contactEmail = parseResult.api.links.get(1);
      expect(contactEmail.relation.toValue()).to.equal('contact');
      expect(contactEmail.href.toValue()).to.equal('mailto:support@example.com');
    });

    it('provides api category with contact name and URL', () => {
      const info = new namespace.elements.Object({
        title: 'My API',
        version: '1.0.0',
        contact: {
          name: 'API Support',
          url: 'http://example.com/support/',
          email: 'support@example.com',
        },
      });

      const parseResult = parse(context, info);
      expect(parseResult.length).to.equal(1);

      const contact = parseResult.api.links.get(0);
      expect(contact.relation.toValue()).to.equal('contact');
      expect(contact.meta.toValue().title).to.equal('API Support');
      expect(contact.href.toValue()).to.equal('http://example.com/support/');
    });
  });
});
