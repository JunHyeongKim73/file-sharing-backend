const dotenv = require('dotenv').config();
const path = require('path');

const { Storage } = require('@google-cloud/storage');
const storage = new Storage({ keyFilename: process.env.GCS_KEYFILE });

/**
 * GCS에 파일을 업로드한다
 * 바꾼 파일 이름을 반환한다
 */
const deleteGCSFile = async (path) => {
	const result = path.split('/');
	const fileName = result[result.length - 1];

	try {
		await storage.bucket(process.env.GCS_BUCKET).file(fileName).delete();
	} catch (e) {
        console.log('No such object');
    }
};

module.exports = deleteGCSFile;
