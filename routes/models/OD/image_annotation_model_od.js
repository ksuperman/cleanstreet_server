var mongoose = require('mongoose');
var connection = mongoose.createConnection("mongodb://" + config_file.mongodbServerURL + "/imageAnnotationODCounter");
var autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(connection);

var imageAnnotationSchemaOD = new mongoose.Schema({
    "area": {type: Number},
    "bbox": {type: [Number]},
    "category_id": {type: Number},
    "id": {type: Number, unique: true, index: true},
    "image_id": {type: Number},
    "iscrowd": {type: Number},
    "segmentation": {type: 'Mixed'},
    "image_type": {type: String, index: true, default: 'T'}
});

imageAnnotationSchemaOD.plugin(autoIncrement.plugin, {model: 'imageAnnotation', field: 'id'});

var imageAnnotationOD = mongoose.model('imageAnnotationOD', imageAnnotationSchemaOD);

module.exports = imageAnnotationOD;