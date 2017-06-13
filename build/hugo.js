const exec = require('child_process').exec;
const endOfLine = require('os').EOL;
const chalk = require('chalk');

function build(baseURL) {
  baseURL = (baseURL) ? baseURL : process.argv[2];
  console.log(chalk.green(`Base URL: ${baseURL} ${endOfLine}`));
  const buildDrafts = baseURL.includes('fws.gov/southeast') ? '--buildDrafts=false' : '--buildDrafts=true';
  const command = [
    'hugo',
    '--config=site/config.yml',
    '--source=site/',
    `--baseURL=${baseURL}`,
    buildDrafts
  ].join(' ');

  exec(command, (err, stdout, stderr) => {
    if (err) console.error(err);
    console.log(chalk.green(stdout));
  });

}

module.exports.build = build;
