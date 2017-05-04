var express = require('express');
var router = express.Router();
var image_pipeline_model = require('./models/image_pipeline_model');

function getIOURatio(boxA, boxB) {

    /* determine the (x, y)-coordinates of the intersection rectangle */
    var xA = Math.max(boxA[0], boxB[0]);
    var yA = Math.max(boxA[1], boxB[1]);
    var xB = Math.min(boxA[2], boxB[2]);
    var yB = Math.min(boxA[3], boxB[3]);

    /* compute the area of intersection rectangle */
    var interArea = (xB - xA + 1) * (yB - yA + 1);

    /* compute the area of both the prediction and ground-truth rectangles */
    var boxAArea = (boxA[2] - boxA[0] + 1) * (boxA[3] - boxA[1] + 1);
    var boxBArea = (boxB[2] - boxB[0] + 1) * (boxB[3] - boxB[1] + 1);

    /*
     * compute the intersection over union by taking the intersection
	 * area and dividing it by the sum of prediction + ground-truth
	 * areas - the intersection area
	 */
    var iou = interArea / parseFloat(boxAArea + boxBArea - interArea);

    return iou
}

function getDetectionResults(images, callback) {
    var tempImage,
        detectionResults = {},
        imageKeys = [],
        boundingBoxObjectArray = [],
        i,
        j,
        k,
        detectionOptimizedResults = [];

    if(images) {
      try{
          for(i = 0;i < images.length; i++){
              tempImage = images[i];
              if(tempImage) {
                  detectionResults = tempImage.detectionResults;
                  if(detectionResults) {
                      detectionResults = JSON.parse(detectionResults);
                      for(var bb in detectionResults){
                          var x0 = detectionResults[bb].bb.x;
                          var y0 = detectionResults[bb].bb.y;
                          var x1 = detectionResults[bb].bb.x + detectionResults[bb].bb.w;
                          var y1 = detectionResults[bb].bb.y + detectionResults[bb].bb.h;
                          boundingBoxObjectArray.push([x0, y0, x1, y1]);
                      }
                      for(k = 0;k < boundingBoxObjectArray.length; k++){
                          for(j = 0;j < boundingBoxObjectArray.length; j++) {
                              if( k !== j && boundingBoxObjectArray[k] && boundingBoxObjectArray[j]) {
                                  var iou = getIOURatio(boundingBoxObjectArray[k], boundingBoxObjectArray[j]);
                                  if(iou > 0.80) {
                                      console.log(boundingBoxObjectArray[k], boundingBoxObjectArray[j],iou);
                                      boundingBoxObjectArray[k] = [];
                                  }
                              }
                          }
                      }

                      var index = 0;
                      for(var bb in detectionResults) {
                          if(boundingBoxObjectArray[index] && boundingBoxObjectArray[index].length > 0){
                              console.log("Saving Index ==> ", index);
                              detectionOptimizedResults.push(JSON.parse(JSON.stringify(detectionResults[bb])));
                          }
                          index++;
                      }
                      images[i]['detectionOptimizedResults'] = JSON.parse(JSON.stringify(detectionOptimizedResults));
                  }
              }
          }
      }catch (e){
        console.log("Error in Processing Detection Result " + e.toString());
      }
    }
    callback(images);
}

