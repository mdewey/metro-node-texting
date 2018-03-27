if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require("express");
const bodyparser = require("body-parser");
const cors = require('cors');
const async = require("async");

const Airtable = require('airtable');
const base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY}).base(process.env.AIRTABLE_BASE);

const client = require("twilio")(process.env.TWILIO_SID, process.env.TWILIO_TOKEN)
const FROM_NUMBER = process.env.FROM_NUMBER || "+18137347245";

const server = express();

server.use(bodyparser.json());
server.use(cors());

server.get("/ping", (req, res) => {
    const pong = "ping";
    return res.json({pong})
});

server.get('/testairtable', (req, res) => {

    base('Volunteers')
        .select({
            // Selecting the first 3 records in All Applicants:
            maxRecords: 100,
            view: "Grid view"
        })
        .eachPage(function page(records, fetchNextPage) {
            // This function (`page`) will get called for each page of records.

            const _phones = records.map(function (record) {
                console.log('Retrieved', record.get('Phone'));
                return record.get('Phone');
            }).filter((num) => num);;
            console.log(_phones);
            res.json(_phones);   
        }).catch(err => {
            console.log(err);
        });
})

server.post("/send/message", (req, res) => {
    const _number = req.body.number
    const _message = req.body.message
    const output = _message || "help";
    const _rv = {
        _number
    }

    const getNumbers = (next) => {
        base('Volunteers')
        .select({
            // Selecting the first 3 records in All Applicants:
            maxRecords: 100,
            view: "Grid view"
        })
        .eachPage(function page(records, fetchNextPage) {
            // This function (`page`) will get called for each page of records.

            const _phones = records.map(function (record) {
                console.log('Retrieved', record.get('Phone'));
                return record.get('Phone');
            }).filter((num) => num);;
            console.log(_phones);
            next(null, _phones);   
        })
    }

    const sendMessages = (numbers, next) => {
        const _task = numbers.map(n => {
            return (next) => {
                console.log("sending number to " + n);
                client
                    .messages
                    .create({body: `Help Requested: ${output}, Please contact the at ${_number}`, to: n, from: FROM_NUMBER})
                    .then(message => {
                        next(null, message);
                    })
                    .catch(err => {
                        next(err);
                    })
            }
        })
        async.parallel(_task, (err) => {
            next(err);
        })
    }
    console.log("starting")
    async.waterfall([
        getNumbers, sendMessages
    ], (err) => {
        return res.json({err, toNumber: _number});
    })

})

server.listen(process.env.PORT || 8080, (err) => {
    console.log({message: "listening", err});
})
