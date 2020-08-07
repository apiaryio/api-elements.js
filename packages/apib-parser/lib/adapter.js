// API Blueprint parser for Fury.js

const deckardcain = require('deckardcain');

let drafter;

try {
  // eslint-disable-next-line import/no-unresolved, global-require
  drafter = require('protagonist');
} catch (error) {
  // eslint-disable-next-line global-require
  drafter = require('drafter.js');
}

const name = 'api-blueprint';
const mediaTypes = [
  'text/vnd.apiblueprint',
  'text/vnd.apiblueprint+markdown',
];

const detect = source => mediaTypes.indexOf(deckardcain.identify(source)) !== -1;

function validate({ source, requireBlueprintName }) {
  const options = {
    requireBlueprintName,
  };

  return drafter.validate(source, options);
}

/*
 * Parse an API Blueprint into refract elements.
 */
function parse({
  source, generateSourceMap, generateMessageBody, generateMessageBodySchema,
  requireBlueprintName,
}) {
  const options = {
    exportSourcemap: !!generateSourceMap,
    generateMessageBody,
    generateMessageBodySchema,
    requireBlueprintName,
  };

  const formatLink = {
    links: {
      element: 'array',
      content: [
        {
          element: 'link',
          meta: {
            title: {
              element: 'string',
              content: 'Apiary Blueprint',
            },
          },
          attributes: {
            relation: {
              element: 'string',
              content: 'via',
            },
            href: {
              element: 'string',
              content: 'https://apiary.io/blueprint',
            },
          },
        },
      ],
    },
  };

  return drafter.parse(source, options).then((result) => {
    const refractElement = {};
    refractElement.element = result.element;
    refractElement.meta = formatLink;
    refractElement.content = result.content;
    return refractElement;
  });
}

module.exports = {
  name,
  mediaTypes,
  detect,
  validate,
  parse,
};
