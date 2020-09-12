const mongoose = require("mongoose");

mongoose.set("debug", true);
mongoose.Promise = Promise;
mongoose.connect(process.env.DB_URL, {
    keepAlive:true
}, (err) => {
    console.log("DB error:" + JSON.stringify(err));
});

module.exports.User = require("./user");