# API Elements (JavaScript) CHANGELOG

## 0.3.2 (2020-09-23)

### Bug Fixes

- Inherit fixed attribute in `valueOf`

### Enhancements

- Dereference elements in valueOf

## 0.3.1 (2020-09-07)

### Bug Fixes

- Generating a value from an element will now prefer sample/default values for
  objects which contain only undefined property values.

## 0.3.0 (2020-08-05)

### Bug Fixes

- Generating a value from an element will now prefer sample/default values for
  arrays which contain empty primitive values.

## 0.2.6 (2020-07-01)

### Bug Fixes

- Fixes the `hosts` property in api category to return the hosts category.

## 0.2.5 (2020-06-13)

### Bug Fixes

- Prevent `valueOf` from throwing an error while handling an object element
  which contains a member element which does not include a value.

## 0.2.4 (2020-04-20)

### Enhancements

- Added `hosts` properties on `Resource` and `Transition` to access the "hosts"
  resources stored in the element attributes. `Cateogory` elements contain
  `hosts` so that you can access hosts categories from the "api" category.

## 0.2.3 (2019-12-05)

Internal changes.

## 0.2.2 (2019-07-02)

Internal changes.

## 0.2.1 (2019-06-19)

### Enhancements

- Performance of the `valueOf` has been improved under certain cases.

## 0.2.0 (2019-06-11)

### Breaking

- Support for NodeJS 6 has been removed, upgrading to NodeJS 8 or newer is
  recommended.

### Enhancements

- Added the `hrefVariables` property to `HttpRequest` element.

## 0.1.1 (2019-03-26)

### Enhancements

- Update minim to 0.22.1, minim-parse-result 0.11.1.

## 0.1.0

Initial Release.
