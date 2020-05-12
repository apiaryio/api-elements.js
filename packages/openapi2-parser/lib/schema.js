/* eslint-disable class-methods-use-this, arrow-body-style */

const _ = require('lodash');
const { parseReference, lookupReference, dereference } = require('./json-schema');

const idForDataStructure = (reference) => {
  return `definitions/${parseReference(reference)}`;
};

/*
 * Data Structure Generator
 * Generates a dataStructure element from a Swagger Schema.
 *
 * >>> const generator = new DataStructureGenerator(minimNamespace);
 * >>> const dataStructure = generator.generateDataStructure({type: 'string'});
*/
class DataStructureGenerator {
  constructor(minim, root) {
    this.minim = minim;
    this.root = root;
  }

  // Generates a data structure element representing the given schema
  generateDataStructure(schema) {
    const element = this.generateElement(schema);

    if (!element) {
      return null;
    }

    const { DataStructure } = this.minim.elements;
    const dataStructure = new DataStructure(element);
    return dataStructure;
  }

  // Generates a member element for a property in a schema
  generateMember(name, property) {
    const {
      String: StringElement,
      Member: MemberElement,
    } = this.minim.elements;

    const member = new MemberElement();
    member.key = new StringElement(name);
    member.value = this.generateElement(property);
    return member;
  }

  // Generates an enum element for the given enum schema
  generateEnum(schema) {
    const { Enum: EnumElement } = this.minim.elements;

    const element = new EnumElement();

    element.enumerations = schema.enum;

    // eslint-disable-next-line no-restricted-syntax
    for (const enumeration of element.enumerations) {
      enumeration.attributes.set('typeAttributes', ['fixed']);
    }

    return element;
  }

  // Generates an object element from the given object schema
  generateObject(schema) {
    const {
      Object: ObjectElement,
    } = this.minim.elements;

    const element = new ObjectElement();
    let properties = schema.properties || {};
    let required = schema.required || [];

    if (schema.allOf && Array.isArray(schema.allOf)) {
      // Merge all of the object allOf into properties and required
      const allOf = schema.allOf.filter(subschema => subschema.type === 'object');

      const allProperties = allOf
        .filter(subschema => subschema.properties)
        .map(subschema => subschema.properties);
      properties = Object.assign(properties, ...allProperties);

      required = allOf
        .filter(subschema => subschema.required)
        .map(subschema => subschema.required)
        .reduce((accumulator, property) => accumulator.concat(property), required);

      const refs = schema.allOf
        .filter(subschema => subschema.$ref)
        .map(subschema => idForDataStructure(subschema.$ref));

      if (refs.length === 1) {
        // allOf contains ref, let's treat it as our base
        [element.element] = refs;
      } else if (refs.length > 1) {
        const { Ref: RefElement } = this.minim.elements;
        const refElements = refs.map(ref => new RefElement(ref));
        element.content.push(...refElements);
      }
    }

    element.content.push(..._.map(properties, (subschema, property) => {
      const member = this.generateMember(property, subschema);

      const isRequired = required.includes(property);
      member.attributes.set('typeAttributes', [
        isRequired ? 'required' : 'optional',
      ]);

      return member;
    }));

    // Create member elements for required keys which are not defined in properties
    const missingRequiredProperties = required.filter(name => properties[name] === undefined);
    const requiredMembers = missingRequiredProperties.map((name) => {
      const member = new this.minim.elements.Member(name);
      member.attributes.set('typeAttributes', ['required']);
      return member;
    });
    element.content.push(...requiredMembers);

    return element;
  }

  // Generates an array element from the given array schema
  generateArray(schema) {
    const { Array: ArrayElement } = this.minim.elements;
    const element = new ArrayElement();

    if (schema.items) {
      element.attributes.set('typeAttributes', ['fixedType']);

      if (_.isArray(schema.items)) {
        schema.items.forEach((item) => {
          const itemElement = this.generateElement(item);
          if (itemElement) {
            element.push(itemElement);
          }
        });
      } else {
        const itemElement = this.generateElement(schema.items);
        if (itemElement) {
          element.push(itemElement);
        }
      }
    }

    return element;
  }

  // Generates an array of descriptions for each validation rule in the given schema.
  generateValidationDescriptions(schema) {
    const validations = {
      // String
      pattern: value => `Matches regex pattern: \`${value}\``,
      maxLength: value => `Length of string must be less than, or equal to ${value}`,
      minLength: value => `Length of string must be greater than, or equal to ${value}`,

      // Number
      multipleOf: value => `Number must be a multiple of ${value}`,
      maximum: value => `Number must be less than, or equal to ${value}`,
      minimum: value => `Number must be more than, or equal to ${value}`,
      exclusiveMaximum: value => `Number must be less than ${value}`,
      exclusiveMinimum: value => `Number must be more than ${value}`,

      // Object
      minProperties: value => `Object must have more than, or equal to ${value} properties`,
      maxProperties: value => `Object must have less than, or equal to ${value} properties`,

      // Array
      maxItems: value => `Array length must be less than, or equal to ${value}`,
      minItems: value => `Array length must be more than, or equal to ${value}`,
      uniqueItems: () => 'Array contents must be unique',

      // Other
      format: value => `Value must be of format '${value}'`,
    };

    return _
      .chain(validations)
      .map((value, key) => {
        if (schema[key]) {
          return value(schema[key]);
        }

        return null;
      })
      .compact()
      .value();
  }

