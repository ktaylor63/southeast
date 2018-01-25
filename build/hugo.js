const exec = require('child_process').exec;
const endOfLine = require('os').EOL;
const chalk = require('chalk');

const liveBaseUrl = 'fws.gov/southeast';

function build(baseURL) {
  const base = baseURL || process.argv[2];
  console.log(chalk.yellow(`Base URL: ${base} ${endOfLine}`));
  const buildDrafts = baseURL.includes(liveBaseUrl) ? '--buildDrafts=false' : '--buildDrafts=true';
  const buildFuture = baseURL.includes(liveBaseUrl) ? '--buildFuture=false' : '--buildFuture=true';
  const command = [
    'hugo',
    '--config=site/config.yml',
    '--source=site/',
    `--baseURL=${base}`,
    buildDrafts,
    buildFuture
  ].join(' ');

  exec(command, (err, stdout, stderr) => {
    if (err) console.error(err);
    console.log(chalk.green(stdout));
    console.log(chalk.red(stderr));
  });
}

module.exports.build = build;
