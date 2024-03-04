const serializeHttpResponse = require('./serializeHttpResponse');

function serializeTransition(transition) {
  const operation = {
    responses: {},
  };

  transition.transactions
    .compactMap(transaction => transaction.response)
    .forEach((response) => {
      const statusCode = String(response.statusCode.toValue());
      operation.responses[statusCode] = serializeHttpResponse(response);
    });


  return operation;
}

module.exports = serializeTransition;
