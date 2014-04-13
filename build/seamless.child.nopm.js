// Base seamless functionality between parent and child.
var SeamlessBase = {

  /**
   * Returns the value of a query parameter.
   *
   * @param string name
   *   The name of the query parameter to retrieve.
   *
   * @param string from
   *   The string to get the query parameter from.
   *
   * @returns {string}
   *   The value of the query parameter.
   */
  getParam: function(name, from) {
    from = from || window.location.search;
    var regexS = '[?&]' + name + '=([^&#]*)';
    var regex = new RegExp(regexS);
    var results = regex.exec(from);
    if (results === null) {
      return '';
    }
    else {
      return decodeURIComponent(results[1].replace(/\+/g, ' '));
    }
  }
};/**
 * Create a seamless connection between parent and child frames.
 *
 * @param target
 * @param url
 * @constructor
 */
var SeamlessConnection = function(target, url) {
  this.id = 0;
  this.target = target;
  this.url = url;
  this.active = false;
  this.queue = [];
};

/**
 * Send a message to the connected frame.
 *
 * @param pm
 */
SeamlessConnection.prototype.send = function(pm) {

  // Only send if the target is set.
  if (this.active && this.target) {

    // Normalize the data.
    if (!pm.hasOwnProperty('data')) {
      pm = {data: pm};
    }

    // Set the other parameters.
    pm.target = this.target;
    pm.url = this.url;
    pm.type = pm.type || 'seamless_data';
    pm.data = pm.data || {};
    pm.data.__id = this.id;
    $.pm(pm);
  }
  else {

    // Add this to the queue.
    this.queue.push(pm);
  }
};

/**
 * Receive a message from a connected frame.
 */
SeamlessConnection.prototype.receive = function(type, callback) {
  if (typeof type === 'function') {
    callback = type;
    type = 'seamless_data';
  }

  // Store the this pointer.
  var _self = this;

  // Listen for events.
  $.pm.bind(type, function(data, event) {

    // Only handle data if the connection id's match.
    if (data.__id && (data.__id === _self.id)) {
      return callback(data, event);
    }
    else {

      // Do not handle this event.
      return false;
    }
  });
};

/**
 * Sets this connection as active.
 *
 * @param active
 */
SeamlessConnection.prototype.setActive = function(active) {
  this.active = active;

  // Empty the send queue if we have one.
  if (this.queue.length > 0) {
    for(var i in this.queue) {
      this.send(this.queue[i]);
    }
    this.queue = [];
    this.queue.length = 0;
  }
};
(function(window, document, $, undefined) {

  // Make sure we have the $.pm module loaded.
  if (!$.hasOwnProperty('pm')) {
    console.log('You must install the jQuery.pm module to use seamless.js.');
    return;
  }

  /**
   * Create the seamless.js class on the jQuery object.
   */
  $.seamless = {

    /**
     * The options for the client seamless.js library.
     */
    options: {

      /** The URL of the parent. **/
      url: '',

      /** The HTML container of the body content. **/
      container: 'body',

      /** The time interval to update the iframe. **/
      update: 200
    },

    /**
     * Connect this child with the parent.
     *
     * @param url
     */
    connect: function(options) {

      // Set the options.
      options = options || {};
      for (var name in options) {
        if (this.options.hasOwnProperty(name)) {
          this.options[name] = options[name];
        }
      }
      options = this.options;

      // The connection object.
      var connection = new SeamlessConnection(
        window.parent,
        options.url
      );

      // Parent connections are always active.
      connection.setActive(true);

      // See if this page should not be iframed.
      var noiframe = SeamlessBase.getParam('noiframe').toString();
      if (noiframe === '1' || noiframe.toLowerCase() === 'true') {
        connection.send({
          type: 'seamless_noiframe',
          data: {
            href: window.location.href
          }
        });
      }
      else {

        // The update function.
        var sendingUpdate = false;
        var container = options.container;
        var height = 0;
        var heightTimer = 0;

        // Update the parent iframe container.
        var update = function() {

          // Get the new height of the child.
          var newHeight = $(container).outerHeight(true);
          newHeight = (newHeight > 100) ? newHeight : 100;

          // If the height are different.
          if (!sendingUpdate && (height !== newHeight)) {

            // Sending the update.
            sendingUpdate = true;

            // Send the update to the parent.
            connection.send({
              type: 'seamless_update',
              data: {
                height: newHeight
              },
              success: function(data) {

                // Set the height.
                height = data.height;

                // No longer sending the update.
                sendingUpdate = false;
              }
            });
          }

          // Clear the timer if it exists.
          if (heightTimer) {
            clearTimeout(heightTimer);
          }

          // Update again after 500ms.
          heightTimer = setTimeout(update, options.update);
        };

        /**
         * Send a message that we are ready.
         */
        var sendReady = function() {

          // Only send if the connection ID hasn't been established.
          if (!connection.id) {

            // Send a ready signal to our parent page.
            connection.send({
              type: 'seamless_ready',
              data: {}
            });

            // Check again after 200ms.
            setTimeout(sendReady, 200);
          }
        };

        // Listen for the connect event.
        $.pm.bind('seamless_connect', function(data, event) {

          // Set the connection ID.
          connection.id = data.id;

          // Call the update.
          update();
        });

        // Say that we are ready.
        sendReady();
      }

      // Return the connection.
      return connection;
    }
  };
})(window, document, jQuery);
