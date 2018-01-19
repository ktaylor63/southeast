const slugify = require('underscore.string/slugify');
const emitter = require('./eventBus');

class Infowindow {
  constructor(opts) {
    this.visible = opts.visible || false;
    this.container = opts.container;
    this.content = this.container.querySelector('.infowindow-content');
    this.toggleBtn = this.container.querySelector('button');
    this.baseURL = document.body.getAttribute('data-root');

    if (this.visible) this.show();

    this.toggleBtn.addEventListener('click', this.toggle.bind(this));
    emitter.on('story.selected', this.renderStory.bind(this));
    emitter.on('autocomplete.keyup', this.hide.bind(this));
  }

  renderStory(story) {
    const imgURL = `${this.baseURL}images/hero/small/${story.img}`;
    const text =
      story.description === 'null' || !story.description
        ? story.summary
        : story.description;
    const img =
      story.img === 'null' || !story.img
        ? ''
        : `<a href="${story.uri}"><img src="${imgURL}" alt="${story.alt}" />
      </a>`;
    this.content.innerHTML = `
      ${img}
      <h2>${story.title}</h2>
      <p>${text}</p>
      <p><a href="${story.uri}" class="button" target="_blank">Read more &raquo;
      </a></p>
      <ul>${story.tags
        .map(
          t =>
            `<li class="tag"><a href="/tags/${slugify(t)}"
            target="_blank">${t}</a></li>`
        )
        .join('')}</ul>
    `;
    emitter.emit('infowindow.renderedStory');
    if (!this.visible) this.show();
  }

  show() {
    if (this.visible) return;
    this.container.classList.add('open');
    this.visible = true;
    emitter.emit('infowindow.show', 1);
  }

  hide() {
    if (!this.visible) return;
    this.container.classList.remove('open');
    this.visible = false;
    emitter.emit('infowindow.hide', -1);
  }

  toggle() {
    this.visible ? this.hide() : this.show();
    emitter.emit('infowindow.toggle');
  }
}

module.exports = Infowindow;
