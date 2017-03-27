// What should we do about drawer content??
// Pass it in?
// Grab it from the HTML, inject it into the content container, then remove the HTML?


const Drawer = function(options) {
  this.active = options.active || false;
  this.activeClass = options.activeClass || 'active';
  this.containerClass = options.containerClass || '';
  this.backgroundClass = options.backgroundClass || 'drawer-background';
  this.contentClass = options.contentClass || 'drawer-content';
  this.activateCb = options.activateCb || function() {};
  this.deactivateCb = options.deactivateCb || function() {};
  this.htmlContent = options.htmlContent || '';
  this.target = options.target || document.body;
  this.create();
  this.render();
}

Drawer.prototype.create = function() {
  this.container = document.createElement('div')
  this.container.classList.add('drawer');
  if (this.containerClass !== '') this.container.classList.add(this.containerClass);
  this.background = document.createElement('div');
  this.background.classList.add(this.backgroundClass);
  this.close = document.createElement('button');
  this.close.classList.add('close-drawer');
  this.content = document.createElement('div');
  this.content.classList.add(this.contentClass);
  this.content.appendChild(this.close);
  this.container.appendChild(this.background);
  this.container.appendChild(this.content);
  this.target.appendChild(this.container);
}

Drawer.prototype.activate = function() {
  this.active = true;
  this.container.classList.add(this.activeClass);
  this.activateCb(); // .bind(this)?
}

Drawer.prototype.deactivate = function() {
  this.active = false;
  this.container.classList.remove(this.activeClass);
  this.deactivateCb(); // .bind(this)?
}

Drawer.prototype.toggle = function() {
  this.active ? deactivate() : activate();
}

Drawer.prototype.render = function() {
  if (typeof this.htmlContent === 'string') this.content.innerHTML = this.htmlContent;
  else this.content.innerHTML = this.htmlContent();
}

Drawer.prototype.topZindex = function() {
  const drawers = Array.from(document.querySelectorAll('.drawer'));
  const z = drawers.reduce((acc, d) => d.style.zIndex > acc ? d.style.zIndex : acc, 0);
  return parseInt(z);
}

module.exports = Drawer;
