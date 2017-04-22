//write functions here
function Ctrler() {
    this.N = 0;
    this.cur_anno_idx = 0;
    this.originX;
    this.originY;
    this.im = new Image();
    // use cat icon for demo
    var cat_id = 17;
    this.im.src = '/tools/static/img/categories/' + cat_id + '.png';
    this.zoomLevel = 0;
}

Ctrler.prototype.centerIcon = function () {
    var stage_ui = window.controller_ui.s.stage_ui;
    var imWid = stage_ui.size['width'];
    var imHei = stage_ui.size['height'];
    var bbox = window.controller_ui.s.stage_ui.bbox;
    var zoom = ctrler.getZoomFactor();
    origin = ctrler.getOrigin();
    // compute new origin
    stage_ui.translate_delta(Anno[0][0] * imWid - imWid / 2 / zoom - origin['x'], Anno[0][1] * imHei - imHei / 2 / zoom - origin['y']);
    setTimeout(function () {
        ctrler.renderHint();
    }, 300);
};

Ctrler.prototype.zoomAtCenter = function (delta) {
    var stage_ui = window.controller_ui.s.stage_ui;
    var imWid = stage_ui.size['width'];
    var imHei = stage_ui.size['height'];
    var p = new Object();
    p['x'] = imWid / 2
    p['y'] = imHei / 2
    stage_ui.zoom_delta(delta, p);
}

/* Render Existing Masks Over the image */
Ctrler.prototype.renderHint = function () {
    var stage_ui = window.controller_ui.s.stage_ui;
    var imWid = stage_ui.size['width'];
    var imHei = stage_ui.size['height'];
    var ctx = $('canvas')[0].getContext('2d');
    var icon_size = 20;

    for (i = 0; i < ctrler.N; i++) {
        var x = Anno[i][0];
        var y = Anno[i][1];
        var left = x * imWid;
        var top = y * imHei;
        var container = $('#mt-container');
        var offsetX = parseFloat(container.position().left);
        var offsetY = parseFloat(container.position().top);
        // adjust with new zoom and origin
        var origin = ctrler.getOrigin();
        var zoom = ctrler.getZoomFactor();
        left = (left - origin['x']) * zoom;
        top = (top - origin['y']) * zoom;
        if (left > 0 && left < Math.min($(window).width() - icon_size / 2, imWid * zoom) &&
            top > 0 && top < Math.min($(window).width() - icon_size / 2, imHei * zoom)) {
            for (k = 0; k < polys.length; k++) {
                ctx.beginPath();
                vertex = polys[k];
                ctx.moveTo((vertex[0] * imWid - origin['x']) * zoom, (vertex[1] * imHei - origin['y']) * zoom);
                for (j = 2; j < vertex.length; j += 2) {
                    ctx.lineTo((vertex[j] * imWid - origin['x']) * zoom, (vertex[j + 1] * imHei - origin['y']) * zoom);
                }
                ctx.closePath();
                ctx.fillStyle = 'rgba(0,0,255, 0.5)';
                ctx.stroke();
                ctx.fill();
            }
            ctx.drawImage(ctrler.im, left - 15, top - 15, 30, 30);
        }
    }

};

Ctrler.prototype.getOrigin = function () {
    return window.controller_ui.s.stage_ui.origin
}
Ctrler.prototype.getZoomFactor = function () {
    return window.controller_ui.s.stage_ui.get_zoom_factor()
}
Ctrler.prototype.getPolys = function () {
    // polygon points:
    return window.controller_ui.s.closed_polys
}
Ctrler.prototype.submitNoObj = function () {
    if (!mt_submit_ready) {
        return;
    }
    window.show_modal_loading("Submitting...", 0);
    var data = $.extend(true, {
        screen_width: screen.width,
        screen_height: screen.height,
        time_load_ms: window.time_load_ms
    }, data);
    var ans = JSON.stringify(data);
    var duration = ($.now() - init_time) / 1000;
    var resp =
        {
            'ans': ans,
            'duration': duration,
            'assignmentId': $('#assignmentId').val(),
            'workerId': $('#workerId').val(),
            'hitId': $('#hitId').val(),
            'isObj': 0,
        };
    $("input[name='duration']").val(duration)
    $("input[name='ans']").val(ans);
    $("input[name='isObj']").val(0);
    return $.ajax({
        type: 'POST',
        url: window.location.href,
        data: {'resp': JSON.stringify(resp)},
        timeout: 60000,
    }).done(function (data) {
        if (data == 'reload') {
            window.location.reload();
        } else if (data = 'submit') {
            $('#mturk_form').submit();
        } else {
            alert('error');
            window.hide_modal_loading();
        }
    }).fail(function (data) {
        alert('Timeout, please click "Next" again to submit your HIT');
        window.hide_modal_loading();
    });
}

