const { Fury } = require('fury');
const { expect } = require('../chai');

const Context = require('../../../lib/context');

const parseYAML = require('../../../lib/parser/parseYAML');

const { minim: namespace } = new Fury();

describe('#parseYAML', () => {
  let context;
  beforeEach(() => {
    context = new Context(namespace, { generateSourceMap: true });
  });

  it('fails to parse an OAS3 document with invalid YAML', () => {
    const parseResult = parseYAML('{}{}', context);

    expect(parseResult).to.be.instanceof(namespace.elements.ParseResult);
    expect(parseResult.errors.length).to.equal(1);

    expect(parseResult).contain.error("YAML Syntax: expected '<document start>', but found {").with.sourceMap([[2, 0]]);
  });

  it('can parse a string into a string element', () => {
    const element = parseYAML('hello', context);

    expect(element).to.be.instanceof(namespace.elements.ParseResult);
    expect(element.length).to.equal(1);

    expect(element.first).to.be.instanceof(namespace.elements.String);
    expect(element.first.toValue()).to.equal('hello');
    expect(element.first).to.have.sourceMapStart(0);
    expect(element.first).to.have.sourceMapOffset(5);
    expect(element.first).to.have.sourceMapStartLine(1);
    expect(element.first).to.have.sourceMapStartColumn(1);
    expect(element.first).to.have.sourceMapEndLine(1);
    expect(element.first).to.have.sourceMapEndColumn(6);
  });

  it('can parse an integer into a number element', () => {
    const element = parseYAML('1', context);

    expect(element).to.be.instanceof(namespace.elements.ParseResult);
    expect(element.length).to.equal(1);

    expect(element.first).to.be.instanceof(namespace.elements.Number);
    expect(element.first.toValue()).to.deep.equal(1);
    expect(element.first).to.have.sourceMapStart(0);
    expect(element.first).to.have.sourceMapOffset(1);
    expect(element.first).to.have.sourceMapStartLine(1);
    expect(element.first).to.have.sourceMapStartColumn(1);
    expect(element.first).to.have.sourceMapEndLine(1);
    expect(element.first).to.have.sourceMapEndColumn(2);
  });

  it('can parse an decimal into a number element', () => {
    const element = parseYAML('1.5', context);

    expect(element).to.be.instanceof(namespace.elements.ParseResult);
    expect(element.length).to.equal(1);

    expect(element.first).to.be.instanceof(namespace.elements.Number);
    expect(element.first.toValue()).to.deep.equal(1.5);
    expect(element.first).to.have.sourceMapStart(0);
    expect(element.first).to.have.sourceMapOffset(3);
    expect(element.first).to.have.sourceMapStartLine(1);
    expect(element.first).to.have.sourceMapStartColumn(1);
    expect(element.first).to.have.sourceMapEndLine(1);
    expect(element.first).to.have.sourceMapEndColumn(4);
  });

  it('can parse an boolean value into a boolean element', () => {
    const element = parseYAML('yes', context);

    expect(element).to.be.instanceof(namespace.elements.ParseResult);
    expect(element.length).to.equal(1);

    expect(element.first).to.be.instanceof(namespace.elements.Boolean);
    expect(element.first.toValue()).to.deep.equal(true);
    expect(element.first).to.have.sourceMapStart(0);
    expect(element.first).to.have.sourceMapOffset(3);
    expect(element.first).to.have.sourceMapStartLine(1);
    expect(element.first).to.have.sourceMapStartColumn(1);
    expect(element.first).to.have.sourceMapEndLine(1);
    expect(element.first).to.have.sourceMapEndColumn(4);
  });

  it('can parse null into a null element', () => {
    const element = parseYAML('null', context);

    expect(element).to.be.instanceof(namespace.elements.ParseResult);
    expect(element.length).to.equal(1);

    expect(element.first).to.be.instanceof(namespace.elements.Null);
    expect(element.first).to.have.sourceMapStart(0);
    expect(element.first).to.have.sourceMapOffset(4);
    expect(element.first).to.have.sourceMapStartLine(1);
    expect(element.first).to.have.sourceMapStartColumn(1);
    expect(element.first).to.have.sourceMapEndLine(1);
    expect(element.first).to.have.sourceMapEndColumn(5);
  });

  it('can parse an array into an array element', () => {
    const element = parseYAML('["hello"]', context);

    expect(element).to.be.instanceof(namespace.elements.ParseResult);
    expect(element.length).to.equal(1);

    const array = element.first;

    expect(array).to.be.instanceof(namespace.elements.Array);
    expect(array.toValue()).to.deep.equal(['hello']);
    expect(array).to.have.sourceMapStart(0);
    expect(array).to.have.sourceMapOffset(9);
    expect(array).to.have.sourceMapStartLine(1);
    expect(array).to.have.sourceMapStartColumn(1);
    expect(array).to.have.sourceMapEndLine(1);
    expect(array).to.have.sourceMapEndColumn(10);

    expect(array.first).to.be.instanceof(namespace.elements.String);
    expect(array.first.toValue()).to.deep.equal('hello');
    expect(array.first).to.have.sourceMapStart(1);
    expect(array.first).to.have.sourceMapOffset(7);
    expect(array.first).to.have.sourceMapStartLine(1);
    expect(array.first).to.have.sourceMapStartColumn(2);
    expect(array.first).to.have.sourceMapEndLine(1);
    expect(array.first).to.have.sourceMapEndColumn(9);
  });

  describe('map', () => {
    it('can parse a dictionary into an object element', () => {
      const element = parseYAML('key: value', context);

      expect(element).to.be.instanceof(namespace.elements.ParseResult);
      expect(element.length).to.equal(1);

      const object = element.first;

      expect(object).to.be.instanceof(namespace.elements.Object);
      expect(object.toValue()).to.deep.equal({ key: 'value' });
      expect(object).to.have.sourceMapStart(0);
      expect(object).to.have.sourceMapOffset(10);
      expect(object).to.have.sourceMapStartLine(1);
      expect(object).to.have.sourceMapStartColumn(1);
      expect(object).to.have.sourceMapEndLine(1);
      expect(object).to.have.sourceMapEndColumn(11);

      const member = object.first;

      expect(member).to.be.instanceof(namespace.elements.Member);

      expect(member.key).to.be.instanceof(namespace.elements.String);
      expect(member.key.toValue()).to.equal('key');
      expect(member.key).to.have.sourceMapStart(0);
      expect(member.key).to.have.sourceMapOffset(3);
      expect(member.key).to.have.sourceMapStartLine(1);
      expect(member.key).to.have.sourceMapStartColumn(1);
      expect(member.key).to.have.sourceMapEndLine(1);
      expect(member.key).to.have.sourceMapEndColumn(4);

      expect(member.value).to.be.instanceof(namespace.elements.String);
      expect(member.value.toValue()).to.equal('value');
      expect(member.value).to.have.sourceMapStart(5);
      expect(member.value).to.have.sourceMapOffset(5);
      expect(member.value).to.have.sourceMapStartLine(1);
      expect(member.value).to.have.sourceMapStartColumn(6);
      expect(member.value).to.have.sourceMapEndLine(1);
      expect(member.value).to.have.sourceMapEndColumn(11);
    });

    it('can parse an map into an object element', () => {
      const parseResult = parseYAML('!!map\n  key : value', context);

      expect(parseResult).to.be.instanceof(namespace.elements.ParseResult);
      expect(parseResult.length).to.equal(1);

      const object = parseResult.first;

      expect(object).to.be.instanceof(namespace.elements.Object);
      expect(object.toValue()).to.deep.equal({ key: 'value' });
      expect(object).to.have.sourceMapStart(0);
      expect(object).to.have.sourceMapOffset(19);
      expect(object).to.have.sourceMapStartLine(1);
      expect(object).to.have.sourceMapStartColumn(1);
      expect(object).to.have.sourceMapEndLine(2);
      expect(object).to.have.sourceMapEndColumn(14);

      const member = object.first;

      expect(member).to.be.instanceof(namespace.elements.Member);

      expect(member.key).to.be.instanceof(namespace.elements.String);
      expect(member.key.toValue()).to.equal('key');
      expect(member.key).to.have.sourceMapStart(8);
      expect(member.key).to.have.sourceMapOffset(3);
      expect(member.key).to.have.sourceMapStartLine(2);
      expect(member.key).to.have.sourceMapStartColumn(3);
      expect(member.key).to.have.sourceMapEndLine(2);
      expect(member.key).to.have.sourceMapEndColumn(6);

      expect(member.value).to.be.instanceof(namespace.elements.String);
      expect(member.value.toValue()).to.equal('value');
      expect(member.value).to.have.sourceMapStart(14);
      expect(member.value).to.have.sourceMapOffset(5);
      expect(member.value).to.have.sourceMapStartLine(2);
      expect(member.value).to.have.sourceMapStartColumn(9);
      expect(member.value).to.have.sourceMapEndLine(2);
      expect(member.value).to.have.sourceMapEndColumn(14);
    });

    it('can parse an empty map into an object element', () => {
      const parseResult = parseYAML('!!map', context);

      expect(parseResult).to.be.instanceof(namespace.elements.ParseResult);
      expect(parseResult.length).to.equal(1);

      const object = parseResult.first;

      expect(object).to.be.instanceof(namespace.elements.Object);
      expect(object.length).to.equal(0);
      expect(object).to.have.sourceMapStart(0);
      expect(object).to.have.sourceMapOffset(5);
      expect(object).to.have.sourceMapStartLine(1);
      expect(object).to.have.sourceMapStartColumn(1);
      expect(object).to.have.sourceMapEndLine(1);
      expect(object).to.have.sourceMapEndColumn(6);
    });
  });

  it('can parse a binary into a string element', () => {
    const element = parseYAML('!!binary "NDIK"', context);

    expect(element).to.be.instanceof(namespace.elements.ParseResult);
    expect(element.length).to.equal(2);

    expect(element.first).to.be.instanceof(namespace.elements.String);
    expect(element.first.toValue()).to.equal('NDIK');
    expect(element.first).to.have.sourceMapStart(0);
    expect(element.first).to.have.sourceMapOffset(15);
    expect(element.first).to.have.sourceMapStartLine(1);
    expect(element.first).to.have.sourceMapStartColumn(1);
    expect(element.first).to.have.sourceMapEndLine(1);
    expect(element.first).to.have.sourceMapEndColumn(16);

    expect(element.second).to.be.instanceof(namespace.elements.Annotation);
    expect(element.second.toValue()).to.equal('Interpreting YAML !!binary as string');
    expect(element.second).to.have.sourceMapStart(0);
    expect(element.second).to.have.sourceMapOffset(15);
    expect(element.second).to.have.sourceMapStartLine(1);
    expect(element.second).to.have.sourceMapStartColumn(1);
    expect(element.second).to.have.sourceMapEndLine(1);
    expect(element.second).to.have.sourceMapEndColumn(16);
  });

  it('can parse a timestamp into a string element', () => {
    const element = parseYAML('1991-09-14 3:00:00.00 +2', context);

    expect(element).to.be.instanceof(namespace.elements.ParseResult);
    expect(element.length).to.equal(2);

    expect(element.first).to.be.instanceof(namespace.elements.String);
    expect(element.first.toValue()).to.equal('1991-09-14 3:00:00.00 +2');
    expect(element.first).to.have.sourceMapStart(0);
    expect(element.first).to.have.sourceMapOffset(24);
    expect(element.first).to.have.sourceMapStartLine(1);
    expect(element.first).to.have.sourceMapStartColumn(1);
    expect(element.first).to.have.sourceMapEndLine(1);
    expect(element.first).to.have.sourceMapEndColumn(25);

    expect(element.second).to.be.instanceof(namespace.elements.Annotation);
    expect(element.second.toValue()).to.equal('Interpreting YAML !!timestamp as string');
    expect(element.second).to.have.sourceMapStart(0);
    expect(element.second).to.have.sourceMapOffset(24);
    expect(element.second).to.have.sourceMapStartLine(1);
    expect(element.second).to.have.sourceMapStartColumn(1);
    expect(element.second).to.have.sourceMapEndLine(1);
    expect(element.second).to.have.sourceMapEndColumn(25);
  });

  it('can parse an omap into an object element', () => {
    const element = parseYAML('!!omap\n  key: value', context);

    expect(element).to.be.instanceof(namespace.elements.ParseResult);
    expect(element.length).to.equal(2);

    const object = element.first;

    expect(object).to.be.instanceof(namespace.elements.Object);
    expect(object.toValue()).to.deep.equal({ key: 'value' });
    expect(object).to.have.sourceMapStart(0);
    expect(object).to.have.sourceMapOffset(19);
    expect(object).to.have.sourceMapStartLine(1);
    expect(object).to.have.sourceMapStartColumn(1);
    expect(object).to.have.sourceMapEndLine(2);
    expect(object).to.have.sourceMapEndColumn(13);

    const member = object.first;

    expect(member).to.be.instanceof(namespace.elements.Member);

    expect(member.key).to.be.instanceof(namespace.elements.String);
    expect(member.key.toValue()).to.equal('key');
    expect(member.key).to.have.sourceMapStart(9);
    expect(member.key).to.have.sourceMapOffset(3);
    expect(member.key).to.have.sourceMapStartLine(2);
    expect(member.key).to.have.sourceMapStartColumn(3);
    expect(member.key).to.have.sourceMapEndLine(2);
    expect(member.key).to.have.sourceMapEndColumn(6);

    expect(member.value).to.be.instanceof(namespace.elements.String);
    expect(member.value.toValue()).to.equal('value');
    expect(member.value).to.have.sourceMapStart(14);
    expect(member.value).to.have.sourceMapOffset(5);
    expect(member.value).to.have.sourceMapStartLine(2);
    expect(member.value).to.have.sourceMapStartColumn(8);
    expect(member.value).to.have.sourceMapEndLine(2);
    expect(member.value).to.have.sourceMapEndColumn(13);

    const warning = element.second;
    expect(warning).to.be.instanceof(namespace.elements.Annotation);
    expect(warning.toValue()).to.equal('Interpreting YAML !!omap as object');
    expect(warning).to.have.sourceMapStart(0);
    expect(warning).to.have.sourceMapOffset(19);
    expect(warning).to.have.sourceMapStartLine(1);
    expect(warning).to.have.sourceMapStartColumn(1);
    expect(warning).to.have.sourceMapEndLine(2);
    expect(warning).to.have.sourceMapEndColumn(13);
  });

  it('can parse a pairs into an object element', () => {
    const element = parseYAML('!!pairs\n  key: value', context);

    expect(element).to.be.instanceof(namespace.elements.ParseResult);
    expect(element.length).to.equal(2);

    const object = element.first;

    expect(object).to.be.instanceof(namespace.elements.Object);
    expect(object.toValue()).to.deep.equal({ key: 'value' });
    expect(object).to.have.sourceMapStart(0);
    expect(object).to.have.sourceMapOffset(20);
    expect(object).to.have.sourceMapStartLine(1);
    expect(object).to.have.sourceMapStartColumn(1);
    expect(object).to.have.sourceMapEndLine(2);
    expect(object).to.have.sourceMapEndColumn(13);

    const member = object.first;

    expect(member).to.be.instanceof(namespace.elements.Member);

    expect(member.key).to.be.instanceof(namespace.elements.String);
    expect(member.key.toValue()).to.equal('key');
    expect(member.key).to.have.sourceMapStart(10);
    expect(member.key).to.have.sourceMapOffset(3);
    expect(member.key).to.have.sourceMapStartLine(2);
    expect(member.key).to.have.sourceMapStartColumn(3);
    expect(member.key).to.have.sourceMapEndLine(2);
    expect(member.key).to.have.sourceMapEndColumn(6);

    expect(member.value).to.be.instanceof(namespace.elements.String);
    expect(member.value.toValue()).to.equal('value');
    expect(member.value).to.have.sourceMapStart(15);
    expect(member.value).to.have.sourceMapOffset(5);
    expect(member.value).to.have.sourceMapStartLine(2);
    expect(member.value).to.have.sourceMapStartColumn(8);
    expect(member.value).to.have.sourceMapEndLine(2);
    expect(member.value).to.have.sourceMapEndColumn(13);

    const warning = element.second;
    expect(warning).to.be.instanceof(namespace.elements.Annotation);
    expect(warning.toValue()).to.equal('Interpreting YAML !!pairs as object');
    expect(warning).to.have.sourceMapStart(0);
    expect(warning).to.have.sourceMapOffset(20);
    expect(warning).to.have.sourceMapStartLine(1);
    expect(warning).to.have.sourceMapStartColumn(1);
    expect(warning).to.have.sourceMapEndLine(2);
    expect(warning).to.have.sourceMapEndColumn(13);
  });

  describe('set', () => {
    it('can parse a set into an array element', () => {
      const element = parseYAML('!!set\n  - one\n  - two', context);

      expect(element).to.be.instanceof(namespace.elements.ParseResult);
      expect(element.length).to.equal(2);

      const arry = element.first;

      expect(arry).to.be.instanceof(namespace.elements.Array);
      expect(arry.toValue()).to.deep.equal(['one', 'two']);
      expect(arry).to.have.sourceMapStart(0);
      expect(arry).to.have.sourceMapOffset(21);
      expect(arry).to.have.sourceMapStartLine(1);
      expect(arry).to.have.sourceMapStartColumn(1);
      expect(arry).to.have.sourceMapEndLine(3);
      expect(arry).to.have.sourceMapEndColumn(8);

      const entryOne = arry.get(0);

      expect(entryOne).to.be.instanceof(namespace.elements.String);
      expect(entryOne.toValue()).to.equal('one');
      expect(entryOne).to.have.sourceMapStart(10);
      expect(entryOne).to.have.sourceMapOffset(3);
      expect(entryOne).to.have.sourceMapStartLine(2);
      expect(entryOne).to.have.sourceMapStartColumn(5);
      expect(entryOne).to.have.sourceMapEndLine(2);
      expect(entryOne).to.have.sourceMapEndColumn(8);

      const entryTwo = arry.get(1);

      expect(entryTwo).to.be.instanceof(namespace.elements.String);
      expect(entryTwo.toValue()).to.equal('two');
      expect(entryTwo).to.have.sourceMapStart(18);
      expect(entryTwo).to.have.sourceMapOffset(3);
      expect(entryTwo).to.have.sourceMapStartLine(3);
      expect(entryTwo).to.have.sourceMapStartColumn(5);
      expect(entryTwo).to.have.sourceMapEndLine(3);
      expect(entryTwo).to.have.sourceMapEndColumn(8);

      const warning = element.second;
      expect(warning).to.be.instanceof(namespace.elements.Annotation);
      expect(warning.toValue()).to.equal('Interpreting YAML !!set as array');
      expect(warning).to.have.sourceMapStart(0);
      expect(warning).to.have.sourceMapOffset(21);
      expect(warning).to.have.sourceMapStartLine(1);
      expect(warning).to.have.sourceMapStartColumn(1);
      expect(warning).to.have.sourceMapEndLine(3);
      expect(warning).to.have.sourceMapEndColumn(8);
    });

    it('can parse empty set into an array element', () => {
      const parseResult = parseYAML('!!set', context);

      expect(parseResult).to.be.instanceof(namespace.elements.ParseResult);
      expect(parseResult.length).to.equal(2);

      const array = parseResult.first;
      expect(array).to.be.instanceof(namespace.elements.Array);
      expect(array.length).to.equal(0);
      expect(array).to.have.sourceMapStart(0);
      expect(array).to.have.sourceMapOffset(5);
      expect(array).to.have.sourceMapStartLine(1);
      expect(array).to.have.sourceMapStartColumn(1);
      expect(array).to.have.sourceMapEndLine(1);
      expect(array).to.have.sourceMapEndColumn(6);

      expect(parseResult).to.contain.warning('Interpreting YAML !!set as array');
    });
  });

  it('can accumulate annotations during YAML translation', () => {
    const element = parseYAML('!!omap\n  key: !!binary "NDIK"', context);

    expect(element).to.be.instanceof(namespace.elements.ParseResult);
    expect(element.length).to.equal(3);

    const object = element.first;

    expect(object).to.be.instanceof(namespace.elements.Object);
    expect(object.toValue()).to.deep.equal({ key: 'NDIK' });
    expect(object).to.have.sourceMapStart(0);
    expect(object).to.have.sourceMapOffset(29);
    expect(object).to.have.sourceMapStartLine(1);
    expect(object).to.have.sourceMapStartColumn(1);
    expect(object).to.have.sourceMapEndLine(2);
    expect(object).to.have.sourceMapEndColumn(23);

    const member = object.first;

    expect(member.key).to.be.instanceof(namespace.elements.String);
    expect(member.key.toValue()).to.equal('key');
    expect(member.key).to.have.sourceMapStart(9);
    expect(member.key).to.have.sourceMapOffset(3);
    expect(member.key).to.have.sourceMapStartLine(2);
    expect(member.key).to.have.sourceMapStartColumn(3);
    expect(member.key).to.have.sourceMapEndLine(2);
    expect(member.key).to.have.sourceMapEndColumn(6);

    expect(member.value).to.be.instanceof(namespace.elements.String);
    expect(member.value.toValue()).to.equal('NDIK');
    expect(member.value).to.have.sourceMapStart(14);
    expect(member.value).to.have.sourceMapOffset(15);
    expect(member.value).to.have.sourceMapStartLine(2);
    expect(member.value).to.have.sourceMapStartColumn(8);
    expect(member.value).to.have.sourceMapEndLine(2);
    expect(member.value).to.have.sourceMapEndColumn(23);

    const innerWarning = element.get(1);
    expect(innerWarning).to.be.instanceof(namespace.elements.Annotation);
    expect(innerWarning.toValue()).to.equal('Interpreting YAML !!binary as string');
    expect(innerWarning).to.have.sourceMapStart(14);
    expect(innerWarning).to.have.sourceMapOffset(15);
    expect(innerWarning).to.have.sourceMapStartLine(2);
    expect(innerWarning).to.have.sourceMapStartColumn(8);
    expect(innerWarning).to.have.sourceMapEndLine(2);
    expect(innerWarning).to.have.sourceMapEndColumn(23);

    const outerWarning = element.get(2);
    expect(outerWarning).to.be.instanceof(namespace.elements.Annotation);
    expect(outerWarning.toValue()).to.equal('Interpreting YAML !!omap as object');
    expect(outerWarning).to.have.sourceMapStart(0);
    expect(outerWarning).to.have.sourceMapOffset(29);
    expect(outerWarning).to.have.sourceMapStartLine(1);
    expect(outerWarning).to.have.sourceMapStartColumn(1);
    expect(outerWarning).to.have.sourceMapEndLine(2);
    expect(outerWarning).to.have.sourceMapEndColumn(23);
  });
});
