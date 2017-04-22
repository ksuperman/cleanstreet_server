/**
 * Created by lazylad91 on 3/31/17.
 */
var kafka = require('kafka-node');
var Consumer = kafka.Consumer;
var Offset = kafka.Offset;
var Client = kafka.Client;
var topic =  'test';
var Promise = require('promise');

var client = new Client(config_file.zookeeperServerURL);
var topics1 = [
    {topic: topic, partition: 0}
];
var topics2 = [
    {topic: topic, partition: 1}
];
var options = { autoCommit: false, fetchMaxWaitMs: 1000, fetchMaxBytes: 1024 * 1024, max : 1 };

var consumer = new Consumer(client, topics1, options);
var offset = new Offset(client);

//consumer.pause();

//consumer.setOffset("topic1",0,0);
//console.log(consumer.fetch());
consumer.on('message', function (message) {
    console.log("Simple consumer have a message");
    /*consumer.autoCommit
    consumer.commit(function(data,err){
        console.log(data||err);
    });*/
  //  consumer.pause();
    //processMessage(message);
});

consumer.on('error', function (err) {
    console.log('error', err);
});

function resume(){
    consumer.resume();
}
//setInterval(resume.bind(this),5000);
/*
 * If consumer get `offsetOutOfRange` event, fetch data from the smallest(oldest) offset
 */
consumer.on('offsetOutOfRange', function (topic) {
    topic.maxNum = 2;
    offset.fetch([topic], function (err, offsets) {
        if (err) {
            return console.error(err);
        }
        var min = Math.min(offsets[topic.topic][topic.partition]);
        consumer.setOffset(topic.topic, topic.partition, min);
    });
});