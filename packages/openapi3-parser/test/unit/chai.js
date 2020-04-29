/* eslint-disable no-unused-vars */
/* eslint-disable no-underscore-dangle */

const chai = require('chai');
const { Fury } = require('fury');

const { minim: namespace } = new Fury();

chai.use((chai_, utils) => {
  const { Assertion } = chai_;

  Assertion.addProperty('annotations', function annotationsAssert() {
    const obj = this._obj;

    this.assert(
      obj.errors.length !== 0 || obj.warnings.length !== 0,
      'expected ParseResult will contain any annotations but it is empty',
      'expected ParseResult will not contain any error anotation, but has #{act}',
      0,
      obj.errors.length + obj.warnings.length
    );
  });

  Assertion.addMethod('error', function errorAssert(message) {
    const obj = this._obj;

    this.assert(
      obj.errors.length === 1,
      'expected ParseResult will contain exactly 1 error annotation but got #{act}',
      'expected ParseResult will not contain any error anotation',
      1,
      obj.errors.length
    );

    const err = obj.errors.get(0);

    new Assertion(err).to.be.instanceof(namespace.elements.Annotation);

    this.assert(
      err.toValue() === message,
      'expected ParseResult will contain error with message #{exp} not message #{act}',
      'expected ParseResult will not contain any error anotation',
      message,
      err.toValue()
    );

    this._obj = err; // modify asserted object to allow chain assert 'with.sourceMap()'
  });

  Assertion.addMethod('warning', function warningAssert(message) {
    const obj = this._obj;

    this.assert(
      obj.warnings.length === 1,
      'expected ParseResult will contain exactly 1 warning annotation but got #{act}',
      'expected ParseResult will not contain any error anotation',
      1,
      obj.warnings.length
    );

    const warning = obj.warnings.get(0);

    new Assertion(warning).to.be.instanceof(namespace.elements.Annotation);

    this.assert(
      warning.toValue() === message,
      'expected ParseResult will contain error with message #{exp} not message #{act}',
      'expected ParseResult will not contain any error anotation',
      message,
      warning.toValue()
    );

    this._obj = warning; // modify asserted object to allow chain assert 'with.sourceMap()'
  });

  Assertion.addMethod('sourceMap', function sourceMapAssert(sourceMap) {
    const sm = this._obj.sourceMapValue;

    this.assert(
      sm !== undefined,
      'expected element will contain source map but it is undefined',
      'expected element will not contain source map but it is defined'
    );

    this.assert(
      new Assertion(this._obj.sourceMapValue).to.deep.equal(sourceMap),
      'expected element will contain source map #{exp} but got #{act}',
      'expected element will not contain source map #{act}',
      sourceMap,
      this._obj.sourceMapValue
    );
  });

  Assertion.addMethod('sourceMapStart', function sourceMapAssert(n) {
    const attr = this._obj.attributes;
    this.assert(attr !== undefined);

    const sourceMaps = attr.get('sourceMap');
    this.assert(sourceMaps !== undefined);

    const firstSourceMap = sourceMaps.get(0);
    this.assert(firstSourceMap !== undefined);

    const wrappingArray = firstSourceMap.get(0);
    this.assert(wrappingArray !== undefined);

    const start = wrappingArray.get(0);
    this.assert(start !== undefined);

    const line = start.attributes.get('line');
    this.assert(line !== undefined);

    const column = start.attributes.get('column');
    this.assert(column !== undefined);

    const actual = start.toValue();
    this.assert(
      new Assertion(actual).to.equal(n),
      'expected start to be #{exp}, got #{act}',
      'expected start to not equal #{exp}, got exactly that',
      n,
      actual
    );
  });

  Assertion.addMethod('sourceMapOffset', function sourceMapAssert(n) {
    const attr = this._obj.attributes;
    this.assert(attr !== undefined);

    const sourceMaps = attr.get('sourceMap');
    this.assert(sourceMaps !== undefined);

    const firstSourceMap = sourceMaps.get(0);
    this.assert(firstSourceMap !== undefined);

    const wrappingArray = firstSourceMap.get(0);
    this.assert(wrappingArray !== undefined);

    const offset = wrappingArray.get(1);
    this.assert(offset !== undefined);

    const line = offset.attributes.get('line');
    this.assert(line !== undefined);

    const column = offset.attributes.get('column');
    this.assert(column !== undefined);

    const actual = offset.toValue();
    this.assert(
      new Assertion(actual).to.equal(n),
      'expected offset to be #{exp}, got #{act}',
      'expected offset to not equal #{exp}, got exactly that',
      n,
      actual
    );
  });

  Assertion.addMethod('sourceMapStartLine', function sourceMapAssert(n) {
    const attr = this._obj.attributes;
    this.assert(attr !== undefined);

    const sourceMaps = attr.get('sourceMap');
    this.assert(sourceMaps !== undefined);

    const firstSourceMap = sourceMaps.get(0);
    this.assert(firstSourceMap !== undefined);

    const wrappingArray = firstSourceMap.get(0);
    this.assert(wrappingArray !== undefined);

    const start = wrappingArray.get(0);
    this.assert(start !== undefined);

    const line = start.attributes.get('line');
    this.assert(line !== undefined);

    const actual = line.toValue();
    this.assert(
      actual === n,
      'expected start line to be #{exp}, got #{act}',
      'expected start line to not equal #{exp}, got exactly that',
      n,
      actual
    );
  });

  Assertion.addMethod('sourceMapStartColumn', function sourceMapAssert(n) {
    const attr = this._obj.attributes;
    this.assert(attr !== undefined);

    const sourceMaps = attr.get('sourceMap');
    this.assert(sourceMaps !== undefined);

    const firstSourceMap = sourceMaps.get(0);
    this.assert(firstSourceMap !== undefined);

    const wrappingArray = firstSourceMap.get(0);
    this.assert(wrappingArray !== undefined);

    const start = wrappingArray.get(0);
    this.assert(start !== undefined);

    const column = start.attributes.get('column');
    this.assert(column !== undefined);

    const actual = column.toValue();
    this.assert(
      new Assertion(actual).to.equal(n),
      'expected end column to be #{exp}, got #{act}',
      'expected end column to not equal #{exp}, got exactly that',
      n,
      actual
    );
  });

  Assertion.addMethod('sourceMapEndLine', function sourceMapAssert(n) {
    const attr = this._obj.attributes;
    this.assert(attr !== undefined);

    const sourceMaps = attr.get('sourceMap');
    this.assert(sourceMaps !== undefined);

    const firstSourceMap = sourceMaps.get(0);
    this.assert(firstSourceMap !== undefined);

    const wrappingArray = firstSourceMap.get(0);
    this.assert(wrappingArray !== undefined);

    const offset = wrappingArray.get(1);
    this.assert(offset !== undefined);

    const line = offset.attributes.get('line');
    this.assert(line !== undefined);

    const actual = line.toValue();
    this.assert(
      new Assertion(actual).to.equal(n),
      'expected end line to be #{exp}, got #{act}',
      'expected end line to not equal #{exp}, got exactly that',
      n,
      actual
    );
  });

  Assertion.addMethod('sourceMapEndColumn', function sourceMapAssert(n) {
    const attr = this._obj.attributes;
    this.assert(attr !== undefined);

    const sourceMaps = attr.get('sourceMap');
    this.assert(sourceMaps !== undefined);

    const firstSourceMap = sourceMaps.get(0);
    this.assert(firstSourceMap !== undefined);

    const wrappingArray = firstSourceMap.get(0);
    this.assert(wrappingArray !== undefined);

    const offset = wrappingArray.get(1);
    this.assert(offset !== undefined);

    const column = offset.attributes.get('column');
    this.assert(column !== undefined);

    const actual = column.toValue();
    this.assert(
      new Assertion(actual).to.equal(n),
      'expected end column to be #{exp}, got #{act}',
      'expected end column to not equal #{exp}, got exactly that',
      n,
      actual
    );
  });
});

module.exports = chai;
