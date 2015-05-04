import {assert} from 'chai';
import RefractElement from '../../../lib/refract/element';

describe ('Refract element', function () {
  it ('Should provide access to element type', function () {
    let element = new RefractElement(['x', {'title': 'foo'}, {}, null]);

    assert.equal(element.name, 'x');
  });

  it ('Should provide access to known metadata', function () {
    let element = new RefractElement(
      ['x', {'title': 'foo'}, {}, null]
    );

    assert.equal(element.title, 'foo');
  });

  it ('Should provide access to class names', function () {
    let element = new RefractElement(
      ['x', {'class': ['foo']}, {}, null]
    );

    assert.isTrue(element.hasClass('foo'));
    assert.isFalse(element.hasClass('bar'));
  });

  it ('Should provide access to sub-elements in contents', function () {
    let element = new RefractElement(
      ['x', {}, {}, [
        ['y', {}, {}, null],
        ['z', {}, {}, null]
      ]]
    );

    let contents = element.contents();
    assert.equal(contents.length, 2);
    assert.equal(contents[0].name, 'y');
    assert.equal(contents[1].name, 'z');
  });

  it ('Should filter sub-elements by type name', function () {
    let element = new RefractElement(
      ['x', {}, {}, [
        ['y', {}, {}, null],
        ['z', {}, {}, null]
      ]]
    );

    let contents = element.contents({elementName: 'z'});
    assert.equal(contents.length, 1);
    assert.equal(contents[0].name, 'z');
  });

  it ('Should filter sub-elements by class name', function () {
    let element = new RefractElement(
      ['x', {}, {}, [
        ['y', {'class': ['foo']}, {}, null],
        ['z', {}, {}, null]
      ]]
    );

    let contents = element.contents({className: 'foo'});
    assert.equal(contents.length, 1);
    assert.equal(contents[0].name, 'y');
  });

  it ('Should filter from a hash key', function () {
    let element = new RefractElement(
      ['x', {}, {}, {
        'frobs': [
          ['y', {}, {}, null]
        ]
      }]
    );

    let contents = element.contents({key: 'frobs'});
    assert.equal(contents.length, 1);
    assert.equal(contents[0].name, 'y');
  });
});
