const Draggable = require('draggable');

const svg = require('./handle');

const hero = document.querySelector('.hero');
const output = document.querySelector('.output strong');
const light = document.querySelector('.light');
const dark = document.querySelector('.dark');

svg.style = `position: absolute; top: ${hero.offsetHeight / 2}; left: ${hero.offsetWidth / 2};`;
hero.appendChild(svg);

const onDragEnd = (el, x, y) => {
  const left = (x / hero.offsetWidth).toLocaleString(undefined, { style: 'percent' });
  const top = (y / hero.offsetHeight).toLocaleString(undefined, { style: 'percent' });
  output.innerHTML = `${left} ${top}`;
};

const circle = new Draggable(svg, { onDragEnd });

light.addEventListener('click', () => (svg.style.fill = '#fff'));
dark.addEventListener('click', () => (svg.style.fill = '#000'));
