var utils = {};

// https://github.com/kongming92/6170-p3demo/blob/master/utils/utils.js
/*
  Send a 200 OK with success:true in the request body to the
  response argument provided.
  The caller of this function should return after calling
*/
utils.sendSuccessResponse = function(res, content) {
  res.status(200).json({
    success: true,
    content: content
  }).end();
};

/*
  Send an error code with success:false and error message
  as provided in the arguments to the response argument provided.
  The caller of this function should return after calling
*/
utils.sendErrResponse = function(res, errcode, err) {
  res.status(errcode).json({
    success: false,
    err: err
  }).end();
};


utils.restrict = function(req, res, next) {
    if (req.user) {
        next();
    } else {
        utils.sendErrResponse(res, 401, 'Access denied!');
    }
}

module.exports = utils;
