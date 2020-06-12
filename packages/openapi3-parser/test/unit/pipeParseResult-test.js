const R = require('ramda');
const { Fury } = require('@apielements/core');
const { expect } = require('./chai');
const { createError, createWarning } = require('../../lib/elements');
const pipeParseResult = require('../../lib/pipeParseResult');

const { minim: namespace } = new Fury();

const isNumber = element => element.element === 'number';
const doubleNumber = number => number.toValue() * 2;
const add = R.curry((value, number) => number.toValue() + value);

describe('#pipeParseResult', () => {
  it('can pipe success across functions', () => {
    const parse = pipeParseResult(namespace,
      add(2),
      doubleNumber);

    const parseResult = parse(new namespace.elements.Number(3));

    expect(parseResult.toValue()).to.deep.equal([10]);
  });

  it('spreads multiple elements as arguments during pipe', () => {
    const duplicate = element => new namespace.elements.ParseResult([element, element]);
    const multiply = (lhs, rhs) => lhs.toValue() * rhs.toValue();
    const parse = pipeParseResult(namespace,
      duplicate,
      multiply);

    const parseResult = parse(new namespace.elements.Number(3));

    expect(parseResult.toValue()).to.deep.equal([9]);
  });

  it('fails early during a failure', () => {
    const message = 'Value must be a number';
    const parse = pipeParseResult(namespace,
      R.unless(isNumber, createError(namespace, message)),
      doubleNumber);

    const parseResult = parse(new namespace.elements.String());

    expect(parseResult.length).to.equal(1);
    expect(parseResult).to.contain.error(message);
  });

  it('all annotations are merged into result', () => {
    const message = 'example warning';
    const parse = pipeParseResult(namespace,
      number => new namespace.elements.ParseResult([
        number, createWarning(namespace, message, number),
      ]),
      doubleNumber);

    const parseResult = parse(new namespace.elements.Number(5));

    expect(parseResult.length).to.equal(2);
    expect(parseResult).to.contain.warning(message);
  });
});
