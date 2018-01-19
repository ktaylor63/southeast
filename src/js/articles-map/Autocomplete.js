const emitter = require('./eventBus');
const format = require('date-fns/format');

class Autocomplete {
  constructor(opts) {
    this.form = opts.form;
    this.input = opts.form.querySelector('.autocomplete-input');
    this.results = opts.form.querySelector('.autocomplete-results');
    this.limit = opts.limit || 3;

    this.input.addEventListener('input', this.keyHandler.bind(this));
    this.input.addEventListener('focus', () => {
      this.keyHandler({ target: { value: this.input.value } });
      this.moveCursorToEnd(this.input);
    });
    this.form.addEventListener('submit', e => e.preventDefault());
    this.results.addEventListener('click', this.buttonHandler.bind(this));
    emitter.on('search.results', this.renderResults.bind(this));
    emitter.on('story.selected', this.hideResults.bind(this));
  }

  moveCursorToEnd(el) {
    if (typeof el.selectionStart == 'number') {
      el.selectionStart = el.selectionEnd = el.value.length;
    } else if (typeof el.createTextRange != 'undefined') {
      el.focus();
      var range = el.createTextRange();
      range.collapse(false);
      range.select();
    }
  }

  buttonHandler(e) {
    if (e.target && e.target.nodeName === 'BUTTON') {
      const data = e.target.getAttribute('data-story');
      this.input.value = e.target.textContent;
      emitter.emit('story.selected', JSON.parse(data));
      this.results.innerHTML = '';
    }
  }

  hideResults(story) {
    this.input.value = story.title;
    this.renderResults([]);
  }

  createSearchResultItem(s) {
    const type = s.section === 'articles' ? 'Story' : 'Press Release';
    return `
      <li>
        <button data-story='${JSON.stringify(s)}'>
          ${s.title}
          <span class="result-detail">
            <span class="type">${type}</span>
            <span class="date">${format(s.date, 'MMM D, YYYY')}</span>
          </span>
        </button>
      </li>
    `;
  }

  renderResults(stories) {
    const filtered = stories.filter(s => s.highlight);
    const byScore = (a, b) => b.score - a.score;
    this.results.innerHTML = filtered
      .sort(byScore)
      .map(this.createSearchResultItem)
      .join('');
  }

  keyHandler(e) {
    const query = e.target.value;
    if (query.length === 0) emitter.emit('autocomplete.keyup', '');
    if (query.length < this.limit) return;
    emitter.emit('autocomplete.keyup', query);
  }
}

module.exports = Autocomplete;
