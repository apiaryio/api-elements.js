import { expect } from 'chai';
import minimModule from 'minim';
import minimParseResult from 'minim-parse-result';
import Parser from '../src/parser';

const minim = minimModule.namespace()
  .use(minimParseResult);

const SourceMap = minim.elements.SourceMap;

describe('Parameter to Member converter', () => {
  context('when I use it with parameter', () => {
    const parser = new Parser({
      minim,
      source: 'swagger: "2.0"\ninfo:\n  title: API\n  version: v2',
      generateSourceMap: true,
    });

    const parameter = {
      in: 'query',
      name: 'tags',
      type: 'string',
      default: 'hello',
    };

    // Mock ast.getPosition which is used in createSourceMap
    const getPosition = (path) => {
      if (path[0] === 'path1') {
        return { start: 10, end: 20 };
      }

      if (path[0] === 'path2') {
        return { start: 20, end: 30 };
      }

      return { start: 0, end: 10 };
    };

    before((done) => {
      parser.parse((err) => {
        if (err) done(err);

        parser.path = ['path1'];

        parser.internalAST = {
          getPosition,
        };

        done();
      });
    });

    context('when the sourcemap path is not given', () => {
      it('returns the correct member', () => {
        const member = parser.convertParameterToMember(parameter);
        const sourceMap = member.value.attributes.get('default').attributes.get('sourceMap');

        expect(sourceMap.length).to.equal(1);
        expect(sourceMap.get(0)).to.be.instanceof(SourceMap);
        expect(sourceMap.get(0).toValue()).to.deep.equal([[10, 10]]); // path 1
      });
    });

    context('when the sourcemap path is given', () => {
      it('returns the correct member', () => {
        const member = parser.convertParameterToMember(parameter, ['path2']);
        const sourceMap = member.value.attributes.get('default').attributes.get('sourceMap');

        expect(sourceMap.length).to.equal(1);
        expect(sourceMap.get(0)).to.be.instanceof(SourceMap);
        expect(sourceMap.get(0).toValue()).to.deep.equal([[20, 10]]); // path 2
      });
    });
  });

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
});
