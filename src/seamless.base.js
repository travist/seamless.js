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
  }
};