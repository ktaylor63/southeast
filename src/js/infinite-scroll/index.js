const throttle = require('lodash.throttle');

const list = document.querySelector('.infinite-list');

const closest = (elem, selector) => {
  for ( ; elem && elem !== document; elem = elem.parentNode ) {
    if ( elem.matches( selector ) ) return elem;
  }
  return null;
};

const lazyLoadImages = e => {
  const SRC_ATTRIBUTE = 'data-src';
  const nearestLazyImg = list.querySelector(`[${SRC_ATTRIBUTE}]`);
  const nearestLazyItem = closest(nearestLazyImg, '.infinite-list--item');
  if (!nearestLazyItem) return;
  const lazyImgFromView = nearestLazyItem.getBoundingClientRect().top - window.innerHeight;

  if (lazyImgFromView < 700){
    nearestLazyImg.src = nearestLazyImg.getAttribute(SRC_ATTRIBUTE);
    nearestLazyImg.removeAttribute(SRC_ATTRIBUTE);
  }
}

window.addEventListener('scroll', throttle(lazyLoadImages, 75));
