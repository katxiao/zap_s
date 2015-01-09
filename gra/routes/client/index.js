var express = require('express');
var router = express.Router();
var fs = require('fs-extra');

/* GET home page. */
router.get('/', function(req, res) {
  res.render('cient/index', { title: 'For Clients Only' });
});

router.post('/', function (req, res) {
    
});

module.exports = router;
