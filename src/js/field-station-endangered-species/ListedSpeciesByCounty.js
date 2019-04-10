const fips = require('fips-county-codes');

class ListedSpeciesByCounty {
  constructor(opts) {
    this.form = opts.form;
    this.select = opts.select || this.form.querySelector('select');
    this.input = opts.input || this.form.querySelector('input[type=search]');
    this.submit = opts.submit || this.form.querySelector('input[type=submit]');
    this.state = opts.state || null;
    this.list = opts.list;

    // Initialize selected state, if provided
    if (this.state) document.querySelector(`[value=${this.state}`).selected = true;

    this.input.addEventListener('keyup', this.search.bind(this));
    this.select.addEventListener('change', this.updateState.bind(this));
  }

  updateState(e) {
    this.state = e.target.value;
  }

  search(e) {
    if (!e.target.value.length) return [];
    const query = new RegExp(e.target.value, 'gi');
    const matches = fips.search(query);
    const data = this.state
      ? matches.filter(row => row.state === this.state)
      : matches;

    this.render(data);
    return data;
  }

  render(data) {
    const html = data.map(this.ecosLinkTemplate).join('');
    this.list.innerHTML = html;
    return html;
  }

  ecosLinkTemplate(row) {
    return `
      <li>
        <a href="https://ecos.fws.gov/ecp0/reports/species-by-current-range-county?fips=${
  row.fips
}">${row.county}</a>
      </li>
    `;
  }
}

module.exports = ListedSpeciesByCounty;
