class ApiError  {
	constructor(status, message) {
		this.status = status;
		this.message = message;
	}

	static badReq(message) {
		return new ApiError(400, message);
	}

	static internalError(message) {
		return new ApiError(500, message);
	}
}

module.exports = ApiError;