/**
 * Created by lazylad91 on 3/31/17.
 */

var kafka = require('kafka-node');
var KeyedMessage = kafka.KeyedMessage;

var createMessage = function(messageType, messageKey, data){
    if(messageType==="keyed"){
        var keyedMessage = new KeyedMessage(messageKey, data);
        return keyedMessage;
    }
    else if(messageType==="simple"){
        return messageKey;
    }
}

module.exports = {createMessage : createMessage};