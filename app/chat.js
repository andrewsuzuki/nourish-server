module.exports = function(io) {

  var people = [];

  io.on('connection', function(socket) {

    var person = {
      uuid: undefined,
      screenName: undefined,
      offering: undefined,
      socket: socket
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

    /**
     * On message recieve
     */
    socket.on('message', function(json) {
      // TODO
      var message = JSON.parse(json);
      var to = people[0]; // Temporary
      sendMessage(person, to, message.body)
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
   * Pass message from one person to another
   * @param  {object} personFrom from person
   * @param  {object} personTo   to person
   * @param  {string} body       the message body
   */
  function sendMessage(personFrom, personTo, body) {
    personTo.emit('message', body);
  }

  /**
   * Send update to all clients with current offer counts
   */
  function updateOffers() {
    var halls = {};

    // Loop people
    people.forEach(function(person) {
      // Check if person is offering
      if (person.offering) {
        // Check if halls already has person's hall
        if (!halls.hasOwnProperty(person.offering)) {
          halls[person.offering] = 0;
        }

        // Increment offers for hall
        halls[person.offering] += 1;
      }
    });

    // Emit offers to all clients
    io.emit('offer update', halls);
  }

};
