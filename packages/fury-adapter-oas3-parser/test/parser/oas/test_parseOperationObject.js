const { expect } = require('chai');
const { Fury } = require('fury');
const parse = require('../../../lib/parser/oas/parseOperationObject');

const { minim } = new Fury();

describe('Operation Object', () => {
  it('returns a transition', () => {
    const operation = new minim.elements.Member('get', {});

    const result = parse(minim, operation);

    expect(result.length).to.equal(1);
    const transition = result.get(0);
    expect(transition).to.be.instanceof(minim.elements.Transition);
  });

  it('returns a transition including a transaction', () => {
    const operation = new minim.elements.Member('get', {});

    const result = parse(minim, operation);

    expect(result.length).to.equal(1);

    const transition = result.get(0);
    expect(transition).to.be.instanceof(minim.elements.Transition);
    expect(transition.length).to.equal(1);

    const transaction = transition.get(0);
    expect(transaction).to.be.instanceof(minim.elements.HttpTransaction);
    expect(transaction.length).to.equal(2);

    expect(transaction.request).to.be.instanceof(minim.elements.HttpRequest);
    expect(transaction.request.method.toValue()).to.equal('GET');
    expect(transaction.response).to.be.instanceof(minim.elements.HttpResponse);
  });

  it('provides warning when operation is non-object', () => {
    const operation = new minim.elements.Member('get', null);

    const result = parse(minim, operation);

    expect(result.length).to.equal(1);
    expect(result.warnings.get(0).toValue()).to.equal(
      "'Operation Object' is not an object"
    );
  });

  describe('warnings for unsupported properties', () => {
    it('provides warning for unsupported tags key', () => {
      const operation = new minim.elements.Member('get', {
        tags: [],
      });

      const result = parse(minim, operation);

      expect(result.warnings.length).to.equal(1);
      expect(result.warnings.get(0).toValue()).to.equal(
        "'Operation Object' contains unsupported key 'tags'"
      );
    });

    it('provides warning for unsupported description key', () => {
      const operation = new minim.elements.Member('get', {
        description: '',
      });

      const result = parse(minim, operation);

      expect(result.warnings.length).to.equal(1);
      expect(result.warnings.get(0).toValue()).to.equal(
        "'Operation Object' contains unsupported key 'description'"
      );
    });

    it('provides warning for unsupported externalDocs key', () => {
      const operation = new minim.elements.Member('get', {
        externalDocs: '',
      });

      const result = parse(minim, operation);

      expect(result.warnings.length).to.equal(1);
      expect(result.warnings.get(0).toValue()).to.equal(
        "'Operation Object' contains unsupported key 'externalDocs'"
      );
    });

    it('provides warning for unsupported operationId key', () => {
      const operation = new minim.elements.Member('get', {
        operationId: '',
      });

      const result = parse(minim, operation);

      expect(result.warnings.length).to.equal(1);
      expect(result.warnings.get(0).toValue()).to.equal(
        "'Operation Object' contains unsupported key 'operationId'"
      );
    });

    it('provides warning for unsupported parameters key', () => {
      const operation = new minim.elements.Member('get', {
        parameters: '',
      });

      const result = parse(minim, operation);

      expect(result.warnings.length).to.equal(1);
      expect(result.warnings.get(0).toValue()).to.equal(
        "'Operation Object' contains unsupported key 'parameters'"
      );
    });

    it('provides warning for unsupported requestBody key', () => {
      const operation = new minim.elements.Member('get', {
        requestBody: '',
      });

      const result = parse(minim, operation);

      expect(result.warnings.length).to.equal(1);
      expect(result.warnings.get(0).toValue()).to.equal(
        "'Operation Object' contains unsupported key 'requestBody'"
      );
    });

    it('provides warning for unsupported responses key', () => {
      const operation = new minim.elements.Member('get', {
        responses: '',
      });

      const result = parse(minim, operation);

      expect(result.warnings.length).to.equal(1);
      expect(result.warnings.get(0).toValue()).to.equal(
        "'Operation Object' contains unsupported key 'responses'"
      );
    });

    it('provides warning for unsupported callbacks key', () => {
      const operation = new minim.elements.Member('get', {
        callbacks: '',
      });

      const result = parse(minim, operation);

      expect(result.warnings.length).to.equal(1);
      expect(result.warnings.get(0).toValue()).to.equal(
        "'Operation Object' contains unsupported key 'callbacks'"
      );
    });

    it('provides warning for unsupported deprecated key', () => {
      const operation = new minim.elements.Member('get', {
        deprecated: '',
      });

      const result = parse(minim, operation);

      expect(result.warnings.length).to.equal(1);
      expect(result.warnings.get(0).toValue()).to.equal(
        "'Operation Object' contains unsupported key 'deprecated'"
      );
    });

    it('provides warning for unsupported security key', () => {
      const operation = new minim.elements.Member('get', {
        security: '',
      });

      const result = parse(minim, operation);

      expect(result.warnings.length).to.equal(1);
      expect(result.warnings.get(0).toValue()).to.equal(
        "'Operation Object' contains unsupported key 'security'"
      );
    });

    it('does not provide warning/errors for extensions', () => {
      const operation = new minim.elements.Member('get', {
        'x-extension': '',
      });

      const result = parse(minim, operation);

      expect(result.annotations.isEmpty).to.be.true;
    });
  });

  it('provides warning for invalid keys', () => {
    const operation = new minim.elements.Member('get', {
      invalid: '',
    });

    const result = parse(minim, operation);

    expect(result.warnings.length).to.equal(1);
    expect(result.warnings.get(0).toValue()).to.equal(
      "'Operation Object' contains invalid key 'invalid'"
    );
  });

  describe('#summary', () => {
    it('warns when summary is not a string', () => {
      const operation = new minim.elements.Member('get', {
        summary: [],
      });

      const result = parse(minim, operation);

      expect(result.length).to.equal(2);
      expect(result.get(0)).to.be.instanceof(minim.elements.Transition);

      expect(result.warnings.get(0).toValue()).to.equal("'Operation Object' 'summary' is not a string");
    });

    it('returns a transition with a summary', () => {
      const operation = new minim.elements.Member('get', {
        summary: 'Example Summary',
      });

      const result = parse(minim, operation);

      expect(result.length).to.equal(1);

      const transition = result.get(0);
      expect(transition).to.be.instanceof(minim.elements.Transition);
      expect(transition.length).to.equal(1);

      expect(transition.title.toValue()).to.equal('Example Summary');
    });
  });
});
