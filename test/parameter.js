import { expect } from 'chai';
import minimModule from 'minim';
import minimParseResult from 'minim-parse-result';
import Parser from '../src/parser';

const minim = minimModule.namespace()
  .use(minimParseResult);

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
    expect(member.value.toValue()).to.deep.equal([]);
    expect(parser.result.toValue()).to.deep.equal(['Value of example should be an array']);
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
});
