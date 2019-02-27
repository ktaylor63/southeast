const exec = require('child_process').exec;
const endOfLine = require('os').EOL;
const chalk = require('chalk');

function build(env) {
  const environment = env || process.argv[2];
  console.log(chalk.yellow(`Environment: ${environment} ${endOfLine}`));
  const config =    environment === 'production' ? 'config.yml' : 'config.staging.yml';
  const command = ['hugo', `--config=${config}`, '--source=site'].join(' ');

  exec(command, (err, stdout, stderr) => {
    if (err) console.error(err);
    console.log(chalk.green(stdout));
    console.log(chalk.red(stderr));
  });
}

module.exports.build = build;
