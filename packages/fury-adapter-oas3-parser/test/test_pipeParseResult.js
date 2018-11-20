const R = require('ramda');
const { expect } = require('chai');
const { Fury } = require('fury');
const { createError, createWarning } = require('../lib/elements');
const pipeParseResult = require('../lib/pipeParseResult');

const minim = new Fury().minim;

const isNumber = element => element.element === 'number';
const doubleNumber = number => number.toValue() * 2;
const add = R.curry((value, number) => number.toValue() + value);

describe('#pipeParseResult', function () {
  it('can pipe success across functions', function () {
    const parse = pipeParseResult(minim,
      add(2),
      doubleNumber,
    );

    const parseResult = parse(new minim.elements.Number(3));

    expect(parseResult.toValue()).to.deep.equal([10]);
  });

  it('fails early during a failure', function () {
    const parse = pipeParseResult(minim,
      R.unless(isNumber, createError(minim, 'Value must be a number')),
      doubleNumber
    );

    const parseResult = parse(new minim.elements.String());

    expect(parseResult.toValue()).to.deep.equal([
      'Value must be a number'
    ]);
  });

  it('all annotations are merged into result', function () {
    const parse = pipeParseResult(minim,
      (number) => new minim.elements.ParseResult([
        number, createWarning(minim, 'example warning', number)
      ]),
      doubleNumber
    );

    const parseResult = parse(new minim.elements.Number(5));

    expect(parseResult.toValue()).to.deep.equal([
      10,
      'example warning'
    ]);
  });
});
