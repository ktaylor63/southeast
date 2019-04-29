const defaults = require('lodash.defaults');

let options = {};
const defaultOptions = {
  elements: document.querySelectorAll('.full-list'),
  showClass: 'show'
};

const getListWrapper = el => {
  if (el.classList.contains('fade-list')) return el;
  return el.parentNode;
};

const toggle = e => {
  const list = getListWrapper(e.target);
  if (list.classList.contains(options.showClass)) list.classList.remove(options.showClass);
  else list.classList.add(options.showClass);
};

const destroy = () => {
  options.elements.forEach(element => {
    element.removeEventListener('click', toggle);
  });
  options = null;
};

function init(opts) {
  options = defaults({}, opts, defaultOptions);
  options.elements.forEach(element => {
    element.addEventListener('click', toggle);
  });
}

module.exports.init = init;
module.exports.destroy = destroy;
