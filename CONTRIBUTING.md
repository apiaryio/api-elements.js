# Contributing Guide

## Documentation

The documentation is built using Sphinx, a Python tool. Assuming you have
Python 3 installed, the following steps can be used to build the site.

```shell
$ python3 -m venv venv
$ source venv/bin/activate
$ cd docs/
$ pip install -r requirements.txt
```

## Running the Development Server

You can run a local development server to preview changes using the following:

```shell
$ make watch
```
