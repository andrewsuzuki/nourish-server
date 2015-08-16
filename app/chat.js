var shortid = require('shortid');

module.exports = function(io) {

  var people = [];

  io.on('connection', function(socket) {

    var person = {
      id: shortid.generate(), // random id
      screenName: undefined, // their screen name
      offering: undefined, // undefined or hall name
      socket: socket // keep track of socket
    };

    people.push(person);

    /**
     * On new offer
     */
    socket.on('offer new', function(hallName) {
      // Only if they have a valid screen name
      if (screenNameValid(person.screenName)) {
        person.offering = hallName;
        // Update offers
        updateOffers();
      }
    });

    /**
     * On offer leave
     */
    socket.on('offer leave', function() {
      person.offering = undefined;
      // Update offers
      updateOffers();
    });

    /**
     * On screenname update
     */
    socket.on('screenname update', function(screenName) {
      // Only update if it's valid
      if (screenNameValid(screenName)) {
        person.screenName = screenName;
        // Update offers
        updateOffers();
      }
    });

    /**
     * On message recieve
     * messageRaw must have .to and .body
     */
    socket.on('message', function(message) {
      // Don't send if body is not included
      if (!message.body) {
        return;
      }
      // Find recipient
      var toPerson = findPersonById(message.to);
      // Don't send if toPerson does not exist,
      // or if they don't have a valid screen name
      if (!toPerson || !screenNameValid(toPerson.screenName)) {
        return;
      }
      // Send message to recipient
      sendMessage(person, toPerson, message.body)
    });

    /**
     * On client disconnect
     */
    socket.on('disconnect', function() {
      // Remove person from people
      var index = people.indexOf(person);
      if (index > -1) {
        people.splice(index, 1);
      }
      // Remove reference
      person = undefined;
      // Update offers
      updateOffers();
    });
  });

  /**
   * Check specified screen name for validity
   * @param  {string} screenName the screen name
   * @return {Boolean}           if it is valid
   */
  function screenNameValid(screenName) {
    return typeof screenName === 'string' && screenName.length;
  }

  /**
   * Find person by id
   * @param  {string} id      Person's id
   * @return {object|null}    The person, or null if not found
   */
  function findPersonById(id) {
    var result = null;
    // Loop people
    people.some(function(person) {
      // Check id against person's id
      if (person.id === id) {
        // Set our result
        result = person;
        // Break from loop
        return true;
      }
    });
    return result;
  }

  /**
   * Pass message from one person to another
   * @param  {object} personFrom from person
   * @param  {object} personTo   to person
   * @param  {string} body       the message body
   */
  function sendMessage(personFrom, personTo, body) {
    personTo.socket.emit('message', {
      from: personFrom.id,
      body: body
    });
  }

  /**
   * Send update to all clients with current offers
   */
  function updateOffers() {
    var offers = {};

    // Loop people
    people.forEach(function(person) {
      // Check if person is offering
      if (person.offering) {
        // Check if halls already has person's hall
        if (!offers.hasOwnProperty(person.offering) ||
            !Array.isArray(offers[person.offering])) {
          // If not, then initialize array
          offers[person.offering] = [];
        }

        // Add person to hall's array
        offers[person.offering].push({
          id: person.id,
          screenName: person.screenName
        });
      }
    });

    // Emit offers to all clients
    io.emit('offer update', offers);
  }

};
