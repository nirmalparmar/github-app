const express = require("express");
const { getOrganisationRepos } = require("../handlers/repos_handler");
const router = express.Router();

router.get('/org/:organisation', getOrganisationRepos);

module.exports = router;