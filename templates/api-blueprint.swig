FORMAT: 1A
{% if api.meta.HOST %}HOST: {{ api.meta.HOST }}{% endif %}





{% macro renderExample(example) %}
{% if example|bodyOnly %}
        {{ example.messageBody.content|indent(8) }}
{% else %}
  {% if example.headers && example.headers.exclude('Content-Type').length %}
    + Headers

      {% for header in example.headers.exclude('Content-Type').content %}
            {{ header.key.toValue() }}: {{ header.value.toValue() }}{% endfor %}

  {% endif %}
  {% if example.dataStructure %}
    {{ example.dataStructure.content|mson|indent(4) }}
  {% endif %}
  {% if example.messageBody %}
    + Body

            {{ example.messageBody.content|pretty|indent(12) }}

  {% endif %}
  {% if example.messageBodySchema %}
    + Schema

            {{ example.messageBodySchema.content|pretty|indent(12) }}

  {% endif %}
{% endif %}
{% endmacro %}






{% macro renderParameters(hrefVariables) %}
+ Parameters

  {% for item in hrefVariables.content %}
    {% set typeAttributes = item.attributes.get('typeAttributes') %}
    + {{ item.key.toValue() }}{% if typeAttributes %} ({{ typeAttributes.toValue() }}){% endif %}{% if item.value.description %} - {{ item.value.description }}{% endif %}{% endfor %}

{% endmacro %}






{% macro renderTransaction(transaction) %}
{% set request = transaction.request %}
{% set response = transaction.response %}
{% if request && (request.contentType || request.headers || request.dataStructure || request.messageBody || request.messageBodySchema) %}
+ Request{% if request.contentType %} ({{ request.contentType }}){% endif %}
{{ renderExample(request) }}
{% endif %}
{% if response && response.statusCode %}
+ Response {{ response.statusCode }}{% if response.contentType %} ({{ response.contentType }}){% endif %}
{{ renderExample(response) }}
{% endif %}
{% endmacro %}





{% macro renderTransition(transition, href) %}
{% if transition.title %}
#### {{ transition.title }} [{{ transition.method }}{% if href %} {{ href }}{% elseif transition.computedHref %} {{ transition.computedHref }}{% endif %}]
{% else %}
#### {{ transition.method }}{% if href %} {{ href }}{% elseif transition.computedHref %} {{ transition.computedHref }}{% endif %}
{% endif %}

{{ transition.description }}

{% for copy in transition|getCopy %}
{{ copy.content }}
{% endfor %}

{% if transition.parameters.length %}
  {{ renderParameters(transition.parameters) }}
{% endif %}

{% if transition.relation %}
+ Relation: {{ transition.relation }}
{% endif %}

{% for transaction in transition.transactions.content %}
  {{ renderTransaction(transaction) }}
{% endfor %}
{% endmacro %}





{% macro renderResource(resource) %}
{% if !resource|resourceShorthand %}
{% set href = null %}
### {{ resource.title|default('Resource') }} [{{ resource.href }}]

{{ resource.description }}

{% for copy in resource|getCopy %}
{{ copy.content }}
{% endfor %}
{% else %}
  {#
    We are using the shorthand, make sure to pass any href down to the
    transition layer.
  #}
  {% set href = resource.href %}
{% endif %}
{% if resource.hrefVariables.length %}
{{ renderParameters(resource.hrefVariables) }}
{% endif %}
{% if resource.dataStructure %}
{{ resource.dataStructure.content|mson }}
{% endif %}
{% for transition in resource.transitions.content %}
  {{ renderTransition(transition, href) }}
{% endfor %}
{% endmacro %}





{% macro renderGroup(group) %}
## Group {{ group.title }}

{{ group.description }}

{{ renderCategory(group) }}
{% endmacro %}





{% macro renderDataStructures(dataStructures) %}
## Data Structures

{% for dataStructure in dataStructures.content %}
{{ dataStructure.content|mson }}
{% endfor %}
{% endmacro %}






{% macro renderCategory(category) %}
  {# Categories can contain copy (text) elements, other categories, and resources #}
  {% for item in category.content %}
    {% if item.element === 'copy' %}
{{ item.content }}
    {% endif %}
    {% if item.element === 'category' && item.classes.contains('resourceGroup') %}
      {{ renderGroup(item) }}
    {% endif %}
    {% if item.element === 'category' && item.classes.contains('dataStructures') %}
      {{ renderDataStructures(item) }}
    {% endif %}
    {% if item.element === 'resource' %}
      {{ renderResource(item) }}
    {% endif %}
  {% endfor %}
{% endmacro %}






# {{ api.title|default('API Documentation') }}

{{ api.description }}

{{ renderCategory(api) }}
