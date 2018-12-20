const yaml = require('yaml-js');

function parse(source, namespace) {
  function convert(node) {
    let element;

    if (node.tag === 'tag:yaml.org,2002:map') {
      element = new namespace.elements.Object(node.value.map((nodes) => {
        const key = convert(nodes[0]);
        const value = convert(nodes[1]);
        return new namespace.elements.Member(key, value);
      }));
    } else if (node.tag === 'tag:yaml.org,2002:seq') {
      element = new namespace.elements.Array(node.value.map(convert));
    } else if (node.tag === 'tag:yaml.org,2002:str') {
      element = new namespace.elements.String(node.value);
    } else if (node.tag === 'tag:yaml.org,2002:int' || node.tag === 'tag:yaml.org,2002:float') {
      element = new namespace.elements.Number(Number(node.value));
    } else if (node.tag === 'tag:yaml.org,2002:bool') {
      element = new namespace.elements.Boolean(Boolean(node.value));
    } else if (node.tag === 'tag:yaml.org,2002:null') {
      element = new namespace.elements.Null();
    } else {
      // FIXME: Unsupported: binary, timestamp, omap, pairs, set
      throw new Error('Unsupported YAML node');
    }

    if (element) {
      const sourceMap = new namespace.elements.SourceMap([
        [
          node.start_mark.pointer,
          node.end_mark.pointer - node.start_mark.pointer,
        ],
      ]);

      element.attributes.set('sourceMap', new namespace.elements.Array([sourceMap]));
    }

    return element;
  }

  const parseResult = new namespace.elements.ParseResult();
  let ast;

  try {
    ast = yaml.compose(source);
  } catch (error) {
    const sourceMap = new namespace.elements.SourceMap([
      [error.context_mark.pointer, 1],
    ]);

    const annotation = new namespace.elements.Annotation(
      `YAML Syntax: ${error.context}`,
      { classes: ['error'] },
      { sourceMap: new namespace.elements.Array([sourceMap]) }
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
