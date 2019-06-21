{
  /*
   * Converts headers from format like this:
   *
   *   [
   *     { name: "Content-Type",   value: "application/json" },
   *     { name: "Content-Length", value: "153"              }
   *   ]
   *
   * into format like this:
   *
   *   {
   *     "Content-Type":   "application/json",
   *     "Content-Length": "153"
   *   }
   */
  function convertHeaders(headers) {
    var result = {}, i;

    for (i = 0; i < headers.length; i++) {
      result[headers[i].name] = headers[i].value;
    }

    return result;
  }

  function nullIfEmpty(s) {
    return s !== "" ? s : null;
  }

  function combineHeadTail(head, tail) {
    if (head !== "") {
      tail.unshift(head);
    }

    return tail;
  }

  /*
   * We must save these because |this| doesn't refer to the parser in actions.
   */
  var Blueprint            = this.ast.Blueprint,
      Section              = this.ast.Section,
      Resource             = this.ast.Resource,
      Request              = this.ast.Request,
      Response             = this.ast.Response,
      JsonSchemaValidation = this.ast.JsonSchemaValidation;

  var urlPrefix = "", bodyTerminator;
}

/* ===== Primary Rules ===== */

API
  = EmptyLine*
    location:Location?
    EmptyLine*
    name:APIName
    EmptyLine*
    description:APIDescription?
    EmptyLine*
    resources:Resources
    EmptyLine*
    sections:Sections
    EmptyLine*
    validations:JsonSchemaValidations?
    EmptyLine*
    {
      /* Wrap free-standing resources into an anonymnous section. */
      if (resources.length > 0) {
        sections.unshift(new Section({
          name:        null,
          description: null,
          resources:   resources
        }));
      }

      return new Blueprint({
        location:    nullIfEmpty(location),
        name:        nullIfEmpty(name),
        description: nullIfEmpty(description),
        sections:    sections,
        validations: validations !== "" ? validations : []
      });
    }

