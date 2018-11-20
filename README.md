# API Elements

## Using Lerna

Install dependencies of all packages:

```shell
$ npm install --global yarn
$ yarn
```

> **NOTE**: Please do commit the `yarn.lock` to the GitHub repo

To list all packages:

```shell
$ npx lerna ls -a -l
```

To add a new dependency to a package:

```shell
$ npx lerna add --scope='package_name' dep@version
```

To run tests for a single package:

```shell
$ npx lerna exec --scope='package_name' -- npm run test
```

## Documentation

The documentation is built using Sphinx, a Python tool. Assuming you have
Python 3 installed, the following steps can be used to build the site.

```shell
$ python3 -m venv venv
$ source venv/bin/activate
$ cd docs/
$ pip install -r requirements.txt
```

### Running the Development Server

You can run a local development server to preview changes using the following:

```shell
$ make watch
```
