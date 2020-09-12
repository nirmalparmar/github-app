require('dotenv').config();
const express = require("express");
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require("./routes/auth");
const errorHandler = require('./handlers/error');

const app = express();
app.use(cors());
app.use(bodyParser.json());


app.use('api/auth', authRoutes);

app.use((req, res, next) => {
    console.log("No route found")
    let err = new Error("Not Found");
    err.status = 404;
    next(err);
});

app.use(errorHandler);
app.listen(5000, ()=>{
    console.log("server running on 5000");
})