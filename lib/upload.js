const defaultImgSize = 2097152;
const UploadConfig = Object.freeze({
    BARBER_THUMB_IMG: {
        MAX_SIZE: parseInt(process.env.BARBER_THUMB_IMG_SIZE || defaultImgSize),
        MAX_FILES: parseInt(process.env.BARBER_THUMB_IMG_MAX),
        LOCATION: `Barber/profile`,
        EXTENSION: '.jpg, .png',
    },
    USER_THUMB_IMG:{
        MAX_SIZE: parseInt(process.env.BARBER_THUMB_IMG_SIZE || defaultImgSize),
        MAX_FILES: parseInt(process.env.BARBER_THUMB_IMG_MAX),
        LOCATION: `User/profile`,
        EXTENSION: '.jpg, .png',
    }
})

module.exports = UploadConfig;
