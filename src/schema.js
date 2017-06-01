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

    const validationDescriptions = [];

    let element;

    // TODO allOf
    // TODO anyOf
    // TODO oneOf
    // TODO not

    if (schema.enum) {
      element = new ArrayElement(schema.enum);
      element.element = 'enum';
    } else if (schema.type === 'string') {
      element = new StringElement();

      if (schema.pattern) {
        validationDescriptions.push(`Matches regex pattern: \`${schema.pattern}\``);
      }

      if (schema.maxLength) {
        validationDescriptions.push(`Length of string must be less than, or equal to ${schema.maxLength}`);
      }

      if (schema.minLength) {
        validationDescriptions.push(`Length of string must be greater than, or equal to ${schema.minLength}`);
      }
    } else if (schema.type === 'boolean') {
      element = new BooleanElement();
    } else if (schema.type === 'number') {
      element = new NumberElement();

      if (schema.multipleOf) {
        validationDescriptions.push(`Number must be a multiple of ${schema.multipleOf}`);
      }

      if (schema.maximum) {
        validationDescriptions.push(`Number must less than, or equal to ${schema.maximum}`);
      }

      if (schema.minimum) {
        validationDescriptions.push(`Number must more than, or equal to ${schema.minimum}`);
      }

      if (schema.exclusiveMaximum) {
        validationDescriptions.push(`Number must be less than ${schema.exclusiveMaximum}`);
      }

      if (schema.exclusiveMinimum) {
        validationDescriptions.push(`Number must be more than ${schema.exclusiveMinimum}`);
      }
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

      if (schema.maxProperties) {
        validationDescriptions.push(`Object must have less than, or equal to ${schema.maxProperties} properties`);
      }

      if (schema.minProperties) {
        validationDescriptions.push(`Object must have more than, or equal to ${schema.minProperties} properties`);
      }

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

      if (schema.maxItems) {
        validationDescriptions.push(`Array length must be less than, or equal to ${schema.maxItems}`);
      }

      if (schema.minItems) {
        validationDescriptions.push(`Array length must be more than, or equal to ${schema.minItems}`);
      }

      if (schema.uniqueItems) {
        validationDescriptions.push('Array contents must be unique');
      }

      // TODO additionalItems
      // TODO contains
    } else if (_.isArray(schema.type)) {
      // TODO: Support multiple `type`
    }

    if (schema.format) {
      validationDescriptions.push(`Value must be of format '${schema.format}'`);
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

      if (validationDescriptions.length > 0) {
        let description = validationDescriptions
          .map((description) => { return '- ' + description})
          .join('\n');

        if (element.description && element.description.toValue()) {
          description = element.description.toValue() + '\n\n' + description;
        }

        element.description = new StringElement(description);
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