Ctrler.prototype.submit_form = function (data_callback) {
    var data, resultInstanceArray = [], scaledResultInstanceArray = [],
        resultInstance, imageHeight, imageWidth, resultObject, i, image_id,
        image_annotations_polygons, image_annotations_polygon, j, boundBoxPolyArray,
        bbRegion, result, requestPayload, requestPayloadInstance, scaledResultInstance;

    result = function () {
        var categoryId = $('#annotationClass').val() || 0;
        return {
            "area": 0,
            "bbox": [],
            "category_id": parseInt(categoryId),
            //"id": 1,
            "image_id": parseInt(window.image.id),
            "iscrowd": 0,
            "segmentation": []
        }
    };

    requestPayload = function (annotations, annotations_scaled) {
        return {
            "annotations": annotations || [],
            "annotations_scaled": annotations_scaled || [],
            "image_id": parseInt(window.image.id)
        }
    };

    if (!mt_submit_ready) {
        return;
    }

    data = data_callback();

    data = $.extend(true, {
        screen_width: screen.width,
        screen_height: screen.height,
        time_load_ms: window.time_load_ms
    }, data);

    imageHeight = window.image.height;
    imageWidth = window.image.width;
    resultObject = $.extend({}, data.resultsObject);

    for (image_id in resultObject) {
        /* Multiple Polygons Annotations for Image */
        image_annotations_polygons = resultObject[image_id];
        for (i = 0; i < image_annotations_polygons.length; i++) {
            /* Repeat Each Polygon Annotations */
            resultInstance = new result();
            scaledResultInstance = new result();

            image_annotations_polygon = image_annotations_polygons[i];

            /* Create a Result Array of Scaled Annotations Generated */
            scaledResultInstance.segmentation.push($.extend({}, image_annotations_polygon));

            scaledResultInstance.image_type = imageObject.image_type;

            /* Draw Bounding Boxes For Reference */
            boundBoxPolyArray = [getbboxCoordinates(convertPolyArrayToPolygonObject(image_annotations_polygon))];
            drawBoundingBox(boundBoxPolyArray);
            for (j = 0; j < image_annotations_polygon.length; j++) {
                if (j % 2 === 0) {
                    image_annotations_polygon[j] = image_annotations_polygon[j] * imageWidth;
                } else {
                    image_annotations_polygon[j] = image_annotations_polygon[j] * imageHeight;
                }
            }

            bbRegion = new Region(convertPolyArrayToPolygonObject(image_annotations_polygon));

            /* Append Bounding Box to Result */
            resultInstance.bbox = getbboxStandardFormat(convertPolyArrayToPolygonObject(image_annotations_polygon));

            /* Append Bounding Box Area to Result */
            resultInstance.area = bbRegion.area();//calculateAreaOfBoundingBox(convertPolyArrayToPolygonObject(image_annotations_polygon));

            /* Append Segmentation Box to Result */
            resultInstance.segmentation.push(image_annotations_polygon);

            /* Append the Type of the Image to the Annotations */
            resultInstance.image_type = imageObject.image_type;

            /* Create a Result Array of Annotations Generated */
            resultInstanceArray.push(resultInstance);
            scaledResultInstanceArray.push(scaledResultInstance);
        }
    }

    /* Create a Request Payload for the Server */
    requestPayloadInstance = new requestPayload(resultInstanceArray, scaledResultInstanceArray);

    console.log('requestPayloadInstance', requestPayloadInstance);

    /* Insert the Data into the Server Data Store */
    $.ajax({
        url: '/tools/uploadImageAnnotations',
        type: 'POST',
        dataType: 'json',
        data: requestPayloadInstance
    }).done(function (data) {
        console.log('done', data);
        Materialize.toast('Annotation are now saved to server!', 3000, '', function () {
            window.location.href = '/tools/annotationHub'
        });
    });
};

