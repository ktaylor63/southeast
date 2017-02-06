const spawn = require('child_process').spawn;

function build(baseURL) {
  baseURL = (baseURL) ? baseURL : process.argv[3];
  const hugo = spawn('hugo', [
    '--canonifyURLs=true',
    '--config=site/config.yml',
    '--destination=../dist/',
    '--source=site/',
    `--baseURL=${baseURL}`
  ]);

  hugo.stdout.on('data', (data) => console.log(data.toString('utf8')) );

  hugo.stderr.on('data', (data) => console.error(data.toString('utf8')) );

  hugo.on('exit', (code) => console.log(`Hugo build finished with code ${code}.`))
}

module.exports.build = build;
