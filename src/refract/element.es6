/*
 * Base elements for working with refract shorthand, which is composed of
 * tuples with the following values:
 *
 * [name, metadata, attributes, contents]
 *
 * For example:
 *
 * ['resource', {'title': 'Question'}, {'href': '/questions'},
 *   ['transition', {}, {}, ...],
 *   ...
 * ]
 *
 * https://github.com/refractproject/refract-spec
 */
const rawElement = Symbol('element');

export default class RefractElement {
  constructor(element=['', {}, {}, null]) {
    this[rawElement] = element;
    this.name = element[0];

    if (element[1]) {
      this.title = element[1].title;
      // TODO: Render the markdown?
      this.description = element[1].description;
    }
  }

  /*
   * Returns `true` if there is a `class` attribute list and `name` is present
   * in the list.
   */
  hasClass(name) {
    return this[rawElement][1] && this[rawElement][1].class &&
           this[rawElement][1].class.indexOf &&
           this[rawElement][1].class.indexOf(name) !== -1;
  }

  /*
   * Gather the contents of an element, optionally selecting a specific
   * key (if it is a hash) and filtering by element name or class name.
   * Multiple filters are treated as an AND operation, e.g. return all
   * 'category' elements with a class of 'resourceGroup'.
   *
   * options = {
   *   className,   // Filter by element[1].class.
   *   key,         // Select this key (useful if the element is a hash).
   *   elementName, // Filter by element[0].
   *   elementType, // Instantiate as this subclass of RefractElement.
   * }
   *
   * Returns an array of element objects.
   */
  contents(options={}) {
    let ElementType = options.elementType || RefractElement;
    let elements = [];
    let data = this[rawElement][3];

    // If this element's content is a hash instead of a list, you likely want
    // to select one of its list values.
    if (options.key) {
      data = data[options.key];
    }

    if (data === null) {
      return [];
    }

    for (let raw of data) {
      // Individual items may be null; just skip them.
      if (raw === null) {
        continue;
      }

      // Create a new `RefractElement` (or subclass) so that it can be used
      // when filtering and to build the response array.
      let element = new ElementType(raw);

      if (options.className && !element.hasClass(options.className)) {
        continue;
      }
      if (options.elementName && element.name !== options.elementName) {
        continue;
      }

      elements.push(element);
    }

    return elements;
  }
}
