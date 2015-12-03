import {expect} from 'chai';

import buildUriTemplate from '../src/uri-template';

describe('URI Template Handler', () => {
  context('when there are path object parameters', () => {
    context('when the path object parameters are not query parameters', () => {
      const basePath = '/api';
      const href = '/pet/findByTags';
      const pathObjectParameters = [
        {
          in: 'path',
          description: 'Path parameter from path object',
          name: 'fromPath',
          required: true,
          type: 'string',
        },
      ];
      const queryParameters = [
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
        const hrefForResource = buildUriTemplate(basePath, href, pathObjectParameters, queryParameters);
        expect(hrefForResource).to.equal('/api/pet/findByTags{?tags,unknown}');
      });
    });

    context('when there are no query parameters but have one path object parameter', () => {
      const basePath = '/api';
      const href = '/pet/{id}';
      const pathObjectParameters = [
        {
          in: 'path',
          description: 'Pet\'s identifier',
          name: 'id',
          required: true,
          type: 'number',
        },
      ];
      const queryParameters = [];

      it('returns the correct URI', () => {
        const hrefForResource = buildUriTemplate(basePath, href, pathObjectParameters, queryParameters);
        expect(hrefForResource).to.equal('/api/pet/{id}');
      });
    });

    context('when there are query parameters defined', () => {
      const basePath = '/api';
      const href = '/pet/findByTags';
      const pathObjectParameters = [
        {
          in: 'query',
          description: 'Query parameter from path object',
          name: 'fromPath',
          required: true,
          type: 'string',
        },
      ];
      const queryParameters = [
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
        const hrefForResource = buildUriTemplate(basePath, href, pathObjectParameters, queryParameters);
        expect(hrefForResource).to.equal('/api/pet/findByTags{?fromPath,tags,unknown}');
      });
    });

    context('when there are parameters with dashes', () => {
      const basePath = '/my-api';
      const href = '/pet/{unique-id}';
      const queryParameters = [
        {
          in: 'query',
          description: 'Tags to filter by',
          name: 'tag-names',
          required: true,
          type: 'string',
        },
      ];

      it('returns the correct URI', () => {
        const hrefForResource = buildUriTemplate(basePath, href, [], queryParameters);
        expect(hrefForResource).to.equal('/my-api/pet/{unique%2did}{?tag%2dnames}');
      });
    });

    context('when there is a conflict in parameter names', () => {
      const basePath = '/api';
      const href = '/pet/findByTags';
      const pathObjectParameters = [
        {
          in: 'query',
          description: 'Tags to filter by',
          name: 'tags',
          required: true,
          type: 'string',
        },
      ];
      const queryParameters = [
        {
          in: 'query',
          description: 'Tags to filter by',
          name: 'tags',
          required: true,
          type: 'string',
        },
      ];

      it('only adds one to the query parameters', () => {
        const hrefForResource = buildUriTemplate(basePath, href, pathObjectParameters, queryParameters);
        expect(hrefForResource).to.equal('/api/pet/findByTags{?tags}');
      });
    });

    context('when there are no query parameters defined', () => {
      const basePath = '/api';
      const href = '/pet/findByTags';
      const pathObjectParameters = [
        {
          in: 'query',
          description: 'Query parameter from path object',
          name: 'fromPath',
          required: true,
          type: 'string',
        },
      ];
      const queryParameters = [];

      it('returns the correct URI', () => {
        const hrefForResource = buildUriTemplate(basePath, href, pathObjectParameters, queryParameters);
        expect(hrefForResource).to.equal('/api/pet/findByTags{?fromPath}');
      });
    });
  });

  context('when there are query parameters but no path object parameters', () => {
    const basePath = '/api';
    const href = '/pet/findByTags';
    const pathObjectParameters = [];
    const queryParameters = [
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
      const hrefForResource = buildUriTemplate(basePath, href, pathObjectParameters, queryParameters);
      expect(hrefForResource).to.equal('/api/pet/findByTags{?tags,unknown}');
    });
  });

  context('when there are no query or path object parameters', () => {
    const basePath = '/api';
    const href = '/pet/findByTags';
    const pathObjectParameters = [];
    const queryParameters = [];

    it('returns the correct URI', () => {
      const hrefForResource = buildUriTemplate(basePath, href, pathObjectParameters, queryParameters);
      expect(hrefForResource).to.equal('/api/pet/findByTags');
    });
  });
});
