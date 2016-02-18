// Test out the Swagger adapter in Fury to convert Swagger 2.0 documents
// into Refract elements.
const source = `
swagger: '2.0'
info:
  version: '1.0.0'
  title: Swagger Test
  description: Minimal Swagger test example
host: api.example.com
schemes:
  - https
paths:
  /test:
    get:
      responses:
        200:
          description: I am a description
          examples:
            'application/json':
                status: ok
`;

const fury = require('fury');
fury.use(require('fury-adapter-swagger'));

fury.parse({source}, (err, result) => {
    if (err) { console.log(err) }
    if (result) {
        // Print out the refract to make overview and copy/paste easy
        console.log(JSON.stringify(result.toRefract(), null, 2));
        // Output the js objects so you can inspect each element
        console.log(result.toRefract());
    }
});
