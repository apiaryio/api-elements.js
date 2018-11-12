const R = require('ramda');
const yaml = require('yaml-js');

function parse(source, minim) {
  function convert(node) {
    let element;

    if (node.tag === 'tag:yaml.org,2002:map') {
      element = new minim.elements.Object(node.value.map((nodes) => {
        const key = convert(nodes[0]);
        const value = convert(nodes[1]);
        return new minim.elements.Member(key, value);
      }));
    } else if (node.tag === 'tag:yaml.org,2002:seq') {
      element = new minim.elements.Array(node.value.map(convert));
    } else if (node.tag === 'tag:yaml.org,2002:str') {
      element = new minim.elements.String(node.value);
    } else if (node.tag === 'tag:yaml.org,2002:int' || node.tag === 'tag:yaml.org,2002:float') {
      element = new minim.elements.Number(Number(node.value));
    } else if (node.tag === 'tag:yaml.org,2002:bool') {
      element = new minim.elements.Boolean(Boolean(node.value));
    } else if (node.tag === 'tag:yaml.org,2002:null') {
      element = new minim.elements.Null();
    } else {
      // FIXME: Unsupported: binary, timestamp, omap, pairs, set
      throw new Error('Unsupported YAML node');
    }

    if (element) {
      const sourceMap = new minim.elements.SourceMap([
        [
          node.start_mark.pointer,
          node.end_mark.pointer - node.start_mark.pointer
        ]
      ]);

      element.attributes.set('sourceMap', new minim.elements.Array([sourceMap]));
    }

    return element;
  }

  const parseResult = new minim.elements.ParseResult();
  let ast;

  try {
    ast = yaml.compose(source);
  } catch (error) {
    const sourceMap = new minim.elements.SourceMap([
      [error.context_mark.pointer, 1]
    ]);

    const annotation = new minim.elements.Annotation(
      `YAML Syntax: ${error.context}`,
      { classes: ['error'] },
      { sourceMap: new minim.elements.Array([sourceMap]) }
    );

    parseResult.push(annotation);
    return parseResult;
  }

  const result = convert(ast);
  result.freeze();
  parseResult.push(result);
  return parseResult;
}


module.exports = parse;
