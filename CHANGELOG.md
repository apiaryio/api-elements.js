# 0.3.0 - 2017-03-30

- Upgrade babel-runtime dependency to v6
- Drop support for node 0.12 and 0.10

# 0.2.0 - 2017-01-24

## Enhancements

- Adds support for Fury ~> 2.3.

## Bug Fixes

- Fixes handling of parameter descriptions.
- Fixes handling of MSON data structures and MSON attributes.

# 0.1.2 - 2015-09-21

- Fix handling of request/responses with empty bodies but including a description. These must make use of an empty body via `+ Body` or the description is considered the body content.

# 0.1.1 - 2015-09-15

- Fix packaging issue that prevented the template from shipping with the published npm package.
- Fix display of request/response description.
- Fix old reference to `transition.parameters` which is now called `hrefVariables`.

# 0.1.0 - 2015-09-10

- Initial release.
