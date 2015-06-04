FORMAT: 1A
{% if api.meta.HOST %}HOST: {{ api.meta.HOST }}{% endif %}





{% macro renderExample(example) %}
{% if example|bodyOnly %}
        {{ example.messageBody.content|indent(8) }}
{% else %}
  {% if example.headers.exclude('Content-Type').length %}
    + Headers

      {% for header in example.headers.exclude('Content-Type').content %}
            {{ header.meta.getProperty('name').content }}: {{ header.content }}
      {% endfor %}

  {% endif %}
  {% if example.dataStructure %}
    {{ example.dataStructure|mson|indent(4) }}
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
    + {{ item.key.toValue() }}{% if item.attributes.typeAttributes %} ({{ item.attributes.typeAttributes }}){% endif %}{% if item.value.meta.description.toValue() %} - {{ item.value.meta.description.toValue() }}{% endif %}
  {% endfor %}

{% endmacro %}






{% macro renderTransaction(transaction) %}
{% if transaction.request && (transaction.request.contentType || transaction.request.headers || transaction.request.dataStructure || transaction.request.messageBody || transaction.request.messageBodySchema) %}
+ Request{% if transaction.request.contentType %} ({{ transaction.request.contentType }}){% endif %}
{{ renderExample(transaction.request) }}
{% endif %}
{% if transaction.response %}
+ Response{% if transaction.response.statusCode %} {{ transaction.response.statusCode }}{% endif %}{% if transaction.response.contentType %} ({{ transaction.response.contentType }}){% endif %}
{{ renderExample(transaction.response) }}
{% endif %}
{% endmacro %}





{% macro renderTransition(transition, href) %}
{% if transition.title %}
#### {{ transition.title }} [{{ transition.transactions.get(0).request.method }}{% if href %} {{ href }}{% elseif transition.computedHref %} {{ transition.computedHref }}{% endif %}]
{% else %}
#### {{ transition.transactions.get(0).request.method }}{% if href %} {{ href }}{% elseif transition.computedHref %} {{ transition.computedHref }}{% endif %}
{% endif %}

{{ transition.description }}

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
{{ resource.dataStructure|mson }}
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
{{ dataStructure|mson }}
{% endfor %}
{% endmacro %}






{% macro renderCategory(category) %}
  {# Categories can contain copy (text) elements, other categories, and resources #}
  {% for item in category.content %}
    {% if item.element === 'copy' %}
{{ item.content }}
    {% endif %}
    {% if item.element === 'category' && item.meta.class.contains('resourceGroup') %}
      {{ renderGroup(item) }}
    {% endif %}
    {% if item.element === 'category' && item.meta.class.contains('dataStructure') %}
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
