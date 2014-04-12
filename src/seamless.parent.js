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

  // Keep track of all seamless connections.
  var seamlessConnections = [];

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

    // Get the name of the iframe.
    var id = iframe.attr('name') || iframe.attr('id');

    // Get the iframe source.
    var src = iframe.attr('src');

    // The connection object.
    var connection = new SeamlessConnection(window.frames[id], src);

    // Set the connectionId.
    connection.id =  SeamlessBase.getParam('iframeId', src) || src;

    // Assign the send and receive functions to the iframe.
    iframe.send = function(pm) {
      connection.send.call(connection, pm);
    };
    iframe.receive = function(type, callback) {
      connection.receive.call(connection, type, callback);
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

    // Handle the child update message.
    $.pm.bind('seamless_update', function(data, event) {

      // See if we are loading.
      if (isLoading) {

        // Only establish a connection if the id isn't set, and
        // if the href of the page matches that of the iframe src.
        if (!data.__id && (data.__href.search(src) !== -1)) {

          // Set the connection id.
          data.__id = connection.id;
        }

        // Make sure the connection Id's match.
        if (data.__id == connection.id) {

          // Remove the loading indicator.
          loading.remove();
          isLoading = false;
          connection.setActive(true);

          // Trigger that a connection was made.
          iframe.trigger('connected');
        }
        else {

          // Report that nothing was done.
          data.height = 0;
        }
      }

      // If the height is greater than 0, then update.
      if ((data.__id == connection.id) && (data.height > 0)) {

        // Set the iframe height.
        iframe.height(data.height).attr('height', data.height + 'px');
      }

      // Return the data.
      return data;
    });

    // Return the iframe.
    return iframe;
  };
})(jQuery);