// A module for dealing with YAML syntax trees and looking up source map
// location information.

const _ = require('lodash');
const yamlAst = require('yaml-js');

class Ast {
  constructor(source) {
    this.root = yamlAst.compose(source);
  }

  // Look up a position in the original source based on a JSON path, for
  // example ['paths', '/test', 'get', 'responses', '200']. Also supported
  // is using a string ('paths./test.get') but it does not understand any
  // escaping.
  getPosition(path) {
    const pieces = _.isArray(path) ? [].concat(path) : path.split('.');
    let end;
    let node = this.root;
    let piece = pieces.shift();
    let start;

    if (!node) {
      return null;
    }

    while (piece !== undefined) {
      let newNode = null;

      if (node.tag === 'tag:yaml.org,2002:map') {
        // This is a may / object with key:value pairs.
        // eslint-disable-next-line no-restricted-syntax
        for (const subNode of node.value) {
          if (subNode[0] && subNode[0].value === piece) {
            [, newNode] = subNode;

            if (!pieces.length) {
              // This is the last item!
              start = subNode[0].start_mark;
              end = subNode[1].end_mark;
            }
            break;
          }
        }
      } else if (node.tag === 'tag:yaml.org,2002:seq') {
        // This is a sequence, i.e. array. Access it by index.
        newNode = node.value[piece];

        if (!pieces.length) {
          // This is the last item!

          if (!newNode && piece > 0 && node.value[piece - 1]) {
            // Element in sequence does not exist. It could have been empty
            // Let's provide the end of previous element
            start = node.value[piece - 1].end_mark;
            end = start;
          } else {
            start = newNode.start_mark;
            end = newNode.end_mark;
          }
        }
      } else {
        // Unknown piece, which will just return no source map.
        return null;
      }

      if (newNode) {
        node = newNode;
      } else {
        // We have no other node so return whatever we have.
        // Better than nothing init?
        return { start, end };
      }

      piece = pieces.shift();
    }

    return { start, end };
  }
}

module.exports = Ast;
