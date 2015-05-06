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
 */
export function filterBy(options, item) {
  if (options.className && !hasClass(item, options.className)) {
    return false;
  }
  if (options.element && item.element !== options.element) {
    return false;
  }

  return true;
}
