const CONSTRUCTION_OR_DEVELOPMENT = 'construction-or-development';
const CONSTRUCTION_EXPANSION = 'large-construction-expansion';

const constructionForm = document.getElementById(CONSTRUCTION_OR_DEVELOPMENT);
const constructionOutput = document.querySelector(`.${CONSTRUCTION_OR_DEVELOPMENT}-output`);
constructionForm.addEventListener('submit', e => displayGuidelines(e, constructionForm));

const expansionForm = document.getElementById(CONSTRUCTION_EXPANSION);
const expansionOutput = document.querySelector(`.${CONSTRUCTION_EXPANSION}-output`);
expansionForm.addEventListener('submit', e => displayGuidelines(e, expansionForm));

function displayGuidelines(e, form) {
  e.preventDefault();
  clearOutput(form);
  const els = form.elements;
  const baseClass = form.id;
  const isVisible = (els['visible-nest'].checked) ? 'yes' : 'no';
  const isSimilar = (els['similar-activity'].checked) ? 'yes' : 'no';
  const selector = [baseClass, isVisible, isSimilar].join('-');
  document.querySelector(`.${selector}`).classList.add('active');
}

// To Do: On submit hide all form results so the user can re-submit
// without displaying multiple results

function clearOutput(form) {
  const activeOutputs = Array.from(form.querySelectorAll('.active'));
  activeOutputs.forEach(o => o.classList.remove('active'));  
}
