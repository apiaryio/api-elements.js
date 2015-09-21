# 0.1.2 - 2015-09-21

- Fix handling of request/responses with empty bodies but including a description. These must make use of an empty body via `+ Body` or the description is considered the body content.

# 0.1.1 - 2015-09-15

- Fix packaging issue that prevented the template from shipping with the published npm package.
- Fix display of request/response description.
- Fix old reference to `transition.parameters` which is now called `hrefVariables`.

# 0.1.0 - 2015-09-10

- Initial release.
