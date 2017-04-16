var express = require('express');
var producer = require('./producer');
var message = require('./message');
var router = express.Router();

/* Send Image to kafka topic. */
router.post('/fileUpload', function(req, res, next) {
    console.log(req.body);
    var kafkamessage = [];
    try {
        if (producer.producer.isReady) {
            kafkamessage.push(message.createMessage('keyed',"image", JSON.stringify(req.body)));
            kafkamessage.push(message.createMessage("simple","this is simple message",""));
            producer.sendMessage("test",kafkamessage,0,0,function(result){
                res.send(result);
            });
        }
        else{
            res.send("producer is not ready");
        }
    }
    catch(error){
        console.log(error);
        res.send(error);
    }


});

module.exports = router;
