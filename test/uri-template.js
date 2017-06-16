import { expect } from 'chai';

import buildUriTemplate from '../src/uri-template';

describe('URI Template Handler', () => {
  context('when there are path object parameters', () => {
    context('when the path object parameters are not query parameters', () => {
      const basePath = '/api';
      const href = '/pet/findByTags';
      const pathObjectParams = [
        {
          in: 'path',
          description: 'Path parameter from path object',
          name: 'fromPath',
          required: true,
          type: 'string',
        },
      ];
      const queryParams = [
        {
          in: 'query',
          description: 'Tags to filter by',
          name: 'tags',
          required: true,
          type: 'string',
        },
        {
          in: 'query',
          description: 'For tests. Unknown type of query parameter.',
          name: 'unknown',
          required: true,
          type: 'unknown',
        },
      ];

      it('returns the correct URI', () => {
        const hrefForResource = buildUriTemplate(basePath, href, pathObjectParams, queryParams);
        expect(hrefForResource).to.equal('/api/pet/findByTags{?tags,unknown}');
      });
    });

    context('when there are no query parameters but have one path object parameter', () => {
      const basePath = '/api';
      const href = '/pet/{id}';
      const pathObjectParams = [
        {
          in: 'path',
          description: 'Pet\'s identifier',
          name: 'id',
          required: true,
          type: 'number',
        },
      ];
      const queryParams = [];

      it('returns the correct URI', () => {
        const hrefForResource = buildUriTemplate(basePath, href, pathObjectParams, queryParams);
        expect(hrefForResource).to.equal('/api/pet/{id}');
      });
    });

    context('when there are query parameters defined', () => {
      const basePath = '/api';
      const href = '/pet/findByTags';
      const pathObjectParams = [
        {
          in: 'query',
          description: 'Query parameter from path object',
          name: 'fromPath',
          required: true,
          type: 'string',
        },
      ];
      const queryParams = [
        {
          in: 'query',
          description: 'Tags to filter by',
          name: 'tags',
          required: true,
          type: 'string',
        },
        {
          in: 'query',
          description: 'For tests. Unknown type of query parameter.',
          name: 'unknown',
          required: true,
          type: 'unknown',
        },
      ];

      it('returns the correct URI', () => {
        const hrefForResource = buildUriTemplate(basePath, href, pathObjectParams, queryParams);
        expect(hrefForResource).to.equal('/api/pet/findByTags{?fromPath,tags,unknown}');
      });
    });

    context('when there are parameters with reserved characters', () => {
      const basePath = '/my-api';
      const href = '/pet/{unique%2did}';
      const queryParams = [
        {
          in: 'query',
          description: 'Tags to filter by',
          name: 'tag-names[]',
          required: true,
          type: 'string',
        },
      ];

      it('returns the correct URI', () => {
        const hrefForResource = buildUriTemplate(basePath, href, [], queryParams);
        expect(hrefForResource).to.equal('/my-api/pet/{unique%2did}{?tag%2dnames%5B%5D}');
      });
    });

    context('when there is a conflict in parameter names', () => {
      const basePath = '/api';
      const href = '/pet/findByTags';
      const pathObjectParams = [
        {
          in: 'query',
          description: 'Tags to filter by',
          name: 'tags',
          required: true,
          type: 'string',
        },
      ];
      const queryParams = [
        {
          in: 'query',
          description: 'Tags to filter by',
          name: 'tags',
          required: true,
          type: 'string',
        },
      ];

      it('only adds one to the query parameters', () => {
        const hrefForResource = buildUriTemplate(basePath, href, pathObjectParams, queryParams);
        expect(hrefForResource).to.equal('/api/pet/findByTags{?tags}');
      });
    });

    context('when there are no query parameters defined', () => {
      const basePath = '/api';
      const href = '/pet/findByTags';
      const pathObjectParams = [
        {
          in: 'query',
          description: 'Query parameter from path object',
          name: 'fromPath',
          required: true,
          type: 'string',
        },
      ];
      const queryParams = [];

      it('returns the correct URI', () => {
        const hrefForResource = buildUriTemplate(basePath, href, pathObjectParams, queryParams);
        expect(hrefForResource).to.equal('/api/pet/findByTags{?fromPath}');
      });
    });
  });

  context('when there are query parameters but no path object parameters', () => {
    const basePath = '/api';
    const href = '/pet/findByTags';
    const pathObjectParams = [];
    const queryParams = [
      {
        in: 'query',
        description: 'Tags to filter by',
        name: 'tags',
        required: true,
        type: 'string',
      },
      {
        in: 'query',
        description: 'For tests. Unknown type of query parameter.',
        name: 'unknown',
        required: true,
        type: 'unknown',
      },
    ];

    it('returns the correct URI', () => {
      const hrefForResource = buildUriTemplate(basePath, href, pathObjectParams, queryParams);
      expect(hrefForResource).to.equal('/api/pet/findByTags{?tags,unknown}');
    });
  });

  context('when there are no query or path object parameters', () => {
    const basePath = '/api';
    const href = '/pet/findByTags';
    const pathObjectParams = [];
    const queryParams = [];

    it('returns the correct URI', () => {
      const hrefForResource = buildUriTemplate(basePath, href, pathObjectParams, queryParams);
      expect(hrefForResource).to.equal('/api/pet/findByTags');
    });
  });

  describe('array parameters with collectionFormat', () => {
    it('returns a template with default format', () => {
      const parameter = {
        in: 'query',
        name: 'tags',
        type: 'array',
      };

      const hrefForResource = buildUriTemplate('', '/example', [parameter]);
      expect(hrefForResource).to.equal('/example{?tags}');
    });

    it('returns a template with csv format', () => {
      const parameter = {
        in: 'query',
        name: 'tags',
        type: 'array',
        collectionFormat: 'csv',
      };

      const hrefForResource = buildUriTemplate('', '/example', [parameter]);
      expect(hrefForResource).to.equal('/example{?tags}');
    });

    it('returns an exploded template with multi format', () => {
      const parameter = {
        in: 'query',
        name: 'tags',
        type: 'array',
        collectionFormat: 'multi',
      };

      const hrefForResource = buildUriTemplate('', '/example', [parameter]);
      expect(hrefForResource).to.equal('/example{?tags*}');
    });
  });
});
