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
(function($) {

  // Make sure we have the $.pm module loaded.
  if (!$.hasOwnProperty('pm')) {
    console.log('You must install the jQuery.pm module to use seamless.js.');
    return;
  }

  // If any iframe page sends this message, then reload the page.
  $.pm.bind('seamless_noiframe', function(data) {
    // Remove the 'noifame' query parameters.
    data.href = data.href.replace(/noiframe\=[^&?#]+/, '');
    window.location.replace(data.href);
  });

  // Create a way to open the iframe in a separate window.
  window.seamlessOpenFallback = function(src, event) {
    if (event.preventDefault) {
      event.preventDefault();
      event.stopPropagation();
    }
    else {
      event.returnValue = false;
    }
    window.open(src, '', [
      'width=960',
      'height=800',
      'menubar=no',
      'titlebar=no',
      'toolbar=no',
      'status=no',
      'scrollbars=yes',
      'chrome=yes'
    ].join(','));
  };

  // Keep track of the next connection ID.
  var seamlessFrames = [];
  var connecting = false;
  var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');

  /**
   * Creates a connection ID.
   */
  var getConnectionId = function() {
    var r = [];
    for (var i=0; i < 32; i++) {
      r[i] = chars[0 | Math.random() * 32];
    }
    return r.join("");
  };

  // Call when each child is ready.
  $.pm.bind('seamless_ready', function() {

    // Only do this if we are not already connecting.
    if (!connecting) {

      // Say we are connecting.
      connecting = true;

      // Iterate through all of our iframes.
      for (var i in seamlessFrames) {

        // Get the iframe.
        var iframe = seamlessFrames[i];

        // If no connection ID is established, then set it.
        if (!iframe.connection.id) {
          iframe.connection.id = getConnectionId();
        }

        // Send the connection message to the child page.
        $.pm({
          type: 'seamless_connect',
          target: iframe.connection.target,
          url: iframe.connection.url,
          data: {id : iframe.connection.id}
        });
      }

      // Say we are no longer connecting.
      connecting = false;
    }
  });

  // Handle the child update message.
  $.pm.bind('seamless_update', function(data, event) {

    // Iterate through all of our iframes.
    for (var i in seamlessFrames) {

      // Get the iframe.
      var iframe = seamlessFrames[i];

      // Only process if the connection ID's match.
      if (iframe.connection.id === data.__id) {

        // Call this iframes update
        return iframe.seamless_update(data, event);
      }
    }

    // Return that nothing was done.
    data.height = 0;
    return data;
  });

  /**
   * Create the seamless.js plugin.
   */
  $.fn.seamless = function(options) {

    // The default arguments.
    var defaults = {
      loading: 'Loading ...',
      spinner: 'http://www.travistidwell.com/seamless.js/src/loader.gif',
      fallback: true,
      fallbackParams: '',
      fallbackText: '',
      fallbackLinkText: 'Click here',
      fallbackLinkAfter: ' to open in a separate window.',
      fallbackStyles: [
        'padding: 15px',
        'border: 1px solid transparent',
        'border-radius: 4px',
        'color: #3a87ad',
        'background-color: #d9edf7',
        'border-color: #bce8f1'
      ]
    };

    // Set the defaults if they are not provided.
    options = options || {};
    for (var name in defaults) {
      if (!options.hasOwnProperty(name)) {
        options[name] = defaults[name];
      }
    }

    // Only work with the first iframe object.
    var iframe = $(this).eq(0);

    // Add this to the global seamless frames object.
    seamlessFrames.push(iframe);

    // Get the name of the iframe.
    var id = iframe.attr('name') || iframe.attr('id');

    // Get the iframe source.
    var src = iframe.attr('src');

    // The connection object.
    iframe.connection = new SeamlessConnection(window.frames[id], src);

    // Assign the send and receive functions to the iframe.
    iframe.send = function(pm) {
      iframe.connection.send.call(iframe.connection, pm);
    };
    iframe.receive = function(type, callback) {
      iframe.connection.receive.call(iframe.connection, type, callback);
    };

    // Add the necessary attributes.
    iframe.attr({
      'scrolling': 'no',
      'seamless': 'seamless',
      'width': '100%',
      'height': '0px'
    }).css({
      border: 'none',
      overflowY: 'hidden'
    });

    // Create the loading div.
    var loading = $(document.createElement('div')).css({
      background: 'url(' + options.spinner + ') no-repeat 10px 13px',
      padding: '10px 10px 10px 60px',
      width: '100%'
    });

    // We are loading.
    var isLoading = true;

    // Append the text.
    loading.append(options.loading);

    // Prepend the loading text.
    iframe.before(loading);

    // If they wish to have a fallback.
    if (options.fallback) {

      // Get the iframe src.
      if (options.fallbackParams) {
        src += (src.search(/\?/) === -1) ? '?' : '&';
        src += options.fallbackParams;
      }

      // Create the fallback link.
      var fallbackLink = $(document.createElement('a')).attr({
        class: 'seamless.js-fallback-link',
        href: '#',
        onclick: 'seamlessOpenFallback("' + src + '", event)'
      });
      fallbackLink.append(options.fallbackLinkText);

      // Create the fallback markup.
      var fallback = $(document.createElement('div')).attr({
        class: 'seamless.js-fallback'
      });
      fallback.append($(document.createElement('em')).attr({
        style: 'padding: 5px;'
      }));

      // Set the iframe.
      iframe.after(fallback);

      /**
       * Set the fallback message for the iframe.
       * @param msg
       */
      var setFallback = function(msg, info) {
        fallback.attr('style', info ? options.fallbackStyles.join(';') : '');
        fallback.find('em')
          .text(msg + ' ')
          .append(fallbackLink)
          .append(options.fallbackLinkAfter);
      };

      // Set the default fallback.
      if (options.fallbackText) {
        setFallback(options.fallbackText, false);
      }

      // Handle all errors with a fallback message.
      $(window).error(function() {
        var msg = 'An error has been detected on this page, ';
        msg += 'which may cause problems with the operation of this application.';
        setFallback(msg, true);
      });

      // If nothing happens after 30 seconds, then assume something went wrong.
      setTimeout(function() {
        if (isLoading) {
          loading.remove();
          isLoading = false;
          setFallback('An error has been detected on this page.', true);
        }
      }, 30000);
    }

    /**
     * Called when this iframe is updated with the child.
     *
     * @param data
     * @param event
     */
    iframe.seamless_update = function(data, event) {

      // See if we are loading.
      if (isLoading) {

        // Remove the loading indicator.
        loading.remove();
        isLoading = false;
        iframe.connection.setActive(true);

        // Trigger that a connection was made.
        iframe.trigger('connected');
      }

      // If the height is greater than 0, then update.
      if (data.height > 0) {

        // Set the iframe height.
        iframe.height(data.height).attr('height', data.height + 'px');
      }

      // Return the data.
      return data;
    };

    // Return the iframe.
    return iframe;
  };
})(jQuery);