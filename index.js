const core = require('@actions/core');
const github = require('@actions/github');


// most @actions toolkit packages have async methods
async function run() {
  try {
    const issue = github.context.issue;
    const key = core.getInput('key');
    const value = core.getInput('value');
    const myToken = core.getInput('myToken');
    const octokit = github.getOctokit(myToken);
    let data = {}

    console.log(issue['owner']);
    console.log(issue['repo']);
    console.log(issue['number']);
    console.log(key);
    console.log(value);

    const body = (await octokit.issues.get({owner:issue['owner'],repo:issue['repo'],issue_number:issue['number']})).data.body;

    console.log(body);

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

    return github.issues.update({owner:issue['owner'],repo:issue['repo'],issue_number:issue['number'], body:body})

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
