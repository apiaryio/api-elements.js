/* eslint-disable no-unused-expressions */

const chai = require('chai')
const { expect } = require('chai');

const { Fury } = require('fury');
const { minim } = new Fury();

chai.use(function (_chai, utils) {
  var Assertion = _chai.Assertion

  Assertion.addProperty('annotations', function () {
    var obj = this._obj;

    this.assert(
      obj.errors.length !== 0 || obj.warnings.length !== 0,
      "expected ParseResult will contain any annotations but it is empty",
      "expected ParseResult will not contain any error anotation, but has #{act}",
      0,
      obj.errors.length + obj.warnings.length
    );
  });

  Assertion.addMethod('error', function (message) {
    var obj = this._obj;

    this.assert(
      obj.errors.length === 1,
      "expected ParseResult will contain exactly 1 error annotation but got #{act}",
      "expected ParseResult will not contain any error anotation",
      1,
      obj.errors.length
    );

    const err = obj.errors.get(0)

    new Assertion(err).to.be.instanceof(minim.elements.Annotation);

    this.assert(
      err.toValue() === message,
      "expected ParseResult will contain error with message #{exp} not message #{act}",
      "expected ParseResult will not contain any error anotation",
      message,
      err.toValue()
    );

		this._obj = err; // modify asserted object to allow chain assert 'with.sourceMap()'

  });

  Assertion.addMethod('warning', function (message) {
    var obj = this._obj;

    this.assert(
      obj.warnings.length === 1,
      "expected ParseResult will contain exactly 1 warning annotation but got #{act}",
      "expected ParseResult will not contain any error anotation",
      1,
      obj.warnings.length
    );

    const warning = obj.warnings.get(0)

    new Assertion(warning).to.be.instanceof(minim.elements.Annotation);

    this.assert(
       warning.toValue() === message,
      "expected ParseResult will contain error with message #{exp} not message #{act}",
      "expected ParseResult will not contain any error anotation",
      message,
      warning.toValue()
    );

		this._obj = warning; // modify asserted object to allow chain assert 'with.sourceMap()'
		

  });

  Assertion.addMethod('sourceMap', function (sourceMap) {
	  const sm = this._obj.sourceMapValue;

    this.assert(
		  sm !== undefined,
		  "expected element will contain source map but it is undefined",
		  "expected element will not contain source map but it is defined",
		);

		this.assert(
			expect(this._obj.sourceMapValue).to.deep.equal(sourceMap),
			"expected element will contain source map #{exp} but got #{act}",
			"expected element will not contain source map #{act}",
			sourceMap,
			this._obj.sourceMapValue
		);
	});

})

module.exports = chai
