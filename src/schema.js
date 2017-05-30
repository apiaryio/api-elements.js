import _ from 'lodash';

export default class DataStructureGenerator {
  constructor(minim) {
    this.minim = minim;
  }

  generateMember(name, property) {
    const {
      String: StringElement,
      Member: MemberElement,
    } = this.minim.elements;

    const member = new MemberElement();
    member.key = new StringElement(name);
    member.value = this.generateElement(property);

    if (property.description) {
      member.description = property.description;
    }

    return member;
  }

  generateElement(schema) {
    const {
      String: StringElement,
      Number: NumberElement,
      Boolean: BooleanElement,
      Object: ObjectElement,
      Array: ArrayElement,
      Null: NullElement,
    } = this.minim.elements;

    let element;

    // TODO allOf
    // TODO anyOf
    // TODO oneOf
    // TODO not

    if (schema.type === 'string') {
      element = new StringElement();
      // TODO pattern
      // TODO maxLength
      // TODO minLength
    } else if (schema.type === 'boolean') {
      element = new BooleanElement();
    } else if (schema.type === 'number') {
      element = new NumberElement();
      // TODO multipleOf
      // TODO maximum
      // TODO exclusiveMaximum
      // TODO minimum
      // TODO exclusiveMinimum
    } else if (schema.type === 'null') {
      element = new NullElement();
    } else if (schema.type === 'object') {
      element = new ObjectElement();

      if (schema.properties) {
        element.content = _.map(schema.properties, (subschema, property) => {
          const member = this.generateMember(property, subschema);

          const required = schema.required && schema.required.includes(property);
          member.attributes.typeAttributes = new ArrayElement([
            new StringElement(required ? 'required' : 'optional'),
          ]);

          return member;
        });
      }

      // TODO maxProperties
      // TODO minProperties
      // TODO patternProperties
      // TODO additionalProperties
    } else if (schema.type === 'array') {
      element = new ArrayElement();

      if (schema.items) {
        if (_.isArray(schema.items)) {
          schema.items.forEach((item) => {
            element.push(this.generateElement(item));
          });
        } else {
          element.push(this.generateElement(schema.items));
        }
      }

      // TODO additionalItems
      // TODO maxItems
      // TODO minItems
      // TODO uniqueItems
      // TODO contains
    } else if (_.isArray(schema.type)) {
      // TODO: Support multiple `type`
    }

    if (element) {
      if (schema.title) {
        element.title = new StringElement(schema.title);
      }

      if (schema.description) {
        element.description = new StringElement(schema.description);
      }

      if (schema.default !== undefined && !_.isArray(schema.default) && !_.isObject(schema.default)) {
        // TODO Support defaults for arrays and objects
        element.attributes.set('default', schema.default);
      }

      if (schema.examples && (schema.type === 'string' || schema.type === 'boolean' || schema.type == 'number')) {
        // TODO examples for array/object or multiple types
        element.attributes.set('samples', schema.examples);
      }
    }

    return element;
  }

  generateDataStructure(schema) {
    const { DataStructure } = this.minim.elements;
    const element = this.generateElement(schema);
    const dataStructure = new DataStructure(element);
    return dataStructure;
  }
}
