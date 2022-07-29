# Github App

## Install Node modules

    npm install

## Start server

    node index.js

# Endpoints

## Get list of top n repositories of organization based on forkCount(desc) and top m committees of 

### Request

`GET /repos/org/{organisation}?n={number}&m={number}`

    curl -i -H 'Accept: application/json' http://localhost:3000/repos/org/{organisation}?n={number}&m={number}

### Response

    HTTP/1.1 200 OK
    Date: Thu, 24 Feb 2011 12:36:30 GMT
    Status: 200 OK
    Connection: close
    Content-Type: application/json
    Content-Length: 2

    [
        {
            {
                "repoName": String,
                "organization": String,
                "url": String,
                "topMCommittees":[
                    {
                        "totalCommit": Integer,
                        "userName": String
                    }
                ],
                "forkCount": Integer
            }
        }
    ]