Ctrler.prototype.addListener = function () {
    $('#btn-zoom-in').bind('click', function (e) {
        ctrler.zoomAtCenter(600);
        ctrler.zoomLevel++;
        ctrler.renderHint();
        return stop_event(e);
    });
    $('#btn-zoom-out').bind('click', function (e) {
        ctrler.zoomAtCenter(-600);
        ctrler.renderHint();
        return stop_event(e);
    });
    $('#btn-move').bind('click', function (e) {
        ctrler.centerIcon();
        return stop_event(e);
    });
    $(document).keydown(function (ev) {
        if (ev.keyCode == 77 || ev.keyCode == 109) {
            $('#btn-move').trigger('click');
        } else if (ev.keyCode == 73 || ev.keyCode == 105) {
            $('#btn-zoom-in').trigger('click');
        } else if (ev.keyCode == 79 || ev.keyCode == 111) {
            $('#btn-zoom-out').trigger('click');
        } else if (ev.keyCode == 37 || ev.keyCode == 38) {
        }
    });
    $('#btn-submit-noobj').bind('click', ctrler.submitNoObj);
    $(document).keypress(function (ev) {
        if (ev.keyCode == 37 || ev.keyCode == 38) {
            setTimeout(function () {
                ctrler.renderHint();
            }, 100);
        }
    });
};

// polygonal comparison
function isPointInPoly(poly, pt) {
    nvert = poly.length;
    var c = false;
    for (i = 0, j = nvert - 1; i < nvert; j = i++) {
        if ((poly[i]['y'] > pt['y'] ) != (poly[j]['y'] > pt['y']) &&
            (pt['x'] < (poly[j]['x'] - poly[i]['x']) * (pt['y'] - poly[i]['y']) / (poly[j]['y'] - poly[i]['y']) + poly[i]['x'] )) {
            c = !c;
        }
    }
    return c;
}

function accOfOverlappedPolygons(poly1, poly2) {
    var bbox = getbboxOfPolys(poly1, poly2);
    var intersection = 0;
    var union = 0;
    var poly1Pixel = 0;
    var poly2Pixel = 0;
    for (var i = bbox['x_min']; i < bbox['x_max']; i++) {
        for (var j = bbox['y_min']; j < bbox['y_max']; j++) {
            var pt = new Object();
            pt = {'x': i, 'y': j};
            var inPoly1 = isPointInPoly(poly1, pt);
            var inPoly2 = isPointInPoly(poly2, pt);
            if (inPoly1 || inPoly2) {
                union++;
            }
            if (inPoly1) {
                poly1Pixel++;
            }
            if (inPoly1 ^ inPoly2) {
                intersection++;
            }
        }
    }
    return intersection / poly1Pixel;
}

function getbboxOfPolys(poly1, poly2) {
    bbox1 = getbbox(poly1);
    bbox2 = getbbox(poly2);
    var bbox = new Object();
    bbox['x_min'] = Math.min(bbox1['x_min'], bbox2['x_min']);
    bbox['y_min'] = Math.min(bbox1['y_min'], bbox2['y_min']);
    bbox['x_max'] = Math.max(bbox1['x_max'], bbox2['x_max']);
    bbox['y_max'] = Math.max(bbox1['y_max'], bbox2['y_max']);
    return bbox
}

function Region(points) {
    this.points = points || [];
    this.length = points.length;
}

Region.prototype.area = function () {
    var area = 0,
        i,
        j,
        point1,
        point2;

    for (i = 0, j = this.length - 1; i < this.length; j = i, i += 1) {
        point1 = this.points[i];
        point2 = this.points[j];
        area += point1.x * point2.y;
        area -= point1.y * point2.x;
    }
    area /= 2;

    return area;
};

