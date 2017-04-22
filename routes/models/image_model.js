var mongoose = require('mongoose');
var connection = mongoose.createConnection("mongodb://" + config_file.mongodbServerURL + "/imageCounter");
var autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(connection);

var imageSchema = new mongoose.Schema({
    coco_url: {type: String},
    date_captured: {type: String},
    file_name: {type: String, index: true},
    flickr_url: {type: String},
    height: {type: Number},
    width: {type: Number},
    id: {type: Number, unique: true, index: true},
    idString: {type: String, index: true},
    license: {type: Number, default: 1},
    image: {type: 'Mixed'},
    imageTags: {type: [String], index: true},
    server_image_url: {type: String, index: true},
    status: {type: String, index: true, default: 'N'},
    cocoMetaData: 'Mixed',
    image_type: {type: String, index: true, default: 'training'}
});

imageSchema.plugin(autoIncrement.plugin, {model: 'image', field: 'id'});

var image = mongoose.model('image', imageSchema);

module.exports = image;