if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express  = require("express");
const bodyparser = require("body-parser");
const cors = require('cors');
const async = require("async");

const client = require("twilio")(process.env.TWILIO_SID, process.env.TWILIO_TOKEN)
const FROM_NUMBER = process.env.FROM_NUMBER || "+18137347245";
const server = express();

server.use(bodyparser.json());
server.use(cors());

server.get("/ping", (req, res) =>{
    const pong = "ping";
    return res.json({pong})
});

server.post("/send/message", (req, res) => {
    const _number = req.body.number

    const  _rv =  {
        _number
    }

    const getNumbers = (next) => {
        const _rv = ["8144219298"]

        next(null, _rv);
    }

    const sendMessages = (numbers, next) => {
        const _task = numbers.map(n => {
            return (next) => {
                console.log("sending number to "+ n);
                client.messages.create({
                    body:"Testing", 
                    to:n,
                    from:FROM_NUMBER
                }).then(message =>{
                    next(null, message);
                }).catch(err => {
                    next(err);
                })
            }
        })
        async.parallel(_task, (err) => {
            next (err);
        })
    }
    console.log("starting")
    async.waterfall([getNumbers, sendMessages], (err) => {
        return res.json({err, toNumber: _number});
    })

})

server.listen(process.env.PORT || 8080, (err) => {
    console.log({message:"listening", err});
})
