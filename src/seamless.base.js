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