/* Handle Default Routing */
router.get('/', function (req, res, next) {var express = require('express');
    var router = express.Router();
    var image_pipeline_model = require('./models/image_pipeline_model');

    function getIOURatio(boxA, boxB) {

        /* determine the (x, y)-coordinates of the intersection rectangle */
        var xA = Math.max(boxA[0], boxB[0]);
        var yA = Math.max(boxA[1], boxB[1]);
        var xB = Math.min(boxA[2], boxB[2]);
        var yB = Math.min(boxA[3], boxB[3]);

        /* compute the area of intersection rectangle */
        var interArea = (xB - xA + 1) * (yB - yA + 1);

        /* compute the area of both the prediction and ground-truth rectangles */
        var boxAArea = (boxA[2] - boxA[0] + 1) * (boxA[3] - boxA[1] + 1);
        var boxBArea = (boxB[2] - boxB[0] + 1) * (boxB[3] - boxB[1] + 1);

        /*
         * compute the intersection over union by taking the intersection
         * area and dividing it by the sum of prediction + ground-truth
         * areas - the intersection area
         */
        var iou = interArea / parseFloat(boxAArea + boxBArea - interArea);

        return iou
    }

    function getDetectionResults(images, callback) {
        var tempImage,
            detectionResults = {},
            imageKeys = [],
            boundingBoxObjectArray = [],
            i,
            j,
            k,
            detectionOptimizedResults = [];

        if(images) {
            try{
                for(i = 0;i < images.length; i++){
                    tempImage = images[i];
                    if(tempImage) {
                        detectionResults = tempImage.detectionResults;
                        if(detectionResults) {
                            detectionResults = JSON.parse(detectionResults);
                            for(var bb in detectionResults){
                                var x0 = detectionResults[bb].bb.x;
                                var y0 = detectionResults[bb].bb.y;
                                var x1 = detectionResults[bb].bb.x + detectionResults[bb].bb.w;
                                var y1 = detectionResults[bb].bb.y + detectionResults[bb].bb.h;
                                boundingBoxObjectArray.push([x0, y0, x1, y1]);
                            }
                            for(k = 0;k < boundingBoxObjectArray.length; k++){
                                for(j = 0;j < boundingBoxObjectArray.length; j++) {
                                    if( k !== j && boundingBoxObjectArray[k] && boundingBoxObjectArray[j]) {
                                        var iou = getIOURatio(boundingBoxObjectArray[k], boundingBoxObjectArray[j]);
                                        if(iou > 0.80) {
                                            console.log(boundingBoxObjectArray[k], boundingBoxObjectArray[j],iou);
                                            boundingBoxObjectArray[k] = [];
                                        }
                                    }
                                }
                            }

                            var index = 0;
                            for(var bb in detectionResults) {
                                if(boundingBoxObjectArray[index] && boundingBoxObjectArray[index].length > 0){
                                    console.log("Saving Index ==> ", index);
                                    detectionOptimizedResults.push(JSON.parse(JSON.stringify(detectionResults[bb])));
                                }
                                index++;
                            }
                            images[i]['detectionOptimizedResults'] = JSON.parse(JSON.stringify(detectionOptimizedResults));
                        }
                    }
                }
            }catch (e){
                console.log("Error in Processing Detection Result " + e.toString());
            }
        }
        callback(images);
    }

    /* Handle Default Routing */
    router.get('/', function (req, res, next) {
        res.render('image_pipeline_home', {title: 'Clean Streets Framework'});
    });

    router.post('/getPipelineImages', function (req, res, next) {

        image_pipeline_model.find({},{"image":0}).lean().exec( function (err, images) {
            /* Parse Detection Object Give the UI Information About the Image */
            getDetectionResults(images, function (imagesParsed) {
                /* Replace Images with Boolean Flags */
                for(var i = 0;i < imagesParsed.length; i++){
                    if(imagesParsed[i].Phase1Image) {
                        imagesParsed[i].Phase1Image = true;
                    }
                    if(imagesParsed[i].Phase2Image) {
                        imagesParsed[i].Phase2Image = true;
                    }
                    if(imagesParsed[i].Phase3Image) {
                        imagesParsed[i].Phase3Image = true;
                    }
                    if(imagesParsed[i].detectionOptimizedResults) {
                        var boundingBoxArea = 0;
                        for( var j = 0; j < imagesParsed[i].detectionOptimizedResults.length; j++) {
                            var tempResultObject = imagesParsed[i].detectionOptimizedResults[j];
                            boundingBoxArea += (tempResultObject.bb.w * tempResultObject.bb.h);
                        }
                        imagesParsed[i].boundingBoxArea = boundingBoxArea;
                        imagesParsed[i].streetImageArea = (imagesParsed[i].width * imagesParsed[i].height)/5;
                        imagesParsed[i].cleanlinessScore = (imagesParsed[i].boundingBoxArea / imagesParsed[i].streetImageArea)*100;
                    }
                }
                res.send(imagesParsed);
            });
        });
    });

    /* GET Image Pipeline Visualization Page */
    router.get('/image/:imageid', function (req, res, next) {
        console.log('requested image ==> ', req.params.imageid);
        if (req.params && req.params.imageid >= 0) {
            image_pipeline_model.findOne({id: req.params.imageid}, {}, function (err, imageObject) {
                console.log(err);
                if (err || !imageObject) {
                    res.redirect(307, '/imagepipeline');
                } else {
                    res.render('image_pipeline_detail_page', {title: 'Clean Streets Framework'});
                }
            });
        } else {
            res.redirect(307, '/');
        }
    });


    module.exports = router;

    res.render('image_pipeline_home', {title: 'Clean Streets Framework'});
});

router.post('/getPipelineImages', function (req, res, next) {

    image_pipeline_model.find({},{"image":0}).lean().exec( function (err, images) {
      /* Parse Detection Object Give the UI Information About the Image */
        getDetectionResults(images, function (imagesParsed) {
            /* Replace Images with Boolean Flags */
            for(var i = 0;i < imagesParsed.length; i++){
                if(imagesParsed[i].Phase1Image) {
                    imagesParsed[i].Phase1Image = true;
                }
                if(imagesParsed[i].Phase2Image) {
                    imagesParsed[i].Phase2Image = true;
                }
                if(imagesParsed[i].Phase3Image) {
                    imagesParsed[i].Phase3Image = true;
                }
                if(imagesParsed[i].detectionOptimizedResults) {
                    var boundingBoxArea = 0;
                    for( var j = 0; j < imagesParsed[i].detectionOptimizedResults.length; j++) {
                        var tempResultObject = imagesParsed[i].detectionOptimizedResults[j];
                        boundingBoxArea += (tempResultObject.bb.w * tempResultObject.bb.h);
                    }
                    imagesParsed[i].boundingBoxArea = boundingBoxArea;
                    imagesParsed[i].streetImageArea = (imagesParsed[i].width * imagesParsed[i].height)/5;
                    imagesParsed[i].cleanlinessScore = (imagesParsed[i].boundingBoxArea / imagesParsed[i].streetImageArea)*100;
                }
            }
            res.send(imagesParsed);
        });
    });
});

/* GET Image Pipeline Visualization Page */
router.get('/image/:imageid', function (req, res, next) {
    console.log('requested image ==> ', req.params.imageid);
    if (req.params && req.params.imageid >= 0) {
        image_pipeline_model.findOne({id: req.params.imageid}, {}, function (err, imageObject) {
            console.log(err);
            if (err || !imageObject) {
                res.redirect(307, '/imagepipeline');
            } else {
                res.render('image_pipeline_detail_page', {title: 'Clean Streets Framework'});
            }
        });
    } else {
        res.redirect(307, '/');
    }
});


module.exports = router;
