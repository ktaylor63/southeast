const listedSpecies = species => `<li><a href="${species[1].url}">${species[0]} <em>(${
    species[1].value
  })</em></a>, ${species[2].toLowerCase()}</li>`;

const atRiskSpecies = species => `<li><a href="https://www.fws.gov/southeast/finder/species/${species.id}">${
    species.commonName
  } <em>(${species.scientificName})</em></a></li>`;

module.exports = {
  listedSpecies,
  atRiskSpecies
};
