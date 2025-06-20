
const fs = require('fs');
const path = require('path');
let AWS = require('aws-sdk');

// Configure AWS SDK
AWS.config.update({
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    region: process.env.S3_REGION,
    endpoint: process.env.S3_ENDPOINT,
    s3ForcePathStyle: process.env.S3_FORCE_PATH_STYLE == 'true',
    signatureVersion: process.env.S3_SIGNATURE_VERSION
});

let s3 = new AWS.S3();

exports.uploadFile = function (file_data) {
    return new Promise(async (resolve, reject) => {
        try {
            // Check file size (5 MB = 2 * 1024 * 1024 bytes)
            let fileSizeInBytes = file_data?.file?.length;
            let MAX_FILE_SIZE = 5 * 1024 * 1024;

            if (fileSizeInBytes < MAX_FILE_SIZE) {
                // Setting uploading filename
                let fileName = `${file_data?.fileName}.${file_data?.fileExtension}`;

                // Define S3 upload parameters
                let params = {
                    Bucket: process.env.S3_BUCKET_NAME,
                    Key: file_data?.path ? `${file_data?.path}/${fileName}` : `files/${fileName}`,
                    Body: file_data?.file,
                    ContentType: file_data?.contentType
                };

                // Uploading files to the bucket
                s3.upload(params, function (err, data) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(data.Location);
                    }
                });
            }
            else {
                reject('File size should be less than 5 MB');
            }
        } catch (error) {
            reject(error);
        }
    });
};

exports.listFiles = function (files_data) {
    return new Promise(async (resolve, reject) => {
        try {
            if (files_data?.directory) {
                if (files_data?.type == 'local') {
                    //local files in the server
                    const directoryPath = path.join(__dirname, `../${files_data?.directory}`);
                    let files = fs.readdirSync(directoryPath)
                        .filter(file => fs.statSync(path.join(directoryPath, file)).isFile());
                    resolve(files);
                }
                else {
                    //files in the S3 bucket
                    let params = {
                        Bucket: process.env.S3_BUCKET_NAME,
                        Prefix: `${files_data?.directory}`
                    };

                    s3.listObjects(params, function (err, data) {
                        if (err) {
                            reject(err);
                        } else {
                            let files = data.Contents
                                .filter(file => !file.Key.endsWith('/'));
                            resolve(files);
                        }
                    });
                }
            }
            else {
                reject('Directory is required');
            }
        } catch (error) {
            reject(error);
        }
    });
}

exports.listFilesWithoutExtension = function (files_data) {
    return new Promise(async (resolve, reject) => {
        try {
            if (files_data?.directory) {
                if (files_data?.type == 'local') {
                    //local files in the server
                    const directoryPath = path.join(__dirname, `../${files_data?.directory}`);
                    let files = fs.readdirSync(directoryPath)
                        .filter(file => fs.statSync(path.join(directoryPath, file)).isFile())
                        .map(file => path.parse(file).name);
                    resolve(files);
                }
                else {
                    //files in the S3 bucket
                    let params = {
                        Bucket: process.env.S3_BUCKET_NAME,
                        Prefix: `${files_data?.directory}`
                    };

                    s3.listObjects(params, function (err, data) {
                        if (err) {
                            reject(err);
                        } else {
                            let files = data.Contents
                                .filter(file => !file.Key.endsWith('/'))
                                .map(file => path.parse(file.Key).name);
                            resolve(files);
                        }
                    });
                }
            }
            else {
                reject('Directory is required');
            }
        } catch (error) {
            reject(error);
        }
    });
}