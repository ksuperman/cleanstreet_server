var express = require('express');
var router = express.Router();
var image_model = require('./models/image_model');
var lwip = require('lwip');
var fs = require("fs");
var fsPath = require('fs-path');
var path = require('path');

/* GET Annotation Hub Page. */
router.get('/annotationHub', function (req, res, next) {
    res.render('image_annotation_hub', {title: 'Clean Streets Framework'});
});

/* GET Annotation Tool Page. */
router.get('/annotationTool', function (req, res, next) {
    res.render('image_annotation', {title: 'Clean Streets Framework'});
});

/* Handle Image Upload */
router.post('/uploadImage', function (req, res, next) {
    var imageObject,
        imageTags,
        imageDataURI,
        imageId,
        imagebase64Data,
        tempImageFileName = path.join(__dirname, "..", "images", "temp", "temp" + new Date().getTime() + '.jpg'),
        finalImageName,
        currentImageWidth,
        currentImageHeight,
        newImageWidth = 1024,
        newImageHeight,
        aspectRatio;


    try {
        if (req.body && req.body.image) {

            imageDataURI = req.body.image;
            imageTags = (req.body.imagetags) ? req.body.imagetags.split(',') : [];
            imageObject = new image_model({
                "flickr_url": "http://farm4.staticflickr.com/3153/2970773875_164f0c0b83_z.jpg",
                "license": 1,
                "imageTags": imageTags,
                image: imageDataURI
            });
            imagebase64Data = imageDataURI.replace(/^data:([A-Za-z-+\/]+);base64,/, "");

            /* Write Image to File System as Temp File */
            fsPath.writeFile(tempImageFileName, imagebase64Data, 'base64', function (err) {
                if (err) {
                    console.log('Error - 1');
                    sendError({error: err.toString()});
                } else {
                    console.log('Success - 1');
                    /* Open Temp File in Image Editing Library */
                    lwip.open(tempImageFileName, function (err, image) {
                        if (err) {
                            console.log('Error - 2');
                            sendError({error: err.toString()});
                        } else {
                            /* Check if Image Needs to Resized to smaller Resolution */
                            currentImageWidth = image.width();
                            currentImageHeight = image.height();
                            aspectRatio = 1;
                            if(currentImageWidth && currentImageWidth > newImageWidth) {
                                newImageWidth = 1024;
                                aspectRatio = newImageWidth / currentImageWidth;
                            }
                            console.log('Success - 2');
                            image.scale(aspectRatio, function (err, image) {
                                /* Get the Id to Rename File of Uploaded Image */
                                imageObject.nextCount(function (err, nextImageId) {
                                    if (err || (!nextImageId && nextImageId != 0)) {
                                        console.log('Error - 3');
                                        sendError({error: 'Image Object Not Found in the Request'});
                                    } else {
                                        console.log('Success - 3');
                                        imageId = nextImageId;
                                        /* Update the Model with Next Image Id */
                                        imageObject.coco_url = "http://mscoco.org/images/" + nextImageId;
                                        imageObject.file_name = "COCO_train2014_" + padImageId(nextImageId) + ".jpg";
                                        imageObject.width = image.width();
                                        imageObject.height = image.height();
                                        /* Save the Image to Database */
                                        imageObject.save(function (err) {
                                            if (err) {
                                                console.log('Error - 4');
                                                sendError({error: err.toString()});
                                            } else {
                                                console.log('Success - 4');
                                                /* Save Image on Disk */
                                                finalImageName = path.join(__dirname, "..", "images", "img", imageObject.file_name);
                                                image.writeFile(finalImageName, function (err) {
                                                    if (err) {
                                                        sendError({error: err.toString()});
                                                    } else {
                                                        sendSuccess({response: 'Success'});
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            });
                        }
                    });
                }
            });
        } else {
            sendError({error: 'Image Object Not Found in the Request'})
        }
    } catch (err) {
        sendError({error: err.toString()});
    }

    function padImageId(imageId) {
        return String("0000000000000000" + imageId).slice(-12);
    }

    function sendError(err) {
        console.log('ERROR --- uploadImage ==> ', err);
        res.status(500).send(JSON.stringify(err));
    }

    function sendSuccess(response) {
        res.status(200).send(JSON.stringify(response));
    }
});

module.exports = router;
