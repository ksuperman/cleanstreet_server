var ctrler;
var init_time = $.now();
var Anno = [];
// instance annotations that were collected from the instance spotting stage
//Anno.push([0.4,0.6]);
Anno.push([0.9,0.9]);

// the interface should show instance segmentation specified by:
// polys: [polygon1, polygon2]
// polygon: [x1,y1,x2,y2,...,xn,yn] x, y are fractions of image width and height

var polys= [[0.3211428571428571,0.1539047619047619,0.536,0.11428571428571428,0.7714285714285715,0.21485714285714286,0.8548571428571429,0.3047619047619048],[0.8971428571428571,0.1660952380952381,0.8914285714285715,0.28495238095238096,0.9245714285714286,0.5287619047619048,0.8125714285714286,0.37485714285714283,0.8331428571428572,0.10666666666666667]];


var imageFileName;

/* Loading the Image into the View */
window.image = new Image();
window.image.src = '/tools/static/img/demo/COCO_train2014_000000057870.jpg';
window.image.onload = function () {}.bind(this);
imageFileName = window.image.src.split("/")[window.image.src.split("/").length-1];
imageFileName = imageFileName.replace(/\.[^/.]+$/, "");
window.image.id = imageFileName;

/* photo_url:  URL of the photo to be shown
 photo_id: database ID of the photo being segmented.  The results
 will be returned in a JSON object with the format:
 {"photo_id": [[x1,y1,x2,y2,...], [x1,y1,x2,y2,...]]}
 otherwise, photo_id is not used.
 */
// giving a fake photo_id
window.template_args = {
    // BEGIN: OPENSURFACE ADD-ON, ADDED BY Tsung-Yi Lin
    photo_url: window.image.src,
    photo_id: imageFileName,
    // END: OPENSURFACE ADD-ON, ADDED BY Tsung-Yi Lin
};

// the user must submit this many shapes before they may submit:
window.min_shapes = 1;

// each polygon must have at least this many vertices:
window.min_vertices = 4;