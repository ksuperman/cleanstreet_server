var mongoose = require('mongoose');
var connection = mongoose.createConnection("mongodb://" + config_file.mongodbServerURL + "/imagePipelineCounter");
var autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(connection);

var imagePipelineSchema = new mongoose.Schema({
    date_captured: {type: String},
    file_name: {type: String, index: true},
    height: {type: Number},
    width: {type: Number},
    id: {type: Number, unique: true, index: true},
    idString: {type: String, index: true},
    image: {type: 'Mixed'},
    server_image_url: {type: String, index: true},
    status: {type: String, index: true, default: 'N'},
    cocoMetaData: 'Mixed',
    image_type: {type: String, index: true, default: 'training'},
    Phase1Image: {type: 'Mixed'},
    Phase2Image: {type: 'Mixed'},
    Phase3Image: {type: 'Mixed'},
    Phase4Image: {type: 'Mixed'},
    exifObj: {type: 'Mixed'}
});

imagePipelineSchema.plugin(autoIncrement.plugin, {model: 'imagePipeline', field: 'id'});

var imagePipeline = mongoose.model('imagePipeline', imagePipelineSchema);

module.exports = imagePipeline;