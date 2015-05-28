FORMAT: 1A
{% if api.meta.HOST %}HOST: {{ api.meta.HOST }}{% endif %}





{% macro renderExample(example) %}
{% if example|bodyOnly %}
        {{ example.messageBody.content|indent(8) }}
{% else %}
  {% if example.headers && example.headers.length > 1 %}
    + Headers

      {% for header in example.headers.content %}
        {% if header.meta.name.toLowerCase() != 'content-type' %}
            {{ header.meta.name }}: {{ header.content }}
        {% endif %}
      {% endfor %}

  {% endif %}
  {% if example.messageBody %}
    + Body

            {{ example.messageBody.content|indent(12) }}

  {% endif %}
  {% if example.messageBodySchema %}
    + Schema

            {{ example.messageBodySchema.content|indent(12) }}

  {% endif %}
{% endif %}
{% endmacro %}






{% macro renderParameters(hrefVariables) %}
+ Parameters

  {% for hrefVar in hrefVariables.content %}
    + {{ hrefVar.meta.name }}{% if hrefVar.attributes.typeAttributes %} ({{ hrefVar.attributes.typeAttributes }}){% endif %}{% if hrefVar.meta.description %} - {{ hrefVar.meta.description }}{% endif %}
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





{% macro renderTransition(transition) %}
{% if transition.title %}
#### {{ transition.title }} [{{ transition.transactions.get(0).request.method }}{% if transition.computedHref %} {{ transition.computedHref }}{% endif %}]
{% else %}
#### {{ transition.transactions.get(0).request.method }}{% if transition.computedHref %} {{ transition.computedHref }}{% endif %}
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
{% if resource.title %}
### {{ resource.title }} [{{ resource.href }}]

{{ resource.description }}
{% endif %}
{% if resource.hrefVariables.length %}
{{ renderParameters(resource.hrefVariables) }}
{% endif %}
{% for transition in resource.transitions.content %}
  {{ renderTransition(transition) }}
{% endfor %}
{% endmacro %}





{% macro renderGroup(group) %}
{% if group.title || group.description %}
## Group {{ group.title }}

{{ group.description }}
{% endif %}
{{ renderCategory(group) }}
{% endmacro %}





{% macro renderCategory(category) %}
  {# Categories can contain copy (text) elements, other categories, and resources #}
  {% for item in category.content %}
    {% if item.element === 'copy' %}
{{ item.content }}
    {% endif %}
    {% if item.element === 'category' && item.meta.class.indexOf('resourceGroup') !== -1 %}
      {{ renderGroup(item) }}
    {% endif %}
    {% if item.element === 'resource' %}
      {{ renderResource(item) }}
    {% endif %}
  {% endfor %}
{% endmacro %}






# {{ api.title|default('API Documentation') }}

{{ api.description }}

{{ renderCategory(api) }}
