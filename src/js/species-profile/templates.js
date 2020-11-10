const error = () => `<li>We're sorry but an error occurred.  Visit the <a href="https://federalregister.gov" target="_blank">Federal Register</a> to conduct your own search.</li>`

const noResults = (name) => {
  return `
    <li class="federal-register-item">
      No results found for <em>${name}</em>
    </li>`
}

const results = ({ results }) => {
  return results.map(result => {
    const date = new Date(result.publication_date);
    return `
      <li class="card card-text">
        <span class="card-ribbon">
          <span class="card-type">${result.type}</span>
        </span>
        <span class="card-date">${date.toLocaleDateString('en-US')}</span>
        <p class="card-text"><a href="${result.html_url}">${result.title}</a>.</p>
      </li>`
  }).join('');
}

module.exports = {
  error: error,
  noResults: noResults,
  results: results
}