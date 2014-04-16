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

      /** The URL of the parent. */
      url: '',

      /** The HTML container of the body content. */
      container: 'body',

      /** The time interval to update the iframe. */
      update: 200,

      /** Allow styles to be injected. */
      allowStyleInjection: false,

      /** Called when an update is triggered to the parent. */
      onUpdate: null,

      /** Called wehn the parent connects with this iframe. */
      onConnect: null
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
      var connection = new $.SeamlessConnection(
        window.parent,
        options.url
      );

      // Parent connections are always active.
      connection.setActive(true);

      // See if this page should not be iframed.
      var noiframe = $.SeamlessBase.getParam('noiframe').toString();
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

          // Clear the timer if it exists.
          if (heightTimer) {
            clearTimeout(heightTimer);
          }

          // Get the new height of the child.
          var newHeight = $(container).outerHeight(true);
          newHeight = (newHeight > 100) ? newHeight : 100;

          // If the height are different.
          if (!sendingUpdate && (height !== newHeight)) {

            // Sending the update.
            sendingUpdate = true;

            // The data to send to the parent.
            var data = { height: newHeight };

            // If they wish to update.
            if (options.onUpdate) {
              options.onUpdate(data);
            }

            // Send the update to the parent.
            connection.send({
              type: 'seamless_update',
              data: data,
              success: function(data) {

                // Set the height.
                height = data.height;

                // No longer sending the update.
                sendingUpdate = false;
              }
            });
          }

          // Update again after 500ms.
          heightTimer = setTimeout(update, options.update);
        };

        // Add some styles to the body to support seamless styles.
        $('html').attr({
          'style': 'overflow:hidden;' + $('body').attr('html'),
          'scroll': 'no'
        });

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

        /**
         * Inject styles into this page.
         *
         * @param styles
         */
        var injectStyles = function(styles) {

          // See if they wish to inject styles into this page.
          if (options.allowStyleInjection && (styles.length > 0)) {

            // Inject the styles.
            styles = (typeof styles == 'string') ? styles : styles.join('');

            // Keep them from escaping the styles tag.
            styles = styles.replace(/[<>]/g, '');

            // See if there are new styles to inject.
            var injectedStyles = $('style#injected-styles');
            if (injectedStyles.length > 0) {
              injectedStyles.html(styles);
            }
            else {

              // Inject the styles.
              $('head').append($(document.createElement('style')).attr({
                type: 'text/css',
                id: 'injected-styles'
              }).append(styles));
            }
          }
        };

        // Listen for inject styles command.
        $.pm.bind('seamless_styles', function(data) {
          injectStyles(data);
          update();
        });

        // Listen for the connect event.
        $.pm.bind('seamless_connect', function(data, event) {

          // Set the connection ID.
          connection.id = data.id;

          // If they wish to get event when the iframe connects.
          if (options.onConnect) {
            options.onConnect(data);
          }

          // Inject styles if they wish.
          injectStyles(data.styles);

          // Call the update.
          update();

          // Return the data to finish the connection.
          return data;
        });

        // Say that we are ready.
        sendReady();
      }

      // Return the connection.
      return connection;
    }
  };
})(window, document, jQuery);
