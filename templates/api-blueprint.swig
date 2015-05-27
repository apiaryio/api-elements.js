FORMAT: 1A
{% if api.meta.HOST %}HOST: {{ api.meta.HOST }}{% endif %}





{% macro renderExample(example) %}
  {% if example.headers && example.headers.length > 1 %}
    + Headers

      {% for header in example.headers.content %}
        {% if header.meta.name.toLowerCase() != 'content-type' %}
        + {{ header.meta.name }}: {{ header.content }}
        {% endif %}
      {% endfor %}

  {% endif %}
  {% if example.messageBody %}
    + Body

            {{ example.messageBody.content|indent(12) }}

  {% endif %}
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
#### {{ transition.title }} ({{ transition.transactions.get(0).request.method }}{% if transition.computedHref %} {{ transition.computedHref }}{% endif %}
{% else %}
#### {{ transition.transactions.get(0).request.method }}{% if transition.computedHref %} {{ transition.computedHref }}{% endif %}
{% endif %}

{{ transition.description }}

{% for transaction in transition.transactions.content %}
  {{ renderTransaction(transaction) }}
{% endfor %}
{% endmacro %}





{% macro renderResource(resource) %}
{% if resource.title %}
### {{ resource.title }} ({{ resource.href }})

{{ resource.description }}
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
{% for resource in group.resources.content %}
  {{ renderResource(resource) }}
{% endfor %}
{% endmacro %}





# {{ api.title|default('API Documentation') }}

{{ api.description }}

{% for item in api.content %}
  {% if item.meta.class.indexOf('resourceGroup') !== -1 %}
    {{ renderGroup(item) }}
  {% endif %}
  {% if item.element === 'resource' %}
    {{ renderResource(item) }}
  {% endif %}
{% endfor %}
