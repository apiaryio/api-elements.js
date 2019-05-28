# API Elements JavaScript

This library provides an interface to [API Elements](http://apielements.org) in JavaScript.

## Install

```shell
$ npm install api-elements
```

## Usage

### Node

```javascript
const apiElements = require('api-elements');
const namespace = new apiElements.Namespace();


// Parsing a JSON Representation of API Elements tree
const parseResult = namespace.serialiser.deserialise({
  element: 'parseResult',
  content: []
});

console.log(parseResult);


// Creating API Elements directly
const parseResult = new namespace.elements.ParseResult();
console.log(parseResult);
```

## Elements

### ParseResult ([ArrayElement](https://github.com/refractproject/minim#arrayelement))
An element that holds information about the result of parsing an input.

#### Properties

##### parseResult.annotations
Get an array element of all child elements with the element name `annotation`. This property is **read-only**.

```js
let annotations = parseResult.annotations;
```

##### parseResult.api
Get the first child element with an element name of `category` and a class name of `api`. This property is **read-only**.

```js
let api = parseResult.api;
```

##### parseResult.errors
Get an array element of all child elements with the element name `annotation` and class name `error`. This property is **read-only**.

```js
let errors = parseResult.errors;
```

##### parseResult.warnings
Get an array element of all child elements with the element name `annotation` and class name `warning`. This property is **read-only**.

```js
let warnings = parseResult.warnings;
```

### Annotation ([StringElement](https://github.com/refractproject/minim#stringelement))
An element that annotates the input or parse result with additional information, such as warnings or errors. The content of the annotation contains the text:

```js
console.log(`Warning: ${annotation.toValue()}`);
```

#### Properties

##### annotation.code
An optional warning, error, or other numerical code. This is a shortcut for accessing the element's `code` attribute.

```js
// Show the code
console.log(annotation.code.toValue());

// Set the code
annotation.code = 123;
```

### SourceMap (Element)
An element which maps a component of the parse result to the input via a given list of file locations and lengths.

The content of the source map is an array of locations.

#### Convenience function
You can use a convenience property to retrieve the sourceMap from any element.

```js
// Print [[1, 2]]
console.log(element.sourceMapValue);
```

### Category ([ArrayElement](https://github.com/refractproject/minim#arrayelement))
A grouping element to hold other elements.

#### Properties

##### category.copy
Get an array element of all child elements with the element name `copy`. This property is **read-only**.

```js
let copy = category.copy;
```

##### category.dataStructures
Get an array element of all child elements with the element name `category` and a class name `dataStructures`. This property is **read-only**.

```js
let dataStructures = category.dataStructures;
```

##### category.resources
Get an array element of all child elements with the element name `resource`. This property is **read-only**.

```js
let resources = category.resources;
```

##### category.resourceGroups
Get an array element of all child elements with the element name `category` and a class name `resourceGroup`. This property is **read-only**.

```js
let groups = category.resourceGroups;
```

##### category.scenarios
Get an array element of all child elements with a class name `scenario`. This property is **read-only**.

```js
let scenarios = category.scenarios;
```

##### category.transitions
Get an array element of all child elements with the element name `transition`. This property is **read-only**.

```js
let transitions = category.transitions;
```

##### category.transitionGroups
Get an array element of all child elements with the element name `category` and a class name `transitions`. This property is **read-only**.

```js
let groups = category.transitionGroups;
```

##### category.authSchemes
Get an array element of all child element with element name equal to one of the names given below. This property is **read-only**.

* Basic Authentication Scheme
* Token Authentication Scheme
* OAuth2 Scheme

```js
let schemes = category.authSchemes;
```

##### category.authSchemeGroups
Get an array element of all child elements with the element name `category` and a class name `authSchemes`. This property is **read-only**.

```js
let groups = category.authSchemeGroups;
```

### Copy ([StringElement](https://github.com/refractproject/minim#stringelement))
An element that contains copy text used to describe elements in the API Description namespace. The element's content contains the text:

```js
console.log(`Description: ${copy.toValue()}`);
```

#### Properties

##### copy.contentType
The optional content-type of the element's content.

```js
// Get the content-type
console.log(copy.contentType.toValue());

// Set the content-type
copy.contentType = 'text/markdown';
```

### AuthScheme ([Array Element](https://github.com/refractproject/minim#arrayelement))
This element describes an auth scheme.

#### Properties

##### scheme.copy
Get an array element of all child elements with the element name `copy`. This property is **read-only**.

```js
let copy = scheme.copy;
```

##### scheme.transitions
Get an array element of all child elements with the element name `transition`. This property is **read-only**.

```js
for (const transition of scheme.transitions) {
  console.log(`Transition: ${transition.title}`);
}
```

##### scheme.members
Get an array element of all child elements with the element name `member`. This property is **read-only**.

```js
for (const member of scheme.members) {
  console.log(`Member: ${member.key}`)
}
```

### [DataStructure](http://api-elements.readthedocs.io/en/latest/element-definitions/#data-structure-base-api-element) (Element)
This element describes a data structure.

### Resource ([ArrayElement](https://github.com/refractproject/minim#arrayelement))

#### Properties

##### resource.copy
Get an array element of all child elements with the element name `copy`. This property is **read-only**.

```js
let copy = resource.copy;
```

##### resource.href
The URL template of this resource.

```js
// Get the href
console.log(`URL: ${resource.href.toValue()}`);

// Set the href
resource.href = '/foo/{id}';
```

##### resource.hrefVariables
The description of any variables present in the `resource.href` URL template.

```js
// Get the href variables
console.log(resource.hrefVariables.keys());

// Set the href variables
resource.hrefVariables = {
  id: 'foo'
}
```

##### resource.transitions
Get an array element of all child elements with the element name `transition`. This property is **read-only**.

```js
for (const transition of resource.transitions) {
  console.log(`Transition: ${transition.title.toValue()}`);
}
```

##### resource.dataStructure
Get the first child element with the element name `dataStructure`. This property is **read-only**.

```js
console.log(resource.dataStructure.keys());
```

### Transition ([ArrayElement](https://github.com/refractproject/minim#arrayelement))
This element represents a resource transition.

#### Properties

##### transition.copy
Get an array element of all child elements with the element name `copy`. This property is **read-only**.

```js
let copy = transition.copy;
```

##### transition.method
Get the HTTP method of the transition, if there is one, by finding the first HTTP request and inspecting its method. This property is **read-only**.

```js
let method = transition.method.toValue();
```

##### transition.relation
Defines a relationship to another resource or transition. Useful for hypermedia.

```js
// Get the relation
console.log(`Relation: ${transition.relation.toValue()}`);

// Set the relation
transition.relation = '...';
```

##### transition.href
Overrides the resources URL template with one specific to this transition.

```js
// Get the href
console.log(`URL: ${transition.href.toValue()}`);

// Set the href
transition.href = '/foo/{id}';
```

##### transition.computedHref
Gets either the transition's `href` or the first transaction's request's `href` if it exists, otherwise returns `null`. This property is **read-only**.

```js
console.log(`URL: ${transition.computedHref.toValue()}`);
```

##### transition.hrefVariables
The description of any variables present in the `transition.href` URL template.

```js
// Get the href variables
console.log(transition.hrefVariables.keys());

// Set the href variables
transition.hrefVariables = {
  id: 'foo'
}
```

##### transition.data
The data structure describing the body payload for this transition.

```js
// Get the data attributes
console.log(transition.data.toRefract());

// Set the data attributes
transition.data = minim.toElement({one: 1});
```

##### transition.contentTypes
A list of content types supported by the transition.

```js
// Get the content types
console.log(transition.contentTypes);

// Set the content types
transition.contentTypes = [
  'application/json',
  'application/yaml'
]
```

##### transition.transactions
An array element of HTTP transaction elements. This property is **read-only**.

```js
// Print out each transaction's HTTP request method
for (const transaction of transition.transactions) {
  console.log(`${transaction.request.method}`);
}
```

### HttpTransaction ([ArrayElement](https://github.com/refractproject/minim#arrayelement))
This element represents an HTTP transaction.

#### Properties

##### transaction.request
The HTTP request component of this transaction. It returns an HttpRequest element if one has been defined. This property is **read-only**.

```js
// Get the HTTP request
let request = transaction.request;
```

##### transaction.response
The HTTP response component of this transaction. It returns an HttpResponse element if one has been defined. This property is **read-only**.

```js
// Get the HTTP response
let response = transaction.response;
```

##### transaction.authSchemes
It returns an array of elements derived from AuthScheme elements. This property is **read-only**.

```js
let schemes = transaction.authSchemes;
```

### HttpRequest ([ArrayElement](https://github.com/refractproject/minim#arrayelement))
This element represents an HTTP request.

#### Properties

##### request.copy
Get an array element of all child elements with the element name `copy`. This property is **read-only**.

```js
let copy = request.copy;
```

##### request.method
The HTTP method of this request, e.g. `GET` or `POST`.

```js
// Get the HTTP method
console.log(`HTTP method: ${request.method.toValue()}`);

// Set the HTTP method
request.method = 'PUT';
```

##### request.href
Overrides the resources URL template with one specific to this request.

```js
// Get the href
console.log(`URL: ${request.href.toValue()}`);

// Set the href
request.href = '/foo/{id}';
```

##### request.headers
The HTTP headers for this request. See also the `request.header(name)` shortcut, which will get the values for a header by name.

```js
// Get the headers element
let headers = request.headers;

// Set the headers element
request.headers = new HttpHeaders();
```

##### request.contentType
The computed content type of this request, either from a `Content-Type` header or from the message content. This property is **read-only**.

```js
// Get the content type
console.log(`${request.contentType}`);
```

##### request.dataStructure
The request body data structure, if it exists. This property is **read-only**.

```js
let data = request.dataStructure;
```

##### request.messageBody
The request body content, if it exists. This property is **read-only**.

```js
// Print out the body content as a string
console.log(`Body: ${request.messageBody}`);
```

##### request.messageBodySchema
The request body schema, if it exists. This property is **read-only**.

```js
// Print out the body schema as a string
console.log(`Schema: ${request.messageBodySchema}`);
```

#### Methods

##### request.header(name)
Get a case-insensitive header by name. This returns a **list of strings**, because headers can be defined multiple times.

```js
// Get the content type header
let type = request.header('Content-Type')[0].toValue();
```

### HttpResponse ([ArrayElement](https://github.com/refractproject/minim#arrayelement))
This element represents an HTTP response.

#### Properties

##### response.copy
Get an array element of all child elements with the element name `copy`. This property is **read-only**.

```js
let copy = response.copy;
```

##### response.statusCode
The HTTP status code, e.g. `200` or `404`.

```js
// Get the status code
console.log(`Code: ${response.statusCode.toValue()}`);

// Set the status code
response.statusCode = 400;
```

##### response.headers
The HTTP headers for this response. See also the `response.header(name)` shortcut, which will get the values for a header by name.

```js
// Get the headers element
let headers = response.headers;

// Set the headers element
response.headers = new HttpHeaders();
```

##### response.contentType
The computed content type of this response, either from a `Content-Type` header or from the message content. This property is **read-only**.

```js
// Get the content type
console.log(`${response.contentType.toValue()}`);
```

##### response.dataStructure
The response body data structure, if it exists. This property is **read-only**.

```js
let data = response.dataStructure;
```

##### response.messageBody
The response body content, if it exists. This property is **read-only**.

```js
// Print out the body content as a string
console.log(`Body: ${response.messageBody}`);
```

##### response.messageBodySchema
The response body schema, if it exists. This property is **read-only**.

```js
// Print out the body schema as a string
console.log(`Schema: ${response.messageBodySchema}`);
```

#### Methods

##### response.header(name)
Get a case-insensitive header by name. This returns a **list of strings**, because headers can be defined multiple times.

```js
// Get the content type header
let type = response.header('Content-Type')[0];
```

### Asset (Element)
This element represents an HTTP message payload or schema asset.

#### Properties

##### asset.contentType
The content type of this asset, e.g. `application/json`.

```js
// Get the content type
console.log(`Type: ${asset.contentType.toValue()}`);

// Set the content type
asset.contentType = 'application/yaml';
```

##### asset.href
A link to this asset.

```js
// Get the link
console.log(`Location: ${asset.href.toValue()}`);

// Set the link
asset.href = '/path/to/asset'
```

### HrefVariables ([ObjectElement](https://github.com/refractproject/minim#objectelement))
This element represents a set of URI template variables.

### HttpHeaders ([ArrayElement](https://github.com/refractproject/minim#arrayelement))
This element represents a set of HTTP headers.

#### Methods

##### headers.include(name)
Return a filtered array element of headers with the given case-insensitive name. Each header is a member element where the key is the header name and the value is the header value.

```js
let accept = headers.include('Accept');
```

##### headers.exclude(name)
Return a filtered array element of headers without the given case-insensitive name. Each header is a member element where the key is the header name and the value is the header value.

```js
let filtered = headers.exclude('Content-Type');
```

### Extension (Element)

This element represents the [API Elements extensions](http://api-elements.readthedocs.io/en/latest/element-definitions/#extending-api-elements) element.

#### Properties

##### profile

Gets the extension elements profile href. This property is **read-only**.

```js
let profile = extension.profile.toValue();
```
