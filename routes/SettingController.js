const express = require('express');
const router = express.Router();
const Setting = require("../models/Setting").Setting;


/** Setting Screen Content */
router.get('/', FUNC.Auth, async function (req, res) {
    try {
        let setting = await Setting.findOne({});
        res.render(
            "setting/index",
            {
                title: "Setting",
                setting,
            }
        )
    } catch (e) {
        req.flash("error", DM.SOMETHING_WRONG);
        return res.redirect(req.header('referer'));
    }
});

/** settings Screen Content Update */
router.post('/', FUNC.Auth, FUNC.validate(validation.addSetting, true), async function (req, res) {
    try {
        let params = _.extend(req.query || {}, req.params || {}, req.body || {});
        console.log('params',params);
        let id = params._id;
        delete params._id;
        let updt = await Setting.updateOne(
            {
                _id: id
            },
            {
                $set: {
                    ...params,
                    android_force_update: (params.android_force_update) ? true : false,
                    maintenance_mode: (params.maintenance_mode) ? true : false,
                    ios_force_update: (params.ios_force_update) ? true : false,
                    ios_force_update_barber: (params.ios_force_update_barber) ? true : false,
                    android_force_update_barber: (params.android_force_update_barber) ? true : false
                },
            },
            {
                upsert: true
            });

        if (!updt) {
            return res.badRequest({}, DM.SOMETHING_WRONG);
        }

        req.flash("success", DM.SETTING_UPDATE_SUCCESS);
        return res.success({});
    } catch (e) {
        return res.serverError({}, DM.SOMETHING_WRONG);
    }
});

module.exports = router;