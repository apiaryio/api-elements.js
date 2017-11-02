# 0.9.0

- Added browser build distribution

# 0.8.0

- Add support for minim 0.19 and minim-api-description 0.6.

# 0.7.0

- Compatibility with Minim 0.18 and minim-api-description 0.5.

# 0.6.1 - 2017-06-29

- We don't try to re-define `sourceMapValue` on an Element when
  `sourceMapValue` already exists. Such as when you create multiple namespaces
  of minim-parse-result

# 0.6.0 - 2017-06-29

- Updated to support minim 0.17.1.

# 0.5.0 - 2017-05-12

- `sourceMapValue` will return undefined instead of empty array

# 0.4.1 - 2017-05-10

- Added a convenience function for getting source maps called `sourceMapValue`

# 0.4.0 - 2017-04-03

- Annotation.code now returns a Number Element

# 0.3.0 - 2017-03-30

- Upgrade babel-runtime dependency to v6
- Upgrade minim-api-description dependency to 0.2.0
- Drop support for node 0.12 and 0.10

# 0.2.2 - 2016-04-28

- Upgrade minim peerDependency to 0.14.0
- Upgrade minim-api-description dependency to 0.1.4

# 0.2.1 - 2015-11-24

- Fix a bug that was caused by overwriting the base element. This is now accomplished in another way.

# 0.2.0 - 2015-11-24

- Add support for the `sourceMap` element attribute.

# 0.1.0 - 2015-09-08

- Initial release.
