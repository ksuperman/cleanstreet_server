var mongoose = require('mongoose');
var connection = mongoose.createConnection("mongodb://" + config_file.mongodbServerURL + "/imageScaledAnnotationCounter");
var autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(connection);

var imageScaledAnnotationSchema = new mongoose.Schema({
    "area": {type: Number},
    "bbox": {type: [Number]},
    "category_id": {type: Number},
    "id": {type: Number, unique: true, index: true},
    "image_id": {type: Number},
    "iscrowd": {type: Number},
    "segmentation": {type: 'Mixed'}
});

imageScaledAnnotationSchema.plugin(autoIncrement.plugin, {model: 'imageScaledAnnotation', field: 'id'});

var imageScaledAnnotation = mongoose.model('imageScaledAnnotation', imageScaledAnnotationSchema);

module.exports = imageScaledAnnotation;