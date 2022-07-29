const axios = require('axios').default;

async function getOrganisationRepos(org, endCursor) {
    let url = process.env.BASE_GRAPHQL_URI;
    let first = `first: ${process.env.PER_PAGE}`
    let after = endCursor ? `after: "${endCursor}"` : ''
    query = `query {
        organization(login: "${org}") {
          repositories(${first} ${after} isFork: false
            orderBy: {field: STARGAZERS, direction: DESC}) {
            edges {
              cursor
              node {
                name
                forkCount
                url
              }
            }
            pageInfo{
              endCursor
              hasNextPage
            }
          }
        }
    }`
    body = {
        query
    }
    let headers = {
        "Accept": "application/vnd.github+json",
        "Authorization": `bearer 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`
    }
    return axios.post(url, body, {headers})
}

async function getContributorsOfRepo(org, repoName, numberOfContributors){
    let url = `${process.env.BASE_REST_URI}/repos/${org}/${repoName}/stats/contributors`
    let headers = {
        "Accept": "application/vnd.github+json",
        "Authorization": `token ${process.env.ACCESS_TOKEN}`
    }
    return axios.get(url, {headers}).then(res => {
        if(res.data) {
            res.data.sort( (a ,b) => {
                return b.total - a.total 
            })
            return res.data.slice(0,numberOfContributors).map(e => {
                return {totalCommit: e.total, userName: e.author.login}
            })
        } else {
            return []
        }
    }).catch(err => { return []})
}

exports.getOrganisationRepos = async (req, res, next) => {
    let repos = []
    let makeRequest = true
    let endCursor = null
    let noOfRepos = req.query.n || process.env.DEFAULT_REPO_COUNT
    while(makeRequest){
        let res1 = await getOrganisationRepos(req.params.organisation, endCursor);
        repos.push(...res1.data.data.organization.repositories.edges)
        makeRequest = res1.data.data.organization.repositories.pageInfo.hasNextPage
        endCursor = res1.data.data.organization.repositories.pageInfo.endCursor
    }
    repos.sort((a,b) => {
        return b.node.forkCount - a.node.forkCount
    })
    repos = repos.slice(0,noOfRepos)
    result = []
    let numberOfContributors = req.query.m || process.env.DEFAULT_USER_COUNT
    for (let repo of repos) {
        let contributors = await getContributorsOfRepo(req.params.organisation, repo.node.name, numberOfContributors)
        result.push({
            repoName: repo.node.name,
            organization: req.params.organisation,
            url: repo.node.url,
            topMCommittees: contributors,
            forkCount: repo.node.forkCount
        })
    }
    
    res.json(result)
}
