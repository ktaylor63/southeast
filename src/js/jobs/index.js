const qs = require('query-string');
const xhr = require('xhr');
const date = require('date-and-time');

const output = document.querySelector('.card-list');
const API_KEY = '84OIdzD2Zota1B7hzOQmuWydt/kh8k1z2bdCx6dHpBY=';
const baseURL = 'https://data.usajobs.gov/api/search';
const parameters = {
  Organization: 'IN15', // Get results for USFWS only
  // Get results from R4 States/Provinces only
  LocationName:
    'Alabama;Arkansas;Florida;Georgia;Kentucky;Mississippi;North Carolina;Puerto Rico;South Carolina;Tennessee;Virgin Islands'
};

const queryString = qs.stringify(parameters);
const url = [baseURL, queryString].join('?');

const options = {
  url,
  headers: {
    'Authorization-Key': API_KEY
  }
};

function showError(err, message) {
  return `
    <li class="job-item">
      <h3>${err}</h3>
      <p>${message}</p>
    </li>
  `;
}

function getGrade(lowGrade, highGrade) {
  return lowGrade === highGrade ? lowGrade : `${lowGrade}/${highGrade}`;
}

function getCompensation(salary) {
  return `${Number(salary.minRange).toLocaleString()} - ${Number(
    salary.maxRange
  ).toLocaleString()}`;
}

function createJobSeries(category) {
  return `<li>Job Series: ${category.Name} (${category.Code})</li>`;
}

function createLocationList(location) {
  return `<li>Location: ${location.LocationName}</li>`;
}

function createCard(data) {
  const closeDate = date.format(new Date(data.ApplicationCloseDate), 'MMMM D, YYYY');
  const details = data.UserArea.Details;
  const grade = getGrade(details.LowGrade, details.HighGrade);
  const salary = data.PositionRemuneration[0];
  const compensation = getCompensation(salary);
  console.log(salary);
  return `
    <li class="card card-text">
      <h3><a href="${data.PositionURI}" target="_blank">${data.PositionTitle} (${data.JobGrade[0]
  .Code} ${grade})</a></h3>
      <p><strong>Key Details:</strong></p>
      <ul>
        <li>Application Close Date: ${closeDate}</li>
        <li>Compensation: ${compensation}</li>
        <li>Position Type: ${data.PositionSchedule[0].Name} ${data.PositionOfferingType[0]
  .Name}</li>
        ${data.JobCategory.map(createJobSeries).join('')}
        ${data.PositionLocation.map(createLocationList).join('')}
      </ul>
      <p>${details.JobSummary}</p>
      <p><a href="${data.ApplyURI[0]}" target="_blank">Apply online</a></p>
      <p>Who may apply: ${details.WhoMayApply.Name}</p>
    </li>
  `;
}

function render(err, message, results) {
  if (err) return showError(err, message);
  results
    .map(result => {
      const data = result.MatchedObjectDescriptor;
      const html = createCard(data);
      output.innerHTML = html;
      return html;
    })
    .join('');
}

function expandSearch() {
  const h2 = document.createElement('h2');
  h2.innerHTML = 'No Results in the Southeast, Expanding Search Nationwide:';
  const string = qs.stringify({ Organization: 'IN15' });
  options.url = [baseURL, string].join('?');

  xhr.get(options, (err, res, body) => {
    if (err) {
      render(
        'Could not download jobs listings',
        'Visit <a href="https://usajobs.gov">USAjobs.gov</a> to create your own search.',
        null
      );
    }

    if (!err && res.statusCode === 200) {
      const data = JSON.parse(body);
      if (data.SearchResult.SearchResultCount === 0) {
        render(
          'No U.S. Fish and Wildlife job openings found.',
          'Try <a href="https://usajobs.gov">USAjobs.gov</a> to expand your search criteria.',
          null
        );
      } else {
        render(null, null, data.SearchResult.SearchResultItems);
        output.parentNode.insertBefore(h2, output);
      }
    }
  });
}

xhr(options, (err, res, body) => {
  if (err) expandSearch();

  if (!err && res.statusCode === 200) {
    const data = JSON.parse(body);
    if (data.SearchResult.SearchResultCount === 0) expandSearch();
    else render(null, null, data.SearchResult.SearchResultItems);
  }
});
