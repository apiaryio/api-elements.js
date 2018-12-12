import _ from 'lodash';
import { expect } from 'chai';
import Parser from '../src/parser';

describe('Test parser.withPath() ', () => {
  let parser;
  const path = ['paths', '/', 'get'];

  beforeEach(() => {
    parser = new Parser({});
    parser.path = _.clone(path);

    expect(parser.path).to.deep.equal(path);
  });

  afterEach(() => {
    expect(parser.path).to.deep.equal(path);
  });

  context('invoke with', () => {
    it('should work with no path', () => {
      parser.withPath((_path) => {
        expect(_path).to.deep.equal(path);
      });
    });

    it('should add segment', () => {
      parser.withPath('parameters', (_path) => {
        expect(_path).to.deep.equal(_.concat(path, 'parameters'));
      });
    });

    it('double dot should iterate in level up', () => {
      parser.withPath('..', (_path) => {
        expect(_path).to.deep.equal(_.take(path, 2));
      });
    });

    it('double dot and segment should switch to sibling path', () => {
      parser.withPath('..', 'put', (_path) => {
        expect(_path).to.deep.equal(['paths', '/', 'put']);
      });
    });

    it('multiple `..` should not crash and switch into root', () => {
      parser.withPath('..', '..', '..', '..', '..', (_path) => {
        expect(_path).to.deep.equal([]);
      });
    });

    it('multiple `..` followed by segment shold switch into segment', () => {
      parser.withPath('..', '..', '..', '..', 'root', (_path) => {
        expect(_path).to.deep.equal(['root']);
      });
    });

    it('should work with `.` path', () => {
      parser.withPath('.', (_path) => {
        expect(_path).to.deep.equal(path);
      });
    });

    it('should work with `.` path and aditional segment', () => {
      parser.withPath('.', 'schema', (_path) => {
        expect(_path).to.deep.equal(_.concat(path, 'schema'));
      });
    });
  });
});
