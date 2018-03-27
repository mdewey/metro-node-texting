const express  = require("express");
const bodyparser = require("body-parser");
const cors = require('cors')
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

    return res.json(_rv);
})

server.listen(process.env.PORT || 8080, (err) => {
    console.log({message:"listening", err});
})
