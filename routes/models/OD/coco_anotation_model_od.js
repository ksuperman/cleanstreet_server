var mongoose = require('mongoose');

var cocoImageSchemaOD = new mongoose.Schema({
    coco_url: {type: String},
    date_captured: {type: Date, default: Date.now},
    file_name: {type: String, index: true},
    flickr_url: {type: String},
    height: {type: Number},
    width: {type: Number},
    id: {type: Number, unique: true, index: true},
    license: {type: Number, default: 1}
});

var cocoImageOD = mongoose.model('cocoImageOD', cocoImageSchemaOD);

cocoImageSchemaOD.pre('save', function(next) {
    console.log('test', this.id);
    next();
});

module.exports = cocoImageOD;