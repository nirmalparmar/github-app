const axios = require('axios').default;
const { findAndDelete, createEntry, findAndUpdate, findRecord, aggregator } = require('../mongo/mongo_utility');


async function getOrganisationRepos(org, endCursor) {
    //used proxy server

    let url = `${process.env.BASE_GRAPHQL_URI}` ;
    let first = `first: ${process.env.PER_PAGE}`
    let after = endCursor ? `after: "${endCursor}"` : ''
    query = `query {
        organization(login: "${org}") {
          repositories(${first} ${after} isFork: false
            orderBy: {field: STARGAZERS, direction: DESC}) {
            nodes {
                name
                forkCount
                url
                owner {
                    login
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
        "Authorization": `bearer ${process.env.ACCESS_TOKEN.trim()}`
    }
    return axios.post(url, body, {headers})
}

async function getContributorsOfRepo(org, repoName, numberOfContributors){
    console.log(repoName)
    let url = `${process.env.BASE_REST_URI}/repos/${org}/${repoName}/stats/contributors`;
    let headers = {
        "Accept": "application/vnd.github+json",
        "Authorization": `token ${process.env.ACCESS_TOKEN.trim()}`
    }
    return axios.get(url, {headers}).then(res => {
        
        return findAndUpdate('repos', {name: repoName}, {$push: { contributors:{ $each: res.data, $sort: { total: -1}, $slice:numberOfContributors }}} ).then(res => {
            return res
        })
        
    }).catch(err => { return err})
}

exports.getOrganisationRepos = async (req, res, next) => {
    let makeRequest = true
    let endCursor = null
    let noOfRepos = req.query.n || parseInt(process.env.DEFAULT_REPO_COUNT)
    let fetchRepos = noOfRepos + 15
    await findAndDelete('repos', { "owner.login": req.params.organisation });
    while(makeRequest && fetchRepos > 1){
        try{
            let res1 = await getOrganisationRepos(req.params.organisation, endCursor);
            fetchRepos = fetchRepos - process.env.PER_PAGE
            createEntry('repos', res1.data.data.organization.repositories.nodes).then()
            .then(res => {
                console.log("DB write repos")
            })
            makeRequest = res1.data.data.organization.repositories.pageInfo.hasNextPage
            endCursor = res1.data.data.organization.repositories.pageInfo.endCursor
        } catch (err) {
            console.log(err);
            res.json(err)
            break
        }
    }
    let limit = parseInt(req.query.n)
    let repos = await findRecord('repos', { "owner.login": req.params.organisation }, {"forkCount": -1}, {name: true}, limit)
    console.log(repos)
    let noContributors = parseInt(req.query.m)
    try{
        let response = await Promise.all(repos.map(r => getContributorsOfRepo(req.params.organisation, r.name, noContributors)))
    } catch (err) {
        res.json(err)
    }

    let agg = [
        { '$match': { 
            'owner.login' : req.params.organisation,
        }},
        { $sort : { 'forkCount' : -1 } },
        { $limit: limit },
        {
            '$project': { 
                'name': true,
                'url': true,
                'owner.login': true,
                'forkCount': true, 
                'contributors': {
                    '$map': { 
                        'input': '$contributors', 
                        'as': 'c', 
                        'in': { 
                            'total': '$$c.total', 
                            'name': '$$c.author.login'
                        }
                    }
                }
            }
        }
    ]
    let result = await aggregator('repos', agg)
    res.json(result)
}
