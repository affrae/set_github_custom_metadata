const core = require('@actions/core');
const github = require('@actions/github');
const regex = /\n\n<!-- abm_metadata = (.*) -->/


// most @actions toolkit packages have async methods
async function run() {
  try {
    const issue = core.getInput('issue_number') ? core.getInput('issue_number') : github.context.issue;
    const key = core.getInput('key');
    const value = core.getInput('value');
    const myToken = core.getInput('myToken');
    const octokit = github.getOctokit(myToken);
    let data = {}

    let body = (await octokit.issues.get({owner:issue['owner'],repo:issue['repo'],issue_number:issue['number']})).data.body;

    body = body.replace(regex, (_, json) => {
        data = JSON.parse(json)
        return ''
      })

    if (!data) data = {}

    if (typeof key === 'object') {
      Object.assign(data, key)
    } else {
      data[key] = value
    }

    body = `${body}\n\n<!-- abm_metadata = ${JSON.stringify(data)} -->`

    return octokit.issues.update({owner:issue['owner'],repo:issue['repo'],issue_number:issue['number'],body:body})

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
