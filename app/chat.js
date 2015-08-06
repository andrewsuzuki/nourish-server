module.exports = function(io) {

  var people = [];

  io.on('connection', function(socket) {

    var person = {
      id: undefined, // assigned id
      screenName: undefined, // their screen name
      offering: undefined, // undefined or hall name
      socket: socket // keep track of socket
    };

    people.push(person);

    /**
     * On new offer
     */
    socket.on('offer new', function(hallName) {
      person.offering = hallName;
      // Update offers
      updateOffers();
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
      person.screenName = screenName;
    });

    socket.on('message', function(json) {
      socket.emit('halls');
    });

    /**
     * On message recieve
     * messageRaw must have .to and .body
     */
    socket.on('message', function(messageRaw) {
      // Parse raw message as JSON
      var message = JSON.parse(messageRaw);
      // Don't send if body is not included
      if (!message.body) {
        return;
      }
      // Find recipient
      var toPerson = findPersonById(message.to);
      // Don't send if toPerson does not exist
      if (!toPerson) {
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
    personTo.emit('message', {
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
          offers[person.offering] = [];
        }

        // Add offer to hall offers
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
