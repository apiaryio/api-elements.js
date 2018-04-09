API Elements (JS)
=================

Installation
------------

.. code-block:: shell

    $ npm install api-elements

Usage
-----

.. code-block:: javascript

    const apiElements = require('api-elements');
    const namespace = new apiElements.Namespace();


    // Parsing a JSON Representation of API Elements tree
    const parseResult = namespace.serialiser.deserialise({
      element: 'parseResult',
      content: []
    });

    console.log(parseResult);


    // Creating API Elements directly
    const parseResult = new namespace.elements.ParseResult();
    console.log(parseResult);

API Reference
-------------

.. toctree::
   :maxdepth: 3

   api

Indices and tables
==================

* :ref:`genindex`
* :ref:`search`
