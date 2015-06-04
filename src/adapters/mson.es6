/*
 * Renders refract elements into MSON.
 */

/*
 * Indent a piece of multiline text by a number of spaces.
 */
function indent(input, spaces) {
   let pre = '';
   let lines = [];

   for (let _ = 0; _ < spaces; _++) {
     pre += ' ';
   }

   for (let line of input.split('\n')) {
     // Only indent non-blank lines!
     lines.push(line ? pre + line : line);
   }

   return lines.join('\n').trim();
 }

/*
 * Get type information for an element, such as the element name, whether
 * it is required, etc. Returns an array of strings.
 */
function getTypeAttributes(element, attributes={}) {
  let typeAttributes = [];

  if (element.element !== 'string' && element.element !== 'dataStructure') {
    typeAttributes.push(element.element);
  }

  return typeAttributes.concat(attributes.typeAttributes || []);
}

/*
 * Handle the rendering of an element based on its element type. This function
 * will call itself recursively to handle child elements for objects and
 * arrays.
 */
function handle(name, element, {parent=null, spaces=4, marker='+',
                                initialMarker='+',
                                initialIndent=true,
                                attributesElement=element}) {
  const elementName = element.element;
  let str = initialMarker;

  // Start with the item name if it has one.
  if (name) {
    str += ` ${name}`;
  }

  // Next, comes the optional example value
  if (typeof element.content !== 'object') {
    if (parent && parent.element !== 'array') {
      str += ':';
    }
    str += ` ${element.content}`;
  }

  // Then the type and attribute information (e.g. required)
  let attributes = getTypeAttributes(element, attributesElement.attributes);
  if (attributes.length) {
    str += ` (${attributes.join(', ')})`;
  }

  // Finally, an optional description
  if (attributesElement.attributes &&
      attributesElement.attributes.description) {
    // TODO: Handle multiline or very long descriptions
    str += ` - ${attributesElement.attributes.description}`;
  }

  // TODO: Handle default, sample, and other special array items here,
  //       keeping in mind that they force extra indentation below as well
  //       as the use of special values like `+ Properties`.

  // Now, depending on the content type, we will recursively handle child
  // elements within objects and arrays.
  if (element.content && element.content.length) {
    str += '\n';

    if (elementName === 'dataStructure') {
      str += '\n';
    }

    for (let item of element.content) {
      // Note: the `initialIndent` option above works because we specifically
      //       do *not* pass it down the rabbit hole here.
      if (item.element === 'member') {
        // This is an object type or something similar.
        str += handle(item.key.content, item.value, {
          parent: element,
          spaces,
          marker,
          attributesElement: item
        });
      } else {
        // This is an array type or something similar.
        str += handle(item.meta.title.toValue(), item, {
          parent: element,
          spaces,
          marker
        });
      }
    }
  }

  // Return the entire block indented to the correct number of spaces.
  if (initialIndent) {
    str = indent(str, spaces);
  }

  return str + '\n';
}

/*
 * Render out a piece of MSON from refract element instances.
 */
export default function render(mson) {
  // Render *either* ### Title or + Attributes as the base element to support
  // both a data structures section and resource / payload attributes.
  const title = mson.meta.title.toValue();

  return handle(title || 'Attributes', mson, {
    initialMarker: title ? '###' : '+',
    initialIndent: title ? false : true
  });
}