Location
  = "HOST:" S* url:Text0 EOLF {
      var urlWithoutProtocol = url.replace(/^https?:\/\//, ""),
          slashIndex         = urlWithoutProtocol.indexOf("/");

      if (slashIndex > 0) {
        urlPrefix = urlWithoutProtocol.slice(slashIndex + 1);
      }

      return url;
    }

APIName
  = "---" S+ name:Text1 EOLF {
      return name.replace(/\s+---$/, "");
    }

APIDescription
  = "---" S* EOL lines:APIDescriptionLine* "---" S* EOLF {
    return lines.join("\n");
  }

APIDescriptionLine
  = !("---" S* EOLF) text:Text0 EOL { return text; }

Sections
  = head:Section?
    tail:(EmptyLine* section:Section { return section; })*
    {
      return combineHeadTail(head, tail);
    }

Section
  = header:SectionHeader EmptyLine* resources:Resources {
      return new Section({
        name:        nullIfEmpty(header.name),
        description: nullIfEmpty(header.description),
        resources:   resources
      });
    }

SectionHeader
  = SectionHeaderLong
  / SectionHeaderShort

SectionHeaderShort
  = !JsonSchemaValidationsHeader "--" S+ name:Text1 EOLF {
      return {
        name:        name.replace(/\s+--$/, ""),
        description: ""
      };
    }

SectionHeaderLong
  = !JsonSchemaValidationsHeader "--" S* EOL lines:SectionHeaderLongLine* "--" S* EOLF {
    return {
      name:        lines.length > 0 ? lines[0] : "",
      description: lines.slice(1).join("\n")
    };
  }

SectionHeaderLongLine
  = !("--" S* EOLF) text:Text0 EOL { return text; }

Resources
  = head:Resource?
    tail:(EmptyLine* resource:Resource { return resource; })*
    {
      return combineHeadTail(head, tail);
    }

Resource
  /*
   * Initial !Section and !JsonSchemaValidations are needed so that parsing of
   * sectionless resources (which are placed before resources in sections and
   * validations) terminates correctly.
   */
  = !SectionHeader !JsonSchemaValidationsHeader
    description:ResourceDescription?
    signature:Signature
    request:Request
    responses:Responses
    {
      /* For the "HEAD" method every response body must be empty */
      if (signature.method === "HEAD") {
        for (var i = 0; i < responses.length; i++) {
          if (responses[i].body !== null)
            return null; /* Error, body must be null */
        };
      }

      var url = urlPrefix !== ""
        ? "/" + urlPrefix.replace(/\/$/, "") + "/" + signature.url.replace(/^\//, "")
        : signature.url;

      return new Resource({
        description: nullIfEmpty(description),
        method:      signature.method,
        url:         url,
        request:     request,
        responses:   responses
      });
    }

ResourceDescription "resource description"
  = lines:ResourceDescriptionLine+ { return lines.join("\n"); }

ResourceDescriptionLine
  = !HttpMethod text:Text0 EOL { return text; }

/* Assembled from RFC 2616, 5323, 5789. */
HttpMethod
  = "GET"
  / "POST"
  / "PUT"
  / "DELETE"
  / "OPTIONS"
  / "PATCH"
  / "PROPPATCH"
  / "LOCK"
  / "UNLOCK"
  / "COPY"
  / "MOVE"
  / "MKCOL"
  / "HEAD"

Request
  = headers:RequestHeaders body:Body? {
      return new Request({
        headers: headers,
        body:    nullIfEmpty(body)
      });
    }

RequestHeaders
  = headers:RequestHeader* { return convertHeaders(headers); }

RequestHeader
  = In header:HttpHeader { return header; }

Responses
  = head:Response
    tail:(ResponseSeparator response:Response { return response; })*
    {
      return combineHeadTail(head, tail);
    }

Response
  = status:ResponseStatus headers:ResponseHeaders body:Body? {
      return new Response({
        status:  status,
        headers: headers,
        body:    nullIfEmpty(body)
      });
    }

ResponseStatus
  = Out status:HttpStatus S* EOLF { return status; }

ResponseHeaders
  = headers:ResponseHeader* { return convertHeaders(headers); }

ResponseHeader
  = Out header:HttpHeader { return header; }

ResponseSeparator
  = "+++++" S* EOL

HttpStatus "HTTP status code"
  = digits:[0-9]+ { return parseInt(digits.join(""), 10); }

HttpHeader
  = name:HttpHeaderName ":" S* value:HttpHeaderValue EOLF {
      return {
        name:  name,
        value: value
      };
    }

/*
 * See RFC 822, 3.1.2: "The field-name must be composed of printable ASCII
 * characters (i.e., characters that have values between 33. and 126., decimal,
 * except colon)."
 */
HttpHeaderName "HTTP header name"
  = chars:[\x21-\x39\x3B-\x7E]+ { return chars.join(""); }

HttpHeaderValue "HTTP header value"
  = Text0

JsonSchemaValidationsHeader
  = "-- JSON Schema Validations --" EOLF

JsonSchemaValidations
  = JsonSchemaValidationsHeader
    head:JsonSchemaValidation?
    tail:(EmptyLine* validation:JsonSchemaValidation { return validation; })*
    {
      return combineHeadTail(head, tail);
    }

JsonSchemaValidation
  = signature:Signature body:Body {
      return new JsonSchemaValidation({
        method: signature.method,
        url:    signature.url,
        body:   body
      });
    }

Signature
  = method:HttpMethod S+ url:Text1 EOL {
      return {
        method: method,
        url:    url
      };
    }

Body
  = DelimitedBodyFixed
  / DelimitedBodyVariable
  / SimpleBody

DelimitedBodyFixed
  = "<<<" S* EOL
    lines:DelimitedBodyFixedLine*
    ">>>" S* EOLF
    {
      return lines.join("\n");
    }

DelimitedBodyFixedLine
  = !(">>>" S* EOLF) text:Text0 EOL { return text; }

DelimitedBodyVariable
  = "<<<" terminator:Text1 EOL
    &{ bodyTerminator = terminator; return true; }
    lines:DelimitedBodyVariableLine*
    DelimitedBodyVariableTerminator
    {
      return lines.join("\n");
    }

DelimitedBodyVariableLine
  = !DelimitedBodyVariableTerminator text:Text0 EOL { return text; }

DelimitedBodyVariableTerminator
  = terminator:Text1 EOLF &{ return terminator === bodyTerminator }

SimpleBody
  = !"<<<" lines:SimpleBodyLine+ { return lines.join("\n"); }

SimpleBodyLine
  = !In !Out !ResponseSeparator !EmptyLine text:Text1 EOLF { return text; }

In
  = ">" S+

Out
  = "<" S+

/* ===== Helper Rules ===== */

Text0 "zero or more characters"
  = chars:[^\n\r]* { return chars.join(""); }

Text1 "one or more characters"
  = chars:[^\n\r]+ { return chars.join(""); }

EmptyLine "empty line"
  = S* EOL

EOLF "end of line or file"
  = EOL / EOF

EOL "end of line"
  = "\n"
  / "\r\n"
  / "\r"

EOF "end of file"
  = !. { return ""; }

/*
 * What "\s" matches in JavaScript regexps, sans "\r", "\n", "\u2028" and
 * "\u2029". See ECMA-262, 5.1 ed., 15.10.2.12.
 */
S "whitespace"
  = [\t\v\f \u00A0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\uFEFF]
