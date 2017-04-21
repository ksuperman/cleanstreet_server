/**
 * Created by lazylad91 on 4/2/17.
 */
var async = require('async');
var kafka = require('kafka-node');
var ConsumerGroup = kafka.ConsumerGroup;

var consumerOptions = {
    host: 'localhost:2181',
    groupId: 'kafka-node-group',
    autoCommit : true,
    sessionTimeout: 15000,
    protocol: ['roundrobin'],
    fromOffset: 'earliest' // equivalent of auto.offset.reset valid values are 'none', 'latest', 'earliest'
};

var topics = ['test'];

var consumerGroup = new ConsumerGroup(Object.assign({id: 'consumer1'}, consumerOptions), 'test');
consumerGroup.on('error', onError);
consumerGroup.on('message', onMessage);

var consumerGroup2 = new ConsumerGroup(Object.assign({id: 'consumer2'}, consumerOptions), 'test');
consumerGroup2.on('error', onError);
consumerGroup2.on('message', onMessage);


var consumerGroup3 = new ConsumerGroup(Object.assign({id: 'consumer3'}, consumerOptions), 'test');
consumerGroup3.on('error', onError);
consumerGroup3.on('message', onMessage);

function onError (error) {
    console.error(error);
    console.error(error.stack);
}

function onMessage (message) {
    console.log('%s read msg Topic="%s" Partition=%s Offset=%d', this.client.clientId, message.topic, message.partition, message.offset);
}

/*
process.once('SIGINT', function () {
    async.each([consumerGroup, consumerGroup2, consumerGroup3], function (consumer, callback) {
        consumer.close(true, callback);
    });
});*/
