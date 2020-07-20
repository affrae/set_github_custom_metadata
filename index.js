const core = require('@actions/core');
const wait = require('./wait');


// most @actions toolkit packages have async methods
async function run() {
  try {
    const issue = github.context.issue;
    const key = core.getInput('key');
    const myToken = core.getInput('myToken');
    const octokit = github.getOctokit(myToken);
    console.log(issue['owner']);
    console.log(issue['repo']);
    console.log(issue['number']);

    const body = (await octokit.issues.get({owner:issue['owner'],repo:issue['repo'],issue_number:issue['number']})).data.body;

    console.log(body);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
