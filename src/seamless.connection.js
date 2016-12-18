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
