const exec = require('child_process').exec;
const endOfLine = require('os').EOL;

function build(baseURL) {
  baseURL = (baseURL) ? baseURL : process.argv[2];
  console.log(`Base URL: ${baseURL} ${endOfLine}`);
  const buildDrafts = baseURL.includes('localhost') ? '--buildDrafts=true' : '--buildDrafts=false';
  const command = [
    'hugo',
    '--config=site/config.yml',
    '--source=site/',
    `--baseURL=${baseURL}`,
    buildDrafts
  ].join(' ');

  exec(command, (err, stdout, stderr) => {
    if (err) console.error(err);
    console.log(stdout);
  });

}

module.exports.build = build;
