const assert = require('assert');

// Nearly API Compatible version of assert.rejects from Node 10
// https://nodejs.org/api/assert.html#assert_assert_rejects_asyncfn_error_message
// We're only supporting errorMessage as input
async function rejects(asyncFn, errorMessage) {
  let didThrow = false;

  try {
    await asyncFn();
  } catch (error) {
    didThrow = true;

    assert.equal(error.message, errorMessage);
  }

  if (!didThrow) {
    assert.fail('asyncFn did not throw');
  }
}

module.exports = {
  rejects,
};
