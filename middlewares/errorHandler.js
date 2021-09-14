const ApiError = require("../error/ApiError");

module.exports = function(error, req, res, next) {
	// TODO handle all errors
	console.log(error);

	if(error instanceof ApiError) {
		return res.status(error.status).json({error: error.message});
	}

	return res.status(500).send("Something went wrong");
}