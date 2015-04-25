{assert} = require 'chai'
markdown = require '../../../lib/legacy/markdown'

describe 'Markdown', ->
  describe '#toHtml', ->
    it 'Parse a plain paragraph', (done) ->
      markdownString = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
      expectedHtml = '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>\n'

      markdown.toHtml markdownString, (error, html) ->
        assert.strictEqual html, expectedHtml
        done error

    it 'Parse a bullet list (stars used as bullets)', (done) ->
      markdownString = '''
      * Red
      * Green
      * Orange
      * Blue
      '''

      expectedHtml = '''
      <ul>
      <li>Red</li>
      <li>Green</li>
      <li>Orange</li>
      <li>Blue</li>
      </ul>

      '''

      markdown.toHtml markdownString, (error, html) ->
        assert.strictEqual html, expectedHtml
        done error

    it 'Parse a bullet list (dashes used as bullets)', (done) ->
      markdownString = '''
      - Red
      - Green
      - Orange
      - Blue
      '''

      expectedHtml = '''
      <ul>
      <li>Red</li>
      <li>Green</li>
      <li>Orange</li>
      <li>Blue</li>
      </ul>

      '''

      markdown.toHtml markdownString, (error, html) ->
        assert.strictEqual html, expectedHtml
        done error

    it 'Parse an ordered list', (done) ->
      markdownString = '''
      1. Red
      2. Green
      3. Orange
      4. Blue
      '''

      expectedHtml = '''
      <ol>
      <li>Red</li>
      <li>Green</li>
      <li>Orange</li>
      <li>Blue</li>
      </ol>

      '''

      markdown.toHtml markdownString, (error, html) ->
        assert.strictEqual html, expectedHtml
        done error

    it 'Parse nested lists', (done) ->
      markdownString = '''
* Lorem
* Ipsum
  * Dolor
  * Ismaet
      '''

      expectedHtml = '''
      <ul>
      <li>Lorem</li>
      <li>Ipsum

      <ul>
      <li>Dolor</li>
      <li>Ismaet</li>
      </ul></li>
      </ul>

      '''

      markdown.toHtml markdownString, (error, html) ->
        assert.strictEqual html, expectedHtml
        done error

    it 'Parse headers', (done) ->
      markdownString = '''
      # Level 1
      ## Level 2
      ### Level 3
      #### Level 4
      ##### Level 5
      ###### Level 6
      '''

      expectedHtml = '''
      <h1>Level 1</h1>

      <h2>Level 2</h2>

      <h3>Level 3</h3>

      <h4>Level 4</h4>

      <h5>Level 5</h5>

      <h6>Level 6</h6>

      '''

      markdown.toHtml markdownString, (error, html) ->
        assert.strictEqual html, expectedHtml
        done error

    it 'Parse a code block', (done) ->
      markdownString = '''
Lorem ipsum dolor isamet.

    alert('Hello!');
      '''

      expectedHtml = '''
      <p>Lorem ipsum dolor isamet.</p>

      <pre><code>alert(&#39;Hello!&#39;);
      </code></pre>

      '''

      markdown.toHtml markdownString, (error, html) ->
        assert.strictEqual html, expectedHtml
        done error

    it 'Parse a fenced code block', (done) ->
      markdownString = '''
      ```
      alert('Hello!');
      ```
      '''

      expectedHtml = '''
      <pre><code>alert(&#39;Hello!&#39;);
      </code></pre>

      '''

      markdown.toHtml markdownString, (error, html) ->
        assert.strictEqual html, expectedHtml
        done error

    it 'Parse a Markdown table', (done) ->
      markdownString = '''
      | First Header  | Second Header | Third Header         |
      | :------------ | :-----------: | -------------------: |
      | First row     | Data          | Very long data entry |
      | Second row    | **Cell**      | *Cell*               |
      | Third row     | Cell that spans across two columns  ||
      '''

      expectedHtml = '''
      <table><thead>
      <tr>
      <th align="left">First Header</th>
      <th align="center">Second Header</th>
      <th align="right">Third Header</th>
      </tr>
      </thead><tbody>
      <tr>
      <td align="left">First row</td>
      <td align="center">Data</td>
      <td align="right">Very long data entry</td>
      </tr>
      <tr>
      <td align="left">Second row</td>
      <td align="center"><strong>Cell</strong></td>
      <td align="right"><em>Cell</em></td>
      </tr>
      <tr>
      <td align="left">Third row</td>
      <td align="center">Cell that spans across two columns</td>
      <td align="right"></td>
      </tr>
      </tbody></table>

      '''

      markdown.toHtml markdownString, (error, html) ->
        assert.strictEqual html, expectedHtml
        done error

    describe 'when sanitize is true', ->
      it 'Parse out script tags', (done) ->
        markdownString = '''
        <div><script>HTML tag</script></div>
        '''

        expectedHtml = '''
        <div></div>

        '''

        markdown.toHtml markdownString, (error, html) ->
          assert.strictEqual html, expectedHtml
          done error

      it 'Parse out custom tags and preserve contents', (done) ->
        markdownString = '''
        <p><custom>HTML tag</custom></p>
        '''

        expectedHtml = '''
        <p>HTML tag</p>

        '''

        markdown.toHtml markdownString, (error, html) ->
          assert.strictEqual html, expectedHtml
          done error

      it 'Parse out custom attributes', (done) ->
        markdownString = '''
        <p custom="test">HTML tag</p>
        '''

        expectedHtml = '''
        <p>HTML tag</p>

        '''

        markdown.toHtml markdownString, (error, html) ->
          assert.strictEqual html, expectedHtml
          done error

      it 'Parse preseves code block tags', (done) ->
        markdownString = '''
        ```xml
        <xml>Hello World</xml>
        ```
        '''

        expectedHtml = '''
        <pre><code class="xml">&lt;xml&gt;Hello World&lt;/xml&gt;\n</code></pre>

        '''

        markdown.toHtml markdownString, (error, html) ->
          assert.strictEqual html, expectedHtml
          done error

      it 'Parse and sanitize images', (done) ->
        markdownString = '''
        <img src="/image.jpg" onerror="alert('XSS')" />
        '''

        expectedHtml = '''
        <p><img src="/image.jpg"></p>

        '''

        markdown.toHtml markdownString, (error, html) ->
          assert.strictEqual html, expectedHtml
          done error

    describe 'when sanitizing is false', ->
      it 'Parse and leave script tags', (done) ->
        markdownString = '''
        <div><script>HTML tag</script></div>
        '''

        expectedHtml = '''
        <div><script>HTML tag</script></div>

        '''

        markdown.toHtml markdownString, sanitize: false, (error, html) ->
          assert.strictEqual html, expectedHtml
          done error

      it 'Parse and leave custom tags and preserve contents', (done) ->
        markdownString = '''
        <p><custom>HTML tag</custom></p>
        '''

        expectedHtml = '''
        <p><custom>HTML tag</custom></p>

        '''

        markdown.toHtml markdownString, sanitize: false, (error, html) ->
          assert.strictEqual html, expectedHtml
          done error
