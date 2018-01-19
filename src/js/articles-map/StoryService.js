require('array.prototype.find').shim();
const lunr = require('lunr');
const emitter = require('./eventBus');

class StoryService {
  constructor(data) {
    this.data = data;
    this.index = lunr(function seedIndex() {
      this.ref('id');
      this.field('title', { boost: 100 });
      this.field('uri', { boost: 1 });
      this.field('tags', { boost: 10 });
      this.field('summary');
      this.field('description');
      this.field('type');
      data.forEach((story, i) =>
        this.add(
          Object.assign({}, story, { id: i, tags: story.tags.join(' ') })
        )
      );
    });

    emitter.on('autocomplete.keyup', this.highlightStories.bind(this));
  }

  highlightStories(term) {
    // Create an array of ids each representing a story by ID
    const results = this.search(term);

    // Update the 'highlight' property on the story object
    const json = this.data.map(story => {
      const result = results.find(r => r.title === story.title);
      if (result) return Object.assign({}, result, { highlight: true });
      return Object.assign({}, story, { highlight: false, score: 0 });
    });

    emitter.emit('search.results', json);
  }

  // Search the LunrJS index and return results with score and id properties added
  search(term) {
    if (!term) return [];
    return this.index
      .search(term) // Boost importance of title in search
      .map(r =>
        Object.assign({}, this.data[r.ref], { score: r.score, id: r.ref })
      );
  }
}

module.exports = StoryService;
