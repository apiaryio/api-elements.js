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
  if (options.className && item.meta.class.contains(options.className)) {
    return false;
  }
  if (options.element && item.element !== options.element) {
    return false;
  }

  let name = item.name;
  if (options.name && name) {
    if (options.ignoreCase) {
      if (name.toLowerCase() !== options.name.toLowerCase()) {
        return false;
      }
    } else {
      if (name !== options.name) {
        return false;
      }
    }
  }

  return true;
}
