const minim = require('minim');

const ParseResult = require('./elements/ParseResult');
const Annotation = require('./elements/Annotation');
const SourceMap = require('./elements/SourceMap');
const HttpHeaders = require('./elements/HttpHeaders');
const HrefVariables = require('./elements/HrefVariables');
const Asset = require('./elements/Asset');
const HttpRequest = require('./elements/HttpRequest');
const HttpResponse = require('./elements/HttpResponse');
const AuthScheme = require('./elements/AuthScheme');
const HttpTransaction = require('./elements/HttpTransaction');
const Transition = require('./elements/Transition');
const Resource = require('./elements/Resource');
const DataStructure = require('./elements/DataStructure');
const Copy = require('./elements/Copy');
const Category = require('./elements/Category');
const Extension = require('./elements/Extension');
const Enum = require('./elements/Enum');

const defineValueOf = require('./define-value-of');
const defineSourceMapValue = require('./define-source-map-value');

class Namespace extends minim.Namespace {
  constructor() {
    super();

    this.register('parseResult', ParseResult);
    this.register('annotation', Annotation);
    this.register('sourceMap', SourceMap);

    this.register('enum', Enum);
    this.register('httpHeaders', HttpHeaders);
    this.register('hrefVariables', HrefVariables);
    this.register('asset', Asset);
    this.register('httpRequest', HttpRequest);
    this.register('httpResponse', HttpResponse);
    this.register('authScheme', AuthScheme);
    this.register('Basic Authentication Scheme', AuthScheme);
    this.register('Token Authentication Scheme', AuthScheme);
    this.register('OAuth2 Scheme', AuthScheme);
    this.register('httpTransaction', HttpTransaction);
    this.register('transition', Transition);
    this.register('resource', Resource);
    this.register('dataStructure', DataStructure);
    this.register('copy', Copy);
    this.register('category', Category);
    this.register('extension', Extension);

    defineValueOf();
    defineSourceMapValue();
  }
}


const namespace = new Namespace();


module.exports = namespace;
module.exports.Namespace = Namespace;
