(function(window, document, $) {
  'use strict';
  // Make sure we have the postmessage.js module loaded.
  if (!window.hasOwnProperty('pm')) {
    console.log('You must install the postmessage.js module to use seamless.js.');
    return;
  }

  /**
   * Create the seamless.js class on the jQuery object.
   */
  $.seamless = window.seamless = {

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
      
      /** Allow appended styles to be injected. */
      allowAppendedStyleInjection: false,

      /** If this child page requires cookies. */
      requireCookies: false,

      /** The message to show when the cookie fails. */
      cookieFallbackMsg: 'Your browser requires this page to be opened in a separate window.',

      /** The text to show in the link for the cookie fallback. */
      cookieFallbackLinkMsg: 'Click Here',

      /** The text to show after the fallback link. */
      cookieFallbackAfterMsg: ' to open in a separate window.',

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
      var connection = new window.SeamlessConnection(
        window.parent,
        options.url
      );

      // If an error occured.
      var errorOccured = false;

      /**
       * Show an error message on the parent page.
       * @param msg
       * @param linkMsg
       * @param afterMsg
       */
      var showError = function(msg, linkText, afterText) {

        // Say that an error occured.
        errorOccured = true;

        // Send the error to the parent.
        connection.send({
          type: 'seamless_error',
          data: {
            msg: msg,
            linkText: linkText,
            afterText: afterText
          }
        });
      };

      // Parent connections are always active.
      connection.setActive(true);

      // If we require cookies, perform a quick cookie test.
      if (options.requireCookies) {

        // Set a cookie and read a cookie.
        document.cookie="cookieTest=1";
        if (document.cookie.indexOf("cookieTest") === -1) {

          // Show an error message.
          showError(
            options.cookieFallbackMsg,
            options.cookieFallbackLinkMsg,
            options.cookieFallbackAfterMsg
          );
        }
      }

      // See if this page should not be iframed.
      var noiframe = window.SeamlessBase.getParam('noiframe').toString();
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

          // Don't process if an error occured with this frame.
          if (errorOccured) {
            return;
          }

          // Clear the timer if it exists.
          if (heightTimer) {
            clearTimeout(heightTimer);
          }

          // Get the new height of the child.
          var newHeight = window.SeamlessBase.elementHeight(window.SeamlessBase.getElement(container));

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

        /**
         * Send a message that we are ready.
         */
        var sendReady = function(times) {

          // Don't do anything if an error occured.
          if (errorOccured) {
            return;
          }

          // Set the amount of times sendReady is called.
          times = times || 0;

          // Only send if the connection ID hasn't been established.
          if (!connection.id) {

            // Send a ready signal to our parent page.
            connection.send({
              type: 'seamless_ready',
              data: {}
            });

            // Give up after 10 seconds.
            if (times < 50) {

              // Check again after 200ms.
              setTimeout(function() {
                sendReady(++times);
              }, 200);
            }
          }
        };

        // Listen for inject styles command.
        window.pm.bind('seamless_styles', function(data) {
          if (options.allowStyleInjection) {
            window.SeamlessBase.injectStyles(data);
          }
          
          if (options.allowAppendedStyleInjection) {
            window.SeamlessBase.injectAppendedStyles(data);
          }
          
          update();
        });

        // Listen for the connect event.
        window.pm.bind('seamless_connect', function(data, event) {

          // Set the connection ID.
          connection.id = data.id;

          // If they wish to get event when the iframe connects.
          if (options.onConnect) {
            options.onConnect(data);
          }

          // Add some styles to the body to support seamless styles.
          var htmlStyle = document.body.getAttribute('style');
          document.body.setAttribute('style', 'overflow:hidden;' + htmlStyle);
          document.body.setAttribute('scroll', 'no');

          // Inject styles if they wish.
          if (options.allowStyleInjection) {
            window.SeamlessBase.injectStyles(data.styles);
          }

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
})(window, document, (typeof jQuery === 'undefined') ? {} : jQuery);
