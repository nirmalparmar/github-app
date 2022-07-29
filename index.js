require('dotenv').config();
const express = require("express");
const bodyParser = require('body-parser');
const cors = require('cors');
const errorHandler = require('./handlers/error');
const respoRoutes = require('./routes/repos');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/repos', respoRoutes);

app.use((req, res, next) => {
    console.log("No route found")
    let err = new Error("Not Found");
    err.status = 404;
    next(err);
});
app.use(errorHandler);
app.listen(process.env.PORT, ()=>{
    console.log(`server running on ${process.env.PORT}`);
})