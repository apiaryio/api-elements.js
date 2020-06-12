const { expect } = require('chai');
const { Fury } = require('@apielements/core');

const { minim: namespace } = new Fury();

function createAnnotation(annotationClass, message, sourceMap) {
  const annotation = new namespace.elements.Annotation(message);
  annotation.classes = [annotationClass];
  if (sourceMap !== undefined) {
    annotation.attributes.set('sourceMap', new namespace.elements.Array([sourceMap]));
  }
  return annotation;
}

describe('chai helpers', () => {
  it('will recognize there are no annotations in result', () => {
    const parseResult = new namespace.elements.ParseResult();
    expect(parseResult).to.not.contain.annotations;
  });

  it('will recognize warning as annotations in result', () => {
    const parseResult = new namespace.elements.ParseResult([createAnnotation('warning', 'x')]);

    expect(parseResult.errors.length).to.equal(0);
    expect(parseResult.warnings.length).to.equal(1);

    expect(parseResult).to.contain.annotations;
  });

  it('will recognize error as annotations in result', () => {
    const parseResult = new namespace.elements.ParseResult([createAnnotation('error', 'x')]);

    expect(parseResult.errors.length).to.equal(1);
    expect(parseResult.warnings.length).to.equal(0);

    expect(parseResult).to.contain.annotations;
  });

  it('will recognize error and warning as annotations in result', () => {
    const parseResult = new namespace.elements.ParseResult([
      createAnnotation('error', 'x'),
      createAnnotation('warning', 'y'),
    ]);

    expect(parseResult.errors.length).to.equal(1);
    expect(parseResult.warnings.length).to.equal(1);

    expect(parseResult).to.contain.annotations;
  });

  it('will recognize error message in result', () => {
    const parseResult = new namespace.elements.ParseResult([createAnnotation('error', 'x')]);

    expect(parseResult).to.contain.error('x');
  });

  it('will recognize warning message in result', () => {
    const parseResult = new namespace.elements.ParseResult([createAnnotation('warning', 'x')]);

    expect(parseResult).to.contain.warning('x');
  });

  it('will not identify annotation without correctly set class instance message in result', () => {
    const parseResult = new namespace.elements.ParseResult([createAnnotation('dummy', 'foo')]);

    expect(parseResult).to.not.contain.annotations;
  });

  it('will not identify annotation without correctly set class instance message in result', () => {
    const invalidAnnotation = new namespace.elements.String('value');
    invalidAnnotation.classes = ['error'];

    const parseResult = new namespace.elements.ParseResult([invalidAnnotation]);

    expect(parseResult).to.not.contain.annotations;
  });

  it('will allow test sourceMap on element', () => {
    const annotation = createAnnotation('error', 'x', [[1, 1]]);

    expect(annotation).to.have.sourceMap([[1, 1]]);
  });

  it('will allow chain test sourceMap for picked annotation', () => {
    const parseResult = new namespace.elements.ParseResult([createAnnotation('error', 'x', [[1, 1]])]);

    expect(parseResult).to.contain.error('x').with.sourceMap([[1, 1]]);
  });
});