  /**
   * Retrieve the type from the schema
   * In the case where there is no provided type, the allOf types are matched.
   * @param {object} schema
   * @returns {string} type
   */
  typeForSchema(schema) {
    if (schema.$ref) {
      // Peek into the reference, if we're calling typeForSchema from the
      // allOf case below then we will need to know the destination type
      const ref = lookupReference(schema.$ref, this.root);
      return this.typeForSchema(ref.referenced);
    }

    if (schema.type === undefined) {
      if (schema.allOf && schema.allOf.length > 0) {
        // Try to infer type from allOf values
        const allTypes = schema.allOf.map(this.typeForSchema, this);
        const uniqueTypes = _.uniq(allTypes);

        if (uniqueTypes.length === 1) {
          return uniqueTypes[0];
        }
      }
    }

    return schema.type;
  }

  // Generates an element representing the given schema
  generateElement(schema) {
    const {
      String: StringElement,
      Number: NumberElement,
      Boolean: BooleanElement,
      Null: NullElement,
      Enum: EnumElement,
      // Ref: RefElement,
    } = this.minim.elements;

    const typeGeneratorMap = {
      boolean: BooleanElement,
      string: StringElement,
      number: NumberElement,
      integer: NumberElement,
      null: NullElement,
      file: StringElement,
    };

    if (schema.allOf && schema.allOf.length === 1 && schema.definitions
        && Object.keys(schema).length === 2) {
      // Since we can't have $ref at root with definitions.
      // `allOf` with a single item is used as a work around for this type of schema
      // We can safely ignore the allOf and unwrap it as normal schema in this case
      return this.generateElement(schema.allOf[0]);
    }

    const type = this.typeForSchema(schema);

    let element;

    if (schema.$ref) {
      // element = new RefElement(idForDataStructure(schema.$ref));
      element = new this.minim.elements.Element();

      try {
        element.element = idForDataStructure(schema.$ref);
      } catch (error) {
        // Cannot find ID for reference, let's attempt to dereference the value
        // and provide element dereferenced.
        // This may be because we cannot express a reference in API Elements,
        // for example a reference to `#/definitions/User/properties/name`
        const ref = lookupReference(schema.$ref, this.root);
        return this.generateElement(ref.referenced);
      }

      return element;
    } if (schema.enum) {
      element = this.generateEnum(schema);
    } else if (type === 'array') {
      element = this.generateArray(schema);
    } else if (type === 'object') {
      element = this.generateObject(schema);
    } else if (type && typeGeneratorMap[type]) {
      element = new typeGeneratorMap[type]();
    } else if (type) {
      throw new Error(`Unhandled schema type '${type}'`);
    } else {
      element = new this.minim.elements.Enum();
      element.enumerations = [
        new this.minim.elements.String(),
        new this.minim.elements.Number(),
        new this.minim.elements.Boolean(),
        this.generateArray(schema),
        this.generateObject(schema),
      ];
    }

    if (element) {
      if (schema.title) {
        element.title = new StringElement(schema.title);
      }

      if (schema.description) {
        element.description = new StringElement(schema.description);
      }

      if (schema['x-nullable']) {
        element.attributes.set('typeAttributes', ['nullable']);
      }

      let def = schema.default;

      if (def !== undefined && !_.isArray(def) && !_.isObject(def)) {
        // TODO Support defaults for arrays and objects
        if (schema.enum) {
          def = new EnumElement(def);

          def.content.attributes.set('typeAttributes', ['fixed']);
        }

        element.attributes.set('default', def);
      }

      let samples = [];

      if (schema.example) {
        samples = [dereference(schema.example, this.root)];
      }

      if (samples.length > 0) {
        if (schema.enum) {
          samples = samples.map((item) => {
            const enumeration = new EnumElement(item);
            enumeration.content.attributes.set('typeAttributes', ['fixed']);
            return enumeration;
          });
        }

        const hasSample = samples.length === 1 && samples[0];
        const emptyContent = !element.content || element.content.length === 0;

        if (hasSample && emptyContent) {
          // Convert the sample value to an element as a cheap and easy way to
          // check the type matches our element. It will also refract
          // object/array items that are the sample value as members/elements
          // for us so we can grab its content

          const example = this.minim.toElement(samples[0]);

          if (element.element === example.element) {
            element.content = example.content;
          } else {
            element.attributes.set('samples', samples);
          }
        } else {
          element.attributes.set('samples', samples);
        }
      }

      const validationDescriptions = this.generateValidationDescriptions(schema);

      if (validationDescriptions.length > 0) {
        const description = validationDescriptions.map(value => `- ${value}`);

        if (element.description && element.description.toValue()) {
          description.splice(0, 0, `${element.description.toValue()}\n`);
        }

        element.description = new StringElement(description.join('\n'));
      }
    }

    return element;
  }
}

module.exports = { idForDataStructure, DataStructureGenerator };
