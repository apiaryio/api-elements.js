var events = require('events');

// Default logging function
function log(message) {
  /*eslint no-unused-vars: 0 */
  // console.log(message);
}

// Default Fury EventEmitter
//  using primitive console logging
//
//  Note: The beautiful name of this function, ha ha.
function DefaultFuryEmitter() {
  var eventEmitter = new events.EventEmitter();

  // Error event
  //  sent in the case of an unrecoverable error
  eventEmitter.on('error', function(message) {
    log(message);
  });

  // Debugging event
  //  sent for debugging purposes
  eventEmitter.on('log', function(message) {
    log(message);
  });

  // Metric event
  //  sent when an event performance has been measured
  eventEmitter.on('metric', function(eventName, elaspedTime) {
    log(eventName + ' ' + elaspedTime);
  });

  return eventEmitter;
}

module.exports = DefaultFuryEmitter;
