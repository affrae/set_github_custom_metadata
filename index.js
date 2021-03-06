const core = require('@actions/core');
const github = require('@actions/github');
const regex = /<!-- abm_metadata = (.*) -->/


// most @actions toolkit packages have async methods
async function run() {
  try {
    const issue = github.context.issue;
    const issue_number = core.getInput('issue_number') ? core.getInput('issue_number') : github.context.issue['number'];
    const key = core.getInput('key') ? core.getInput('key') : null;
    const value = core.getInput('value');
    const myToken = core.getInput('myToken');
    const octokit = github.getOctokit(myToken);
    let data = {}

    console.log("issue_number: " + issue_number);

    let body = (await octokit.issues.get({owner:issue['owner'],repo:issue['repo'],issue_number:issue_number})).data.body;

    body = body.replace(regex, (_, json) => {
        data = JSON.parse(json)
        return ''
      })


    if (key !== null) {
      if (!data) data = {}
      if (typeof key === 'object') {
        Object.assign(data, key)
      } else {
        data[key] = value
      }
      body = `${body}<!-- abm_metadata = ${JSON.stringify(data)} -->`
    } else {
      body = `${body}<!-- abm_metadata = ${value} -->`
    }

    return octokit.issues.update({owner:issue['owner'],repo:issue['repo'],issue_number:issue_number,body:body})

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
