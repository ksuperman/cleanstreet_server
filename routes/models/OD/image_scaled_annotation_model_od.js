var mongoose = require('mongoose');
var connection = mongoose.createConnection("mongodb://" + config_file.mongodbServerURL + "/imageScaledAnnotationODCounter");
var autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(connection);

var imageScaledAnnotationSchemaOD = new mongoose.Schema({
    "area": {type: Number},
    "bbox": {type: [Number]},
    "category_id": {type: Number},
    "id": {type: Number, unique: true, index: true},
    "image_id": {type: Number},
    "iscrowd": {type: Number},
    "segmentation": {type: 'Mixed'},
    "image_type": {type: String, index: true, default: 'T'}
});

imageScaledAnnotationSchemaOD.plugin(autoIncrement.plugin, {model: 'imageScaledAnnotation', field: 'id'});

var imageScaledAnnotationOD = mongoose.model('imageScaledAnnotationOD', imageScaledAnnotationSchemaOD);

module.exports = imageScaledAnnotationOD;