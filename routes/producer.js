/**
 * Created by lazylad91 on 3/31/17.
 */

var kafka = require('kafka-node');
var Producer = kafka.HighLevelProducer;
var Client = kafka.Client;
var Promise = require('promise');
var client = new Client(config_file.zookeeperServerURL);

//var argv = require('optimist').argv;
var producer = new Producer(client, { requireAcks: 1,  partitionerType: 2});

producer.isReady = false;

producer.on('ready', function () {
    producer.isReady = true;
    console.log("Producer is ready now");
});

producer.on('error', function (err) {
    console.log('error', err);
});


/**
    Function for sending message to
    Arguements
    topic - topic name
    messageArray - array of messages to be push to topic
    partition - number of partition
    attribute - attribute
    callback - callback function which will be called with the result

 */
var sendMessage = function(topic, messageArray, partition, attribute, callback){
    console.log("send message starting");
    var promise = new Promise(function(resolve,reject){
            var payload = [];
            try {
                if (Array.isArray(topic)) {
                    for (var i = 0; i < topic.length; i++) {
                        payload.push({
                            topic: topic[i],
                           // partition: partition,
                            messages: messageArray,
                            attributes: attribute
                        });
                    }
                }
                else {
                    payload.push({topic: topic,  messages: messageArray, attributes: attribute});
                }

                resolve(payload);
            }
            catch(error){
                reject(error);
            }
            });

    promise.then(function(payload){
        producer.send(payload, function (err, result) {
            console.log(err || result);
            callback(err || result);
            //process.exit();
        });
    },function(error){
        console.log(error);
    });

}

module.exports = {producer: producer, sendMessage: sendMessage};