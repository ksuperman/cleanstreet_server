var express = require('express');
var router = express.Router();
var image_model = require('./models/image_model');
var image_annotation_model = require('./models/image_annotation_model');
var image_scaled_annotation_model = require('./models/image_scaled_annotation_model');
var lwip = require('lwip');
var fs = require("fs");
var fsPath = require('fs-path');
var path = require('path');
var datatablesQuery = require('datatables-query');
var bfj = require('bfj');

/* GET Annotation Hub Page */
router.get('/annotationHub', function (req, res, next) {
    res.render('image_annotation_hub', {title: 'Clean Streets Framework'});
});

/* GET Annotation Tool Page */
router.get('/annotationTool/:imageid', function (req, res, next) {
    console.log('requested image ==> ', req.params.imageid);
    if (req.params && req.params.imageid >= 0) {
        image_model.findOne({id: req.params.imageid}, {image: 0}, function (err, imageObject) {
            console.log(err);
            if (err || !imageObject) {
                res.redirect(307, '/tools/annotationHub');
            } else {
                image_scaled_annotation_model.find({"image_id": imageObject.id}, function (err, annotations) {
                    //console.log('annotations', annotations);
                    for (i = 0; i < annotations.length; i++) {
                        annotations[i] = annotations[i].segmentation[0];
                    }
                    imageObject = JSON.stringify(imageObject);
                    annotations = JSON.stringify(annotations);
                    res.render('image_annotation', {imageObject: imageObject, annotations: annotations});
                });
            }
        });
    } else {
        res.redirect(307, '/tools/annotationHub');
    }
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
        aspectRatio,
        cocoImageAttribName = ["id", "width", "height", "file_name", "license", "flickr_url", "coco_url", "date_captured"],
        date = new Date();

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
                            if (currentImageWidth && currentImageWidth > newImageWidth) {
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
                                        imageObject.idString = imageId.toString();
                                        imageObject.coco_url = "http://mscoco.org/images/" + imageId;
                                        imageObject.file_name = "COCO_train2014_" + padImageId(imageId) + ".jpg";
                                        imageObject.server_image_url = "/img/" + imageObject.file_name;
                                        imageObject.width = image.width();
                                        imageObject.height = image.height();
                                        date = date.getFullYear() + '-' + padDate(date.getMonth()) + '-' + padDate(date.getDate()) + ' ' + padDate(date.getHours()) + ':' + padDate(date.getMinutes()) + ':' + padDate(date.getSeconds())
                                        imageObject.date_captured = date;
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

    function padDate(date) {
        return String("00" + date).slice(-2);
    }

    function sendError(err) {
        console.log('ERROR --- uploadImage ==> ', err);
        res.status(500).send(JSON.stringify(err));
    }

    function sendSuccess(response) {
        res.status(200).send(JSON.stringify(response));
    }
});

/* Handle Image Annotation Upload */
router.post('/uploadImageAnnotations', function (req, res, next) {
    var body,
        imageAnnotationObject,
        imageScaledAnnotationObject,
        i,
        pipelinePendingCount = 0,
        errorFlag = false,
        errorString = '';

    try {
        body = req.body;
        //console.log(req.body);
        if (body && body.annotations && body.annotations_scaled && body.image_id) {

            /* Insert the Annotations into the Database */
            for (i = 0; i < body.annotations.length; i++) {
                pipelinePendingCount++;
                imageAnnotationObject = new image_annotation_model(body.annotations[i]);
                imageAnnotationObject.save(function (err) {
                    if (err) {
                        console.log('Error - imageAnnotationObject', err.toString());
                        errorFlag = true;
                        errorString += err.toString();
                    } else {
                        console.log('Success - imageAnnotationObject');
                    }
                    pipelinePendingCount--;
                    checkPendingPipelineCount();
                });
                pipelinePendingCount++;
                imageScaledAnnotationObject = new image_scaled_annotation_model(body.annotations_scaled[i]);
                imageScaledAnnotationObject.save(function (err) {
                    if (err) {
                        console.log('Error - image_scaled_annotation_model', err.toString());
                        errorFlag = true;
                        errorString += err.toString();
                    } else {
                        console.log('Success - image_scaled_annotation_model');
                    }
                    pipelinePendingCount--;
                    checkPendingPipelineCount();
                });
            }
        } else {
            sendError({error: 'Annotation Object Not Found in the Request'});
        }
    } catch (err) {
        sendError({error: err.toString()});
    }

    function checkPendingPipelineCount() {
        if (pipelinePendingCount === 0) {
            if (errorFlag) {
                sendError({error: errorString});
            } else {
                sendSuccess({response: 'Success'});
            }
        }
    }

    function sendError(err) {
        console.log('ERROR --- uploadImage ==> ', err);
        res.status(500).send(JSON.stringify(err));
    }

    function sendSuccess(response) {
        res.status(200).send(JSON.stringify(response));
    }
});

/* Handle Data Table Rendering*/
router.post('/getPendingImages', function (req, res) {
    var params = req.body,
        query = datatablesQuery(image_model);

    query.run(params).then(function (data) {
        res.json(data);
    }, function (err) {
        console.log(err);
        res.status(500).json(err);
    });
});

router.post('/getScaledImageAnnotations', function (req, res) {
    var i;
    console.log(req.body);
    if (req.body && req.body.image_id) {
        image_scaled_annotation_model.find({"image_id": req.body.image_id}, function (err, annotations) {
            for (i = 0; i < annotations.length; i++) {
                annotations[i] = annotations[i].segmentation[0];
            }
            annotations = JSON.stringify(annotations);
            res.send(annotations);
        });
    }
});

router.post('/getTrainingJSONFile', function (req, res) {

    var spawn = require('child_process').spawnSync,
        child = spawn('sh', ['createTrainingFile.sh', '/Users/rakshithk/WebstormProjects/cleanstreets_server/']),
        finalTrainingJSON = require('./coco_basic_file.json');

    console.log('stdout here: \n' + child.stdout);
    console.log('stderr here: \n' + child.stderr);
    console.log('status here: \n' + child.status);

    if (child.status === 0) {
        bfj.read('images.json').then(function (imagesData) {
            console.log("Images Read Completed");
            finalTrainingJSON.images = imagesData;
            bfj.read('annotations.json').then(function (annotationdata) {
                console.log("Annotations Read Completed");
                finalTrainingJSON.annotations = annotationdata;
                bfj.write('finalTrainingJSON.json', finalTrainingJSON).then(function () {
                    console.log("finalTrainingJSON Written Completed");
                    sendSuccess({response: 'Success'});
                });
            }).catch(function (error) {
                console.log("Annotations Read FALIED", error);
            });
        }).catch(function (error) {
            console.log("Images Read FALIED", error);
            sendError({error: JSON.stringify(child.stderr)});
        });
    } else {
        sendError({error: JSON.stringify(child.stderr)});
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
