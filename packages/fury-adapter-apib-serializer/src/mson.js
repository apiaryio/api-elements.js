/*
 * Renders refract elements into MSON.
 */

import { indent } from './filters';

/*
 * Get type information for an element, such as the element name, whether
 * it is required, etc. Returns an array of strings.
 */
function getTypeAttributes(element, attributes, parent) {
  let typeAttributes = [];

  if (element.element !== 'string' && (!!parent || element.element === 'array')) {
    // String is the default type. Any parentless type is probably a
    // section (# Data Structures or + Attributes) so we don't print
    // the type there either.
    typeAttributes.push(element.element);
  }

  if (attributes) {
    const tmp = attributes.get('typeAttributes');
    if (tmp) {
      typeAttributes = typeAttributes.concat(tmp.toValue() || []);
    }
  }

  return typeAttributes;
}

/*
 * Handle any element content, e.g. list items, object members, etc.
 * Note, this recursively calls the `handle` method.
 */
function handleContent(element, spaces, marker) {
  let renderedContent = '';
  let objectLike = null;

  if (element.content === undefined) {
    return [renderedContent, objectLike];
  }

  element.content.forEach((item) => {
    // Note: the `initialIndent` option above works because we specifically
    //       do *not* pass it down the rabbit hole here.
    if (item.element === 'member') {
      // This is an object type or something similar.
      objectLike = true;
      /* eslint-disable no-use-before-define */
      renderedContent += handle(item.key.toValue(), item.value, {
        parent: element,
        spaces,
        marker,
        attributesElement: item,
      });
      /* eslint-enable no-use-before-define */
    } else if (item.element === 'ref') {
      renderedContent += `${marker} Include ${item.content.href}\n`;
    } else if (item.element === 'select') {
      // This is a `OneOf` mutually exclusive type. Currently not
      // supported as it needs some support upstream in Minim.
      console.warn('MSON select/option elements are not yet supported!');
    } else {
      // This is an array type or something similar.
      objectLike = false;
      /* eslint-disable no-use-before-define */
      renderedContent += handle(item.title.toValue(), item, {
        parent: element,
        spaces,
        marker,
      });
      /* eslint-enable no-use-before-define */
    }
  });

  return [renderedContent, objectLike];
}

/*
 * Handle the description and any element content, including support
 * for both inline and long-form descriptions.
 */
function handleDescription(description, element, parent, spaces, marker) {
  const elementName = element.element;
  let str = '';

  // This flag determines when to use a block description within a list entry
  // instead of just ending the list entry line with the description. This
  // means that some other special values like `+ Properties` will get used
  // later during rendering.
  let useLongDescription = false;
  if (element.attributes &&
      (element.attributes.default !== undefined ||
       element.attributes.sample !== undefined)) {
    useLongDescription = true;
  }

  // Finally, an optional description
  if (description && description.toValue()) {
    if (description.toValue().indexOf('\n') !== -1) {
      // Multiline description, so we can't use the short form!
      useLongDescription = true;
    }

    if (useLongDescription) {
      str += `\n${description.toValue()}`;
    } else {
      str += ` - ${description.toValue()}`;
    }
  }

  // Handle special list items like default/sample here as they are part
  // of the description, before the content (sub-elements) are rendere.
  const defaultValue = element.attributes &&
                       element.attributes.getValue('default');
  if (defaultValue !== undefined) {
    str += `\n${marker} Default: ${defaultValue}\n`;
  }

  const sampleValue = element.attributes &&
                      element.attributes.getValue('samples');
  if (sampleValue !== undefined) {
    str += `\n${marker} Sample: ${sampleValue}\n`;
  }

  // Now, depending on the content type, we will recursively handle child
  // elements within objects and arrays.
  if (element.content && Array.isArray(element.content) && element.content.length) {
    str += '\n';

    if (!parent) {
      // No parent implies a data structure or attribute definition, so
      // buffer it with an extra space.
      str += '\n';
    }

    const [renderedContent, objectLike] = handleContent(element, spaces, marker);

    if (!useLongDescription) {
      str += renderedContent;
    } else if (renderedContent.length) {
      // There is rendered content
      if (objectLike) {
        str += `\n${marker} Properties\n`;
      } else if (elementName === 'enum') {
        // An enum is a special case where the content is a list
        // but you use `Members` rather than `Items`.
        str += `\n${marker} Members\n`;
      } else {
        str += `\n${marker} Items\n`;
      }

      str += indent(renderedContent, spaces, { first: true });
    }
  }

  return str;
}

/*
 * Handle the rendering of an element based on its element type. This function
 * will call itself recursively to handle child elements for objects and
 * arrays.
 */
function handle(name, element, { parent = null, spaces = 4, marker = '+',
                                 initialMarker = '+',
                                 initialIndent = true,
                                 attributesElement = element }) {
  let str = initialMarker;

  // Start with the item name if it has one.
  if (name) {
    str += ` ${name}`;
  }

  if (element) {
    // Next, comes the optional example value
    if (element.content && typeof element.content !== 'object') {
      if (parent && parent.element !== 'array') {
        str += ':';
      }

      str += ` ${element.content}`;
    }

    // Then the type and attribute information (e.g. required)
    const attributes = getTypeAttributes(element, attributesElement.attributes,
                                       parent);
    if (attributes.length) {
      str += ` (${attributes.join(', ')})`;
    }

    str += handleDescription(attributesElement.description,
                             element, parent, spaces, marker);
  }

  // Return the entire block indented to the correct number of spaces.
  if (initialIndent) {
    str = indent(str, spaces);
  }

  return `${str}\n`;
}

/*
 * Render out a piece of MSON from refract element instances.
 */
export function renderDataStructure(dataStructure) {
  let mson = dataStructure.content;

  if (Array.isArray(mson)) {
    mson = mson[0];
  }

  const title = mson.id;

  return handle(title.toValue(), mson, {
    initialMarker: '###',
    initialIndent: false,
  });
}

export function renderAttributes(dataStructure) {
  let mson = dataStructure.content;

  if (Array.isArray(mson)) {
    mson = mson[0];
  }

  return handle('Attributes', mson, {
    initialMarker: '+',
    initialIndent: true,
  });
}

export default { renderDataStructure, renderAttributes };
