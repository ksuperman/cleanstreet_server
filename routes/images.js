var express = require('express');
var router = express.Router();

/* Send Image to server. */
router.post('/fileUpload', function(req, res, next) {
    console.log(req);
    res.send(req.body);
});

module.exports = router;
