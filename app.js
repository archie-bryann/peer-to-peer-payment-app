const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();
const helmet = require('helmet');
// const mongoose = require('mongoose');
// mongoose.connect(`mongodb+srv://${process.env.mongodbUsername}:${process.env.mongodbPassword}@mongodb-learn.3vlfl.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`);


const routes = require('./api/route');

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(helmet());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); // change later

    // const allowedOrigins = ['https://demo.com'];
    // const origin = req.headers.origin;
    // if (allowedOrigins.includes(origin)) {
    //      res.header('Access-Control-Allow-Origin', origin);
    // }
    res.header("Access-Control-Allow-Credentials", "true");
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET, OPTIONS');
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );

    if ('OPTIONS' === req.method) {
        return res.status(200).json({});
    } else {
        next();
    }
});

// app.get('/', (req, res) => {
//     return res.status(200).json({error:'Not Found'});
// });

app.use('/', routes);

// app.use('/uploads', express.static('uploads'));

/** Cache the folder where images are stored */
// const cacheTime = 86400000 * 30;
// app.use(express.static(path.join(__dirname, 'uploads'), {
//     maxAge: cacheTime
// }))


app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    return res.json({
        error: {
            message: error.message
        }
    });
});

module.exports = app;