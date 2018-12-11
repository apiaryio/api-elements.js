
const { expect } = require('chai');
const { Fury } = require('fury');

const { minim } = new Fury();

function createAnnotation(annotationClass, message, sourceMap) {
  const annotation = new minim.elements.Annotation(message);
  annotation.classes = [annotationClass];
  if (sourceMap !== undefined) {
    annotation.attributes.set('sourceMap', new minim.elements.Array([sourceMap]));
  }
  return annotation;
}

describe('chai helpers', () => {
  it('will recognize there are no anotations in result', () => {
    const parseResult = new minim.elements.ParseResult();
    expect(parseResult).to.not.contain.annotations;
  });

  it('will recognize warning as anotations in result', () => {
    const parseResult = new minim.elements.ParseResult([createAnnotation('warning', 'x')]);

    expect(parseResult.errors.length).to.equal(0);
    expect(parseResult.warnings.length).to.equal(1);

    expect(parseResult).to.contain.annotations;
  });

  it('will recognize error as anotations in result', () => {
    const parseResult = new minim.elements.ParseResult([createAnnotation('error', 'x')]);

    expect(parseResult.errors.length).to.equal(1);
    expect(parseResult.warnings.length).to.equal(0);

    expect(parseResult).to.contain.annotations;
  });

  it('will recognize error and warning as anotations in result', () => {
    const parseResult = new minim.elements.ParseResult([createAnnotation('error', 'x'), createAnnotation('warning', 'y')]);

    expect(parseResult.errors.length).to.equal(1);
    expect(parseResult.warnings.length).to.equal(1);

    expect(parseResult).to.contain.annotations;
  });

  it('will recognize error mesage in result', () => {
    const parseResult = new minim.elements.ParseResult([createAnnotation('error', 'x')]);

    expect(parseResult).to.contain.error('x');
  });

  it('will recognize warning mesage in result', () => {
    const parseResult = new minim.elements.ParseResult([createAnnotation('warning', 'x')]);

    expect(parseResult).to.contain.warning('x');
  });

  it('will not identify annotation without corectly set class instance mesage in result', () => {
    const parseResult = new minim.elements.ParseResult([createAnnotation('dummy', 'foo')]);

    expect(parseResult).to.not.contain.annotations;
  });

  it('will not identify annotation without corectly set class instance mesage in result', () => {
    const invalidAnnotation = new minim.elements.String('value');
    invalidAnnotation.classes = ['error'];

    const parseResult = new minim.elements.ParseResult([invalidAnnotation]);

    expect(parseResult).to.not.contain.annotations;
  });


  it('will allow test sourceMap on element', () => {
    const annotation = createAnnotation('error', 'x', [[1, 1]]);

    expect(annotation).to.have.sourceMap([[1, 1]]);
  });

  it('will allow chain test sourceMap for picked annotation', () => {
    const parseResult = new minim.elements.ParseResult([createAnnotation('error', 'x', [[1, 1]])]);

    expect(parseResult).to.contain.error('x').with.sourceMap([[1, 1]]);
  });
});
