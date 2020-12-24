const core = require('@actions/core');
const github = require('@actions/github');
const regex = /<!-- abm_metadata = (.*) -->/


// most @actions toolkit packages have async methods
async function run() {
  try {
    const issue = github.context.issue;
    const issue_number = core.getInput('issue_number') ? core.getInput('issue_number') : github.context.issue['number'];
    const key = core.getInput('key') ? core.getInput('key') : null;
    const value = core.getInput('value') ? core.getInput('value') : null;
    const myToken = core.getInput('myToken');
    const octokit = github.getOctokit(myToken);
    let data = {}

    core.info("issue_number: " + issue_number);

    let body = (await octokit.issues.get({owner:issue['owner'],repo:issue['repo'],issue_number:issue_number})).data.body;

    body = body.replace(regex, (_, json) => {
        data = JSON.parse(json)
        return ''
      })

    if (!data) data = {}

    core.info("BEFORE: data: " + JSON.stringify(data))

    if (key !== null && value !== null) {
      core.info("key !== null && value !== null")
      if (typeof key === 'string' && typeof value === 'string') {
        core.info("typeof key === 'string' && typeof value === 'string'")
        data[key] = value
      }
      body = `${body}<!-- abm_metadata = ${JSON.stringify(data)} -->`
    } else if (key !== null && key.startsWith('{') && key.endsWith('}')) {
        core.info("key !== null && key.startsWith('{') && key.endsWith('}')")
        parsedKey = JSON.parse(key)
        if (parsedKey !== null && typeof parsedKey === 'object') {
          core.info("parsedKey !== null && typeof parsedKey === 'object'")
          Object.assign(data, parsedKey)
        } else {
          core.info('There is  a problem with key')
        }
        body = `${body}<!-- abm_metadata = ${JSON.stringify(data)} -->`
    } else if (value !== null) {
      core.info("value !== null")
      body = `${body}<!-- abm_metadata = ${value} -->`
    }

    core.info("AFTER: data: " + JSON.stringify(data))

    return octokit.issues.update({owner:issue['owner'],repo:issue['repo'],issue_number:issue_number,body:body})

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
