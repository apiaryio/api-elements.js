/*
 * Returns `true` if there is a `class` attribute list and `name` is present
 * in the list.
 */
function hasClass(element, name) {
  return element.meta && element.meta.class &&
         element.meta.class.indexOf &&
         element.meta.class.indexOf(name) !== -1;
}

/*
 * A function to help filtering elements by certain criteria based on
 * a simple configuration. Usage:
 *
 * let items = refractElement.findElements(filterBy.bind(this, {
 *   className: 'some-class'
 * }));
 *
 * Options:
 * - className: filter by element.meta.class
 * - element: filter by the element type (e.g. string or resourceGroup)
 * - name: filter by element.meta.name
 * - ignoreCase: don't care about casing when comparing the name
 */
export function filterBy(options, item) {
  if (options.className && !hasClass(item, options.className)) {
    return false;
  }
  if (options.element && item.element !== options.element) {
    return false;
  }
  if (options.name && item.meta && item.meta.name) {
    if (options.ignoreCase) {
      if (item.meta.name.toLowerCase() !== options.name.toLowerCase()) {
        return false;
      }
    } else {
      if (item.meta.name !== options.name) {
        return false;
      }
    }
  }

  return true;
}
