(function(window, document) {
  'use strict';
  // Base seamless functionality between parent and child.
  window.SeamlessBase = {
    isNumeric: function(value) {
      return (value - parseFloat(value) + 1) >= 0;
    },

    getElement: function(selector) {
      var selectorType = 'querySelectorAll';
      if (selector.indexOf('#') === 0) {
        selectorType = 'getElementById';
        selector = selector.substr(1, selector.length);
      }
      var elements = document[selectorType](selector);
      if (!elements) {
        return elements;
      }
      return (selectorType === 'querySelectorAll') ? elements[0] : elements;
    },

    /**
     * Calculate the element height.
     * http://stackoverflow.com/questions/10787782/full-height-of-a-html-element-div-including-border-padding-and-margin
     *
     * @param element
     * @returns {number}
     */
    elementHeight: function(element) {
      var elmHeight = 0;
      var elmMargin = 0;
      if(document.all) {// IE
        elmHeight = element.currentStyle.height;
        if (!this.isNumeric(elmHeight)) {
          elmHeight = element.offsetHeight;
        }
        elmHeight = parseInt(elmHeight, 10);
        elmMargin = parseInt(element.currentStyle.marginTop, 10) + parseInt(element.currentStyle.marginBottom, 10);
      } else {// Mozilla
        elmHeight = parseInt(document.defaultView.getComputedStyle(element, '').getPropertyValue('height'), 10);
        elmMargin = parseInt(document.defaultView.getComputedStyle(element, '').getPropertyValue('margin-top'), 10) + parseInt(document.defaultView.getComputedStyle(element, '').getPropertyValue('margin-bottom'), 10);
      }
      return (elmHeight + elmMargin);
    },

    hasClass: function(el, className) {
      if (el.classList) {
        return el.classList.contains(className);
      }
      else {
        return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
      }
    },

    addClass: function(el, className) {
      if (el.classList) {
        el.classList.add(className);
      }
      else if (!this.hasClass(el, className)) {
        el.className += " " + className;
      }
    },

    removeClass: function(el, className) {
      if (el.classList) {
        el.classList.remove(className);
      }
      else if (this.hasClass(el, className)) {
        var reg = new RegExp('(\\s|^)' + className + '(\\s|$)');
        el.className=el.className.replace(reg, ' ');
      }
    },

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
    },

    /**
     * Filters text to remove markup tags.
     *
     * @param text
     * @returns {XML|string|*|void}
     */
    filterText: function(text) {
      return text.replace(/[<>]/g, '');
    },

    /**
     * Determine if an object is empty.
     *
     * @param object obj
     *   The object to check to see if it is empty.
     */
    isEmptyObject: function(obj) {
      var name;
      for (name in obj) {
        return false;
      }
      return true;
    },

    /**
     * Set the styles on an element.
     *
     * @param {object} element
     *   The DOM Element you would like to set the styles.
     * @param {array} styles
     *   The styles to add to the element.
     */
    setStyle: function(element, styles) {

      // Make sure they have styles to inject.
      if (styles.length > 0) {

        // Convert to the right format.
        styles = (typeof styles == 'string') ? styles : styles.join(' ');

        // Keep them from escaping the styles tag.
        styles = window.SeamlessBase.filterText(styles);

        // Add the style to the element.
        if (element.styleSheet) {
          element.styleSheet.cssText = styles;
        }
        else {
          element.innerHTML = styles;
        }
      }
    },

    /**
     * Provide a cross browser method to inject styles.
     *
     * @param {array} styles
     *   An array of styles to inject.
     */
    injectStyles: function(styles) {

      // See if there are new styles to inject.
      var injectedStyles = this.getElement('style#injected-styles');
      if (injectedStyles) {
        window.SeamlessBase.setStyle(injectedStyles, styles);
      }
      else {

        // Inject the styles.
        var css = document.createElement('style');
        css.setAttribute('type', 'text/css');
        css.setAttribute('id', 'injected-styles');
        window.SeamlessBase.setStyle(css, styles);
        var head = document.head || document.getElementsByTagName('head')[0];
        if (head) {
          head.appendChild(css);
        }
      }
    },

    /**
     * Provide a cross browser method to inject and append new styles.
     *
     * @param {array} styles
     *   An array of styles to inject.
     */
    injectAppendedStyles: function(styles) {
      var css = styles.join(';');
      var head = document.head || document.getElementsByTagName('head')[0];
      var style = document.createElement('style');
      style.type = 'text/css';
      if (style.styleSheet){
        style.styleSheet.cssText = css;
      } else {
        style.appendChild(document.createTextNode(css));
      }
      head.appendChild(style);
    }
  };
})(window, document);

(function(window) {
  'use strict';
  /**
   * Create a seamless connection between parent and child frames.
   *
   * @param target
   * @param url
   * @constructor
   */
  window.SeamlessConnection = function(target, url) {
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
  window.SeamlessConnection.prototype.send = function(pm) {

    // Only send if the target is set.
    if (this.active && this.target) {

      // Make sure the pm is at least always an object.
      pm = pm || {};

      // Normalize the data.
      if (!pm.hasOwnProperty('data')) {
        pm = {data: pm};
      }

      // Set the other parameters.
      pm.target = this.target;
      pm.url = this.url || 'index.html';
      pm.type = pm.type || 'seamless_data';
      pm.data = pm.data || {};
      pm.data.__id = this.id;
      window.pm(pm);
    }
    else {

      // Add this to the queue.
      this.queue.push(pm);
    }
  };

  /**
   * Receive a message from a connected frame.
   */
  window.SeamlessConnection.prototype.receive = function(type, callback) {
    if (typeof type === 'function') {
      callback = type;
      type = 'seamless_data';
    }

    // Store the this pointer.
    var _self = this;

    // Listen for events.
    window.pm.bind(type, function(data, event) {

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
  window.SeamlessConnection.prototype.setActive = function(active) {
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
})(window);

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
