# API Element Support

## Category Element

| Class         | Support |
|:--------------|:--------|
| api           | ✓       |
| authSchemes   |         |
| hosts         |         |
| resourceGroup | ✓       |
| scenario      |         |
| transitions   |         |

## Resource Element

| Meta  | Support |
|:------|:--------|
| title | ✓       |

| Attributes    | Support |
|:--------------|:--------|
| hosts         |         |
| href          | ✓       |
| hrefVariables | ✓       |

| Content                | Support |
|:-----------------------|:--------|
| Copy Element           | ✓       |
| Category Element       |         |
| Transition Element     |         |
| Data Structure Element |         |

## Href Variables: Member Element

| Meta        | Support |
|:------------|---------|
| description |         |

| Content | Support |
|:--------|---------|
| key     | ✓       |
| value   |         |

## Transition Element

| Attributes    | Support |
|:--------------|:--------|
| contentTypes  |         |
| hosts         |         |
| href          |         |
| hrefVariables |         |
| relation      |         |

| Content                  | Support |
|:-------------------------|:--------|
| Copy Element             |         |
| HTTP Transaction Element |  ✓      |

## HTTP Transaction Element

| Attributes   | Support |
|:-------------|:--------|
| authSchemes  |         |

| Content       | Support |
|:--------------|:--------|
| Copy Element  |         |
| HTTP Request  |         |
| HTTP Response | ✓       |

## HTTP Request

| Attributes    | Support |
|:--------------|:--------|
| method        | ✓       |
| href          |         |
| hrefVariables |         |
| headers       |         |

| Content         | Support |
|:----------------|:--------|
| Copy            |         |
| Data Structure  |         |
| Asset           |         |

## HTTP Response

| Attributes   | Support |
|:-------------|:--------|
| statusCode   | ✓       |
| headers      |         |

| Content         | Support |
|:----------------|:--------|
| Copy            |         |
| Data Structure  |         |
| Asset           |         |
