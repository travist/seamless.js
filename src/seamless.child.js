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

                // Set the connection id.
                if (data.__id && !connection.id) {
                  connection.id = data.__id;
                }

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

        // Call the update.
        update();
      }

      // Return the connection.
      return connection;
    }
  };
})(window, document, jQuery);
