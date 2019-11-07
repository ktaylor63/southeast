const fs = require('fs');

const titleCase = require('title-case');
const madison = require('madison');
const PHONE = require('google-libphonenumber');

const PNF = PHONE.PhoneNumberFormat;
const phoneUtil = PHONE.PhoneNumberUtil.getInstance();
const frontmatter = require('gray-matter');
const cheerio = require('cheerio');
const parallel = require('async/parallel');
const pretty = require('pretty');
const helpers = require('./helpers');

const template = require('./template');

const htmlSrc = '../../../site/content/usfws-southeast-region-leadership-directory.html';
const dataSrc = '../../data/seafwa-directory.js';
const dataDist = '../../../site/static/data/seafwa-directory.js';

const byName = (a, b) => a.Name.localeCompare(b.Name);

const normalizeState = state => {
  const trimmed = state.trim().replace('.', '');
  if (!trimmed) return '';
  return trimmed.length === 2 ? madison.getStateName(trimmed) : titleCase(trimmed);
};

const normalizeCity = city => titleCase(city);

const normalizePhone = number => {
  if (!number) return '';
  const num = phoneUtil.parseAndKeepRawInput(number, 'US');
  return phoneUtil.format(num, PNF.NATIONAL);
};

const normalize = e => {
  const regex = /[()/sA-Za-z]/g;
  const mobile = e.MobilePhone.replace(regex, '');
  const office = e.OfficePhone.replace(regex, '');

  return {
    ...e,
    City: normalizeCity(e.City),
    State: normalizeState(e.State),
    OfficePhone: normalizePhone(office),
    MobilePhone: normalizePhone(mobile)
  };
};

const readFile = (filePath, cb) => {
  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) return cb(err);
    return cb(null, data);
  });
};

const writeFile = (filePath, data) => {
  const toFile = Array.isArray(data) ? JSON.stringify(data) : data;
  fs.writeFile(filePath, toFile, err => {
    if (err) return console.log(err);
  });
};

const initialize = (err, results) => {
  if (err) return console.log(err);
  const htmlData = frontmatter(results.html);
  const $ = cheerio.load(htmlData.content, { xmlMode: true });
  const $list = $('.card-list');
  const $updated = $('.updated');
  const employees = JSON.parse(results.data);
  const now = new Date();

  const outData = employees.map(normalize);

  const html = outData
    .sort(byName)
    .map(template)
    .join('');

  $list.empty().append(html);
  $updated.append(now.toLocaleDateString());
  htmlData.content = pretty($.html());
  writeFile(htmlSrc, htmlData.stringify());
  writeFile(dataDist, outData);
};

parallel(
  {
    html: readFile.bind(null, htmlSrc),
    data: readFile.bind(null, dataSrc)
  },
  initialize
);
