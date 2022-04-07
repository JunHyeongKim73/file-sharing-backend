const errorHandlers = (e, res) => {
	console.error(e);

	const data = {};
	const messageList = [
		'NoUserError',
		'NoCustomerError',
		'NoSellerError',
		'NoFileError',
		'NoPurchaseError',
		'NoReviewError',
		'SameEmailError'
	];

	data['success'] = false;
	if (messageList.includes(e.message)) {
		data['message'] = e.message;
		res.status(409).json(data);
	} else if (e.message == 'BodyFormatError') {
		data['message'] = 'Body Format is not correct';
		res.status(400).json(data);
	} else if (e.message == 'UrlQueryError') {
		data['message'] = 'Url Query Format is not correct';
		res.status(400).json(data);
	} else if (e.message == 'StarValueError') {
		data['message'] = 'Star Value must be less than 5';
		res.status(400).json(data);
	} else if (e.message == 'loginError') {
		data['message'] = `Email doesn't exist or Password was wrong`;
		res.status(409).json(data);
	} else if (e.message == 'jwtExpired') {
		data['message'] = 'jwt expired';
		res.status(400).json(data);
	} else {
		data['message'] = 'Query Error';
		res.status(400).json(data);
	}
};

module.exports = errorHandlers;
