const dotenv = require('dotenv').config();
const path = require('path');

const { Storage } = require('@google-cloud/storage');
const storage = new Storage({ keyFilename: process.env.GCS_KEYFILE });

/**
 * GCS에 파일을 업로드한다
 * 바꾼 파일 이름을 반환한다
 */
const uploadToGCS = async (req, res, next) => {
    if(req.file === undefined) {
        next();
    }
    const fileData = req.file;
	const fileName = new Date().valueOf() + path.extname(fileData.originalname);
    const filePath = `https://storage.cloud.google.com/${process.env.GCS_BUCKET}/${fileName}`;

	await storage
		.bucket(process.env.GCS_BUCKET)
		.file(fileName)
		.save(fileData.buffer, {
			resumable: false,
		});
    
    req.file.path = filePath;
    next();
};

module.exports = uploadToGCS;
