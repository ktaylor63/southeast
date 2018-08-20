const lunr = require('lunr');

module.exports = docs =>
  lunr(function lunrIndex() {
    this.field('name');
    this.field('office');
    this.field('type');
    this.field('url');
    this.field('year');
    this.field('programs');
    this.field('keywords');
    this.ref('id');

    docs.forEach((doc, i) => {
      this.add({
        id: i,
        name: doc.name,
        office: doc.office,
        type: doc.type,
        year: doc.year,
        url: doc.url,
        keywords: doc.keywords,
        programs: doc.programs
      });
    });
  });
