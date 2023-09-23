const path = require('path');

const multer = require('multer');



const tmpDir = path.resolve(__dirname, '../../../tmp');

const fileStorageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, tmpDir);
    },
    filename: (req, file, cb) => {
        console.log(file.originalname);
        
        const fileExt = file.originalname.split('.').pop().toLowerCase();
        const tmpFile = `${Date.now()}.${fileExt}`;
        const tmpFilePath = `${tmpDir}/${tmpFile}`;

        req.tmpFile = tmpFile;
        req.tmpFilePath = tmpFilePath;

        cb(null, tmpFile);
    }
});



const oneHundredMB = 1024 * 1024 * 100;

const upload = multer({
    storage: fileStorageEngine,
    limits: {
        fileSize: oneHundredMB
    },
    fileFilter: (req, file, cb) => {
        const allowedFileTypes = ['mp4', 'mov', 'mkv', 'flv', 'avi', 'webm', 'wmv'];
        const fileExt = file.originalname.split('.').pop().toLowerCase();
        if (!allowedFileTypes.includes(fileExt)) {
            const error = new Error('File type not allowed');
            error.code = 'FILE_TYPE_NOT_ALLOWED';
            return cb(error, false);
        }

        cb(null, true);
    },
});

const handleMulterErrors = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ success: false, message: 'File size exceeds the limit' });
        }
    } else if (err) {
        if (err.code === 'FILE_TYPE_NOT_ALLOWED') {
            return res.status(400).json({ success: false, message: 'File type not allowed' });
        }
    }

    next(err);
};



module.exports = {
    upload,
    handleMulterErrors
};
