const minim = require('minim');
const minimParseResult = require('minim-parse-result');


class Namespace extends minim.Namespace {
  constructor() {
    super();
    this.use(minimParseResult);
  }
}


const namespace = new Namespace();


module.exports = namespace;
module.exports.Namespace = Namespace;
