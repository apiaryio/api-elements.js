// Chai uses unused expressions for expect
/* eslint-disable no-unused-expressions */

import { expect } from 'chai';
import minimModule from 'minim';
import minimParseResult from 'minim-parse-result';
import Parser from '../src/parser';

const minim = minimModule.namespace()
  .use(minimParseResult);

const { Annotation } = minim.elements;

describe('Parameter to Member converter', () => {
  it('can convert a parameter to a member with x-example', () => {
    const parser = new Parser({ minim, source: '' });
    const parameter = {
      in: 'query',
      name: 'tags',
      type: 'string',
      'x-example': 'hello',
    };
    const member = parser.convertParameterToMember(parameter);

    expect(member.value).to.be.instanceof(minim.elements.String);
    expect(member.value.toValue()).to.equal('hello');
  });

  it('can convert a parameter to a member with array x-example', () => {
    const parser = new Parser({ minim, source: '' });
    const parameter = {
      in: 'query',
      name: 'tags',
      type: 'array',
      'x-example': ['one', 'two'],
    };
    const member = parser.convertParameterToMember(parameter);

    expect(member.value).to.be.instanceof(minim.elements.Array);
    expect(member.value.toValue()).to.deep.equal(['one', 'two']);
  });

  it('can convert a parameter to a member with array x-example and items', () => {
    const parser = new Parser({ minim, source: '' });
    const parameter = {
      in: 'query',
      name: 'tags',
      type: 'array',
      items: {
        type: 'string',
      },
      'x-example': ['one', 'two'],
    };
    const member = parser.convertParameterToMember(parameter);

    expect(member.value).to.be.instanceof(minim.elements.Array);
    expect(member.value.toValue()).to.deep.equal(['one', 'two']);
  });

  it('can convert a parameter to a member with array x-example and items but with string example', () => {
    const parser = new Parser({ minim, source: '' });
    const parameter = {
      in: 'query',
      name: 'tags',
      type: 'array',
      items: {
        type: 'string',
      },
      'x-example': "['one', 'two']",
    };

    parser.result = new minim.elements.ParseResult();

    const member = parser.convertParameterToMember(parameter);

    expect(member.value).to.be.instanceof(minim.elements.Array);

    expect(member.value.length).to.equal(1);
    expect(member.value.get(0)).to.be.instanceof(minim.elements.String);
    expect(member.value.get(0).toValue()).to.be.null;

    expect(parser.result.toValue()).to.deep.equal(['Expected type array but found type string']);
  });

  it('can convert a parameter with enum values to a member with enumerations', () => {
    const parser = new Parser({ minim, source: '' });
    const parameter = {
      in: 'query',
      name: 'order',
      type: 'string',
      enum: ['ascending', 'descending'],
    };
    const member = parser.convertParameterToMember(parameter);

    expect(member.value).to.be.instanceof(minim.elements.Element);
    const enumerations = member.value.attributes.get('enumerations');

    expect(enumerations).to.be.instanceof(minim.elements.Array);
    expect(enumerations.toValue()).to.deep.equal(['ascending', 'descending']);
  });

  it('can convert a parameter with array enum values to a member with enumerations', () => {
    const parser = new Parser({ minim, source: '' });
    const parameter = {
      in: 'query',
      name: 'tags',
      type: 'array',
      items: {
        type: 'string',
      },
      enum: [
        ['hello'],
      ],
    };
    const member = parser.convertParameterToMember(parameter);

    expect(member.value).to.be.instanceof(minim.elements.Element);
    const enumerations = member.value.attributes.get('enumerations');

    expect(enumerations).to.be.instanceof(minim.elements.Array);
    expect(enumerations.toValue()).to.deep.equal([['hello']]);
  });

  it('creates a warning when example does not match parameter type', () => {
    const parser = new Parser({ minim, source: '' });
    parser.result = new minim.elements.ParseResult();
    parser.convertParameterToMember({
      type: 'string',
      'x-example': 5,
    });

    expect(parser.result.get(0)).to.be.instanceof(Annotation);
    expect(parser.result.toValue()).to.deep.equal(['Expected type string but found type integer']);
  });

  it('creates a warning when default does not match parameter type', () => {
    const parser = new Parser({ minim, source: '' });
    parser.result = new minim.elements.ParseResult();
    parser.convertParameterToMember({
      type: 'string',
      default: 5,
    });

    expect(parser.result.get(0)).to.be.instanceof(Annotation);
    expect(parser.result.toValue()).to.deep.equal(['Expected type string but found type integer']);
  });

  it('creates a warning when enum type does not match parameter type', () => {
    const parser = new Parser({ minim, source: '' });
    parser.result = new minim.elements.ParseResult();
    parser.convertParameterToMember({
      type: 'string',
      enum: [5],
    });

    expect(parser.result.get(0)).to.be.instanceof(Annotation);
    expect(parser.result.toValue()).to.deep.equal(['Expected type string but found type integer']);
  });

  it('creates a warning when example does not match items parameter type', () => {
    const parser = new Parser({ minim, source: '' });
    parser.result = new minim.elements.ParseResult();
    parser.convertParameterToMember({
      type: 'array',
      items: {
        type: 'string',
      },
      'x-example': [5],
    });

    expect(parser.result.get(0)).to.be.instanceof(Annotation);
    expect(parser.result.toValue()).to.deep.equal(['Expected type string but found type integer']);
  });

  it('coerces an integer value that does not match string parameter type', () => {
    const parser = new Parser({ minim, source: '' });
    parser.result = new minim.elements.ParseResult();
    const parameter = parser.convertParameterToElement({
      type: 'string',
      'x-example': 5,
    });

    expect(parser.result.get(0)).to.be.instanceof(Annotation);
    expect(parameter.toValue()).to.equal('5');
  });

  it('coerces an boolean value that does not match string parameter type', () => {
    const parser = new Parser({ minim, source: '' });
    parser.result = new minim.elements.ParseResult();
    const parameter = parser.convertParameterToElement({
      type: 'string',
      'x-example': true,
    });

    expect(parser.result.get(0)).to.be.instanceof(Annotation);
    expect(parameter.toValue()).to.equal('true');
  });
});
