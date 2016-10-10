import {expect} from 'chai';
import minimModule from 'minim';
import minimParseResult from 'minim-parse-result';
import Parser from '../src/parser';

const minim = minimModule.namespace()
  .use(minimParseResult);

describe('Parameter to Member converter', () => {
  context('when I use it with parameter', () => {
    const parser = new Parser({
      minim: minim,
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

    before(done => {
      parser.parse(err => {
        if (err) done(err);

        parser.path = ['path1'];

        parser._ast = {
          getPosition,
        };

        done();
      });
    });

    context('when the sourcemap path is not given', () => {
      it('returns the correct member', () => {
        const member = parser.convertParameterToMember(parameter).toRefract();
        const sourceMap = member.content.value.attributes.default.attributes.sourceMap;

        expect(sourceMap.length).to.equal(1);
        expect(sourceMap[0].element).to.equal('sourceMap');
        expect(sourceMap[0].content).to.deep.equal([[10, 10]]); // path 1
      });
    });

    context('when the sourcemap path is given', () => {
      it('returns the correct member', () => {
        const member = parser.convertParameterToMember(parameter, ['path2']).toRefract();
        const sourceMap = member.content.value.attributes.default.attributes.sourceMap;

        expect(sourceMap.length).to.equal(1);
        expect(sourceMap[0].element).to.equal('sourceMap');
        expect(sourceMap[0].content).to.deep.equal([[20, 10]]); // path 2
      });
    });
  });
});
