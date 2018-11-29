const R = require('ramda');
const { expect } = require('chai');
const { Fury } = require('fury');
const { createError, createWarning } = require('../lib/elements');
const pipeParseResult = require('../lib/pipeParseResult');

const { minim } = new Fury();

const isNumber = element => element.element === 'number';
const doubleNumber = number => number.toValue() * 2;
const add = R.curry((value, number) => number.toValue() + value);

describe('#pipeParseResult', () => {
  it('can pipe success across functions', () => {
    const parse = pipeParseResult(minim,
      add(2),
      doubleNumber);

    const parseResult = parse(new minim.elements.Number(3));

    expect(parseResult.toValue()).to.deep.equal([10]);
  });

  it('streads multiple elements as arguments during pipe', () => {
    const duplicate = element => new minim.elements.ParseResult([element, element]);
    const multiply = (lhs, rhs) => lhs.toValue() * rhs.toValue();
    const parse = pipeParseResult(minim,
      duplicate,
      multiply);

    const parseResult = parse(new minim.elements.Number(3));

    expect(parseResult.toValue()).to.deep.equal([9]);
  });

  it('fails early during a failure', () => {
    const parse = pipeParseResult(minim,
      R.unless(isNumber, createError(minim, 'Value must be a number')),
      doubleNumber);

    const parseResult = parse(new minim.elements.String());

    expect(parseResult.length).to.equal(1);
    expect(parseResult.errors.length).to.equal(1);
  });

  it('all annotations are merged into result', () => {
    const parse = pipeParseResult(minim,
      number => new minim.elements.ParseResult([
        number, createWarning(minim, 'example warning', number),
      ]),
      doubleNumber);

    const parseResult = parse(new minim.elements.Number(5));

    expect(parseResult.length).to.equal(2);
    expect(parseResult.warnings.length).to.equal(1);
  });
});