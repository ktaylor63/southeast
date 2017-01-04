(function () {
  'use strict';

  var _ = {
    each: require('lodash.forEach'),
    defaults: require('lodash.defaults')
  };

  var options = {};
  var defaults = {
    elements: document.querySelectorAll('.full-list'),
    showClass: 'show'
  };

  function init(opts) {
    options = _.defaults({}, opts, defaults);
    _.each(options.elements, function (element) {
      element.addEventListener('click', _toggle);
    });
  }

  function _toggle(e) {
    var list = getListWrapper(e.target);
    if ( list.classList.contains(options.showClass) )
      list.classList.remove(options.showClass);
    else list.classList.add(options.showClass);
  }

  function getListWrapper(el) {
    if ( el.classList.contains('fade-list') ) return el;
    else return el.parentNode;
  }

  function destroy() {
    _.each(options.elements, function (element) {
      element.removeEventListener('click', _toggle);
    });
    options = null;
  }

  module.exports.init = init;
  module.exports.destroy = destroy;
})();
