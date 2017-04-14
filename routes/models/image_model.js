var mongoose = require('mongoose');
var connection = mongoose.createConnection("mongodb://localhost/counterInfo1");
autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(connection);

var imageSchema = new mongoose.Schema({
    coco_url: String,
    date_captured: {type: Date, default: Date.now},
    file_name: String,
    flickr_url: String,
    height: Number,
    width: Number,
    id: { type: Number, unique: true, index: true},
    license: Number,
    image: 'Mixed',
    imageTags: { type: [String], index: true },
    cocoMetaData: 'Mixed'
});

imageSchema.plugin(autoIncrement.plugin, { model: 'image', field: 'id' });

var image = mongoose.model('image', imageSchema);

module.exports = image;