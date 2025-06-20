require('dotenv').config();
const fs = require('fs');
const express = require('express');
const bodyParser = require("body-parser");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const usersRoutes = require("./routes/usersRoutes");
const db = require("./db/config");

const app = express();

app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));
app.use(express.json());
app.use(cors({
    "origin": "*",
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "preflightContinue": false,
    "optionsSuccessStatus": 204
}));

app.use('/system_generated', express.static(__dirname + '/system_generated'));
app.use('/uploads', express.static(__dirname + '/uploads'));

//creating folders and files for ticket storing and log saving
if (!fs.existsSync('./logs')) fs.mkdirSync('./logs', { recursive: true });
if (!fs.existsSync('./logs/api-logs.txt')) fs.open('./logs/api-logs.txt', 'w', (error, file) => { if (error) console.log(error) });
if (!fs.existsSync('./logs/email-logs.txt')) fs.open('./logs/email-logs.txt', 'w', (error, file) => { if (error) console.log(error) });
if (!fs.existsSync('./logs/sms-logs.txt')) fs.open('./logs/sms-logs.txt', 'w', (error, file) => { if (error) console.log(error) });

//Invoking mongodb connection
db.connect();

//Invoking server port connection
app.listen(process.env.NODE_PORT, () => {
    console.log(`Listening on port ${process.env.NODE_PORT}`);
});

//authentication routes
app.use(authRoutes);

//users routes
app.use(usersRoutes);

//404 implementation
app.use(function (req, res) {
    let response = {
        "success": false,
        "status": 404,
        "message": "API not found",
        "data": null
    }
    res.status(404).send(response);
});