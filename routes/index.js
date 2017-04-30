var express = require('express');
var router = express.Router();
var fsPath = require('fs-path');
var image_pipeline_model = require('./models/image_pipeline_model');
var lwip = require('lwip');
var piexif = require("piexifjs");
var path = require('path');
var producer = require('./producer');
var message = require('./message');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Clean Streets Framework' });
});

/* Handle Image Upload */
router.post('/uploadImageToPipeline', function (req, res, next) {

    var imageObject,
        imageTags,
        imageDataURI,
        imageType,
        imageId,
        imagebase64Data,
        tempImageFileName = path.join(__dirname, "..", "images", "temp", "tempPipeline" + new Date().getTime() + '.jpg'),
        finalImageName,
        currentImageWidth,
        currentImageHeight,
        newImageWidth = 1024,
        aspectRatio,
        cocoImageAttribName = ["id", "width", "height", "file_name", "license", "flickr_url", "coco_url", "date_captured"],
        date = new Date(),
        exifObj,
        exifbytes,
        bufferedImageDataURI,
        bufferedImageDataURIBase64,
        kafkamessage = [];

    try {
        if (req.body && req.body.image) {
            imageDataURI = req.body.image;
            imageObject = new image_pipeline_model({
                "image": imageDataURI
            });

            /* Get the Id to Rename File of Uploaded Image */
            imageObject.nextCount(function (err, nextImageId) {
                if (err || (!nextImageId && nextImageId != 0)) {
                    console.log('Error - 3');
                    sendError({error: 'Image Object Not Found in the Request'});
                } else {
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
                                        console.log('Success - 3');
                                        imageId = nextImageId;
                                        /* Update the Model with Next Image Id */
                                        imageObject.idString = imageId.toString();

                                        imageObject.file_name = "PipelineImage" + padImageId(imageId) + ".jpg";
                                        imageObject.server_image_url = "/pipeline/" + imageObject.file_name;
                                        finalImageName = path.join(__dirname, "..", "images", "pipeline", imageObject.file_name);

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
                                                console.log("Image Saved to Database ==> " + imageObject);
                                                console.log('Success - 4');
                                                /* Save Image on Disk */
                                                image.toBuffer('jpeg', {}, function(err, buffer){
                                                    if (err) {
                                                        console.log('Error - 5');
                                                        sendError({error: err.toString()});
                                                    } else {
                                                        console.log('Success - 5');
                                                        bufferedImageDataURI = 'data:image/jpeg;base64,' + buffer.toString('base64');
                                                        /* Adding Exif Tags to Image */
                                                        exifObj = new EXIF(nextImageId, "Clean Streets");
                                                        exifbytes = piexif.dump(exifObj);
                                                        bufferedImageDataURI  = piexif.insert(exifbytes, bufferedImageDataURI);
                                                        bufferedImageDataURIBase64 = bufferedImageDataURI.replace(/^data:([A-Za-z-+\/]+);base64,/, "");
                                                        fsPath.writeFile(finalImageName, bufferedImageDataURIBase64, 'base64', function (err) {
                                                            if (err) {
                                                                console.log('Error - 6');
                                                                sendError({error: err.toString()});
                                                            } else {
                                                                console.log('Success - 6');
                                                                /* ---------------- PARTEEK ----------------- ADD YOUR CHANGES HERE TO PUSH IMAGE TO KAKFA HERE */
                                                                try {
                                                                        kafkamessage.push(message.createMessage('keyed',"image", bufferedImageDataURI));
                                                                        producer.sendMessage("Phase1Topic",kafkamessage,0,0,function(result){
                                                                            sendSuccess({response: 'Success'});
                                                                        });

                                                                }
                                                                catch(error){
                                                                    console.log('Error - 7');
                                                                    sendError({error: error.toString()});
                                                                }
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

    /* EXIF Constructor */
    function EXIF(ImageId, Make, XResolution, YResolution) {
        var zeroth = {},
            exif = {},
            gps = {},
            exifObj,
            date = new Date(),
            userComment = {};

        userComment.id = ImageId || 0;

        zeroth[piexif.ImageIFD.Make] = Make || "Clean Streets";
        zeroth[piexif.ImageIFD.XResolution] = XResolution || [777, 1];
        zeroth[piexif.ImageIFD.YResolution] = YResolution || [777, 1];
        zeroth[piexif.ImageIFD.Software] = "Clean Streets";

        exif[piexif.ExifIFD.DateTimeOriginal] = date.getFullYear() + '-' + padDate(date.getMonth()) + '-' + padDate(date.getDate()) + ' ' + padDate(date.getHours()) + ':' + padDate(date.getMinutes()) + ':' + padDate(date.getSeconds());
        exif[piexif.ExifIFD.LensMake] = "Clean Streets";
        exif[piexif.ExifIFD.Sharpness] = 777;
        exif[piexif.ExifIFD.LensSpecification] = [[1, 1], [1, 1], [1, 1], [1, 1]];
        exif[piexif.ExifIFD.UserComment]= JSON.stringify(userComment);

        gps[piexif.GPSIFD.GPSVersionID] = [7, 7, 7, 7];
        gps[piexif.GPSIFD.GPSDateStamp] = "1999:99:99 99:99:99";

        exifObj = {"0th":zeroth, "Exif":exif, "GPS":gps};

        return exifObj;
    }


});

module.exports = router;
