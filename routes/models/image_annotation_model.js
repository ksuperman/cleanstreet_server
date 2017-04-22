var mongoose = require('mongoose');
var connection = mongoose.createConnection("mongodb://" + config_file.mongodbServerURL + "/imageAnnotationCounter");
var autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(connection);

var imageAnnotationSchema = new mongoose.Schema({
    "area": {type: Number},
    "bbox": {type: [Number]},
    "category_id": {type: Number},
    "id": {type: Number, unique: true, index: true},
    "image_id": {type: Number},
    "iscrowd": {type: Number},
    "segmentation": {type: 'Mixed'},
    "image_type": {type: String, index: true, default: 'T'}
});

imageAnnotationSchema.plugin(autoIncrement.plugin, {model: 'imageAnnotation', field: 'id'});

var imageAnnotation = mongoose.model('imageAnnotation', imageAnnotationSchema);

module.exports = imageAnnotation;