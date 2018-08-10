function ObjectFitFallback(options) {
  this.elements = options.elements;
}

ObjectFitFallback.prototype.update = function fallback() {
  this.elements.forEach(el => {
    const img = el.querySelector('img');
    const imgUrl = img.getAttribute('src');
    if (imgUrl) {
      img.parentNode.removeChild(img);
      el.style.backgroundImage = `url(${imgUrl})`;
    }
  });
};

module.exports = ObjectFitFallback;