function convertPolyArrayToPolygonObject(polyArray) {
    var polyObject = [], tempPolyPoints = {}, i, pointCount = 0;

    if (polyArray) {
        for (i = 0; i < polyArray.length; i++) {
            if (i % 2 === 0) {
                tempPolyPoints['x'] = polyArray[i];
            } else {
                tempPolyPoints['y'] = polyArray[i];
            }
            pointCount++;
            if (pointCount === 2) {
                pointCount = 0;
                polyObject.push($.extend({}, tempPolyPoints));
                tempPolyPoints = {};
            }
        }
    }
    return polyObject;
}

function calculateAreaOfBoundingBox(poly) {
    var area = 0,
        boundingBoxObject = getbboxStandardFormat(poly);

    if (boundingBoxObject) {
        area = boundingBoxObject[2] * boundingBoxObject[3];
    }
    return area;
}

function getbbox(poly) {
    var x_min = 1000000, x_max = 0, y_min = 100000, y_max = 0;

    for (var i = 0; i < poly.length; i++) {
        if (x_min > poly[i]['x']) {
            x_min = poly[i]['x'];
        }
        ;
        if (x_max < poly[i]['x']) {
            x_max = poly[i]['x'];
        }
        ;
        if (y_min > poly[i]['y']) {
            y_min = poly[i]['y'];
        }
        ;
        if (y_max < poly[i]['y']) {
            y_max = poly[i]['y'];
        }
        ;
    }
    return {'x_min': x_min, 'x_max': x_max, 'y_min': y_min, 'y_max': y_max}
}

function getbboxStandardFormat(poly) {
    var polyBoundingBox = [],
        boundingBoxObject = getbbox(poly);

    /* Point X */
    polyBoundingBox.push(boundingBoxObject.x_min);
    /* Point Y */
    polyBoundingBox.push(boundingBoxObject.y_min);
    /* Point Width */
    polyBoundingBox.push(Math.abs(boundingBoxObject.x_max - boundingBoxObject.x_min));
    /* Point Height */
    polyBoundingBox.push(Math.abs(boundingBoxObject.y_max - boundingBoxObject.y_min));

    return polyBoundingBox
}

function getbboxCoordinates(poly) {
    var polyBoundingBoxArray = [],
        boundingBoxObject = getbbox(poly);

    /* Point 1 */
    polyBoundingBoxArray.push(boundingBoxObject.x_min);
    polyBoundingBoxArray.push(boundingBoxObject.y_min);
    /* Point 2 */
    polyBoundingBoxArray.push(boundingBoxObject.x_max);
    polyBoundingBoxArray.push(boundingBoxObject.y_min);
    /* Point 3 */
    polyBoundingBoxArray.push(boundingBoxObject.x_max);
    polyBoundingBoxArray.push(boundingBoxObject.y_max);
    /* Point 4 */
    polyBoundingBoxArray.push(boundingBoxObject.x_min);
    polyBoundingBoxArray.push(boundingBoxObject.y_max);

    return polyBoundingBoxArray;
}

function drawBoundingBox(polys) {
    var stage_ui = window.controller_ui.s.stage_ui,
        imWid = stage_ui.size['width'],
        imHei = stage_ui.size['height'],
        ctx = $('canvas')[0].getContext('2d'),
        k,
        vertex,
        origin = ctrler.getOrigin(),
        zoom = ctrler.getZoomFactor(),
        x = 0,
        y = 0,
        left = x * imWid,
        top = y * imHei,
        container = $('#mt-container'),
        offsetX = parseFloat(container.position().left),
        offsetY = parseFloat(container.position().top);

    for (k = 0; k < polys.length; k++) {
        ctx.beginPath();
        vertex = polys[k];
        ctx.moveTo((vertex[0] * imWid - origin['x']) * zoom, (vertex[1] * imHei - origin['y']) * zoom);
        for (j = 2; j < vertex.length; j += 2) {
            ctx.lineTo((vertex[j] * imWid - origin['x']) * zoom, (vertex[j + 1] * imHei - origin['y']) * zoom);
        }
        ctx.closePath();
        ctx.fillStyle = 'rgba(0,0,255, 0.5)';
        ctx.stroke();
        ctx.fill();
    }
    ctx.drawImage(ctrler.im, left - 15, top - 15, 30, 30);
}