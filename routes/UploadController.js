const express = require('express');
const router = express.Router();

/** Upload file */
router.post('/add', FUNC.Auth, async function (req, res) {
    try {
        let files = req.files;
        let n = [];
        let ext = "";
        let fileRandomName = "";
        let fileName = "";
        async.eachSeries(files, function (image, cb) {
            ext = FUNC.getExtension(image.name);
            fileRandomName = FUNC.randomString(20) + new Date().getTime();
            fileName = `${req.query.type}/${fileRandomName}.${ext}`;
            FUNC.fileUpload(fileName, image).then((data) => {
                n.push(fileName);
                cb();
            });

        }, function (asyncErr, asyncRes) {
            return res.json({ data: n, success: true });
        })
    }
    catch (e) {
        return res.json({ data: n, success: false });
    }
});

/** Delete file */
router.delete('/delete', FUNC.Auth, async function (req, res) {
    try {
        const { key } = req.body;
        FUNC.deleteObject(key)
            .then((data) => {
                return res.json({
                    message: DM.DELETE_SUCCESS,
                    success: true
                })
            });
    } catch (e) {
        return res.json({
            message: DM.SOMETHING_WRONG,
            success: false
        })
    }
});

module.exports = router;