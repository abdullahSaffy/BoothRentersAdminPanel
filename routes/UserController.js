const express = require('express');
const router = express.Router();
const User = require("../models/User").User,
    Report = require("../models/Report").Report;
const UploadConfig = require("../lib/upload");



/** Add User Screen  **/
router.get('/add', FUNC.Auth, async function (req, res) {

    return res.render('user/add', {
        title: 'Add New User',
        country : "+1",
        imgConfig: UploadConfig.USER_THUMB_IMG,
    });
});

/** Add User  **/
router.post('/add', FUNC.Auth, FUNC.validate(validation.addUser, true), async function (req, res) {
    try {
        let params = _.extend(req.query || {}, req.params || {}, req.body || {});
            params.countryCode = "+1";

        let isUser = await User.countDocuments({ mobile: params.mobile });
            if (isUser > 0) {
                return res.badRequest({}, DM.MOBILE_NO_ALREADY_EXISTS);
            }

        if(params.email != ""){
            let isUser = await User.countDocuments({ email: params.email });
            if (isUser > 0) {
                return res.badRequest({}, DM.EMAIL_EXIST);
            }
        }
        let user = await new User({
            formattedMobile: `${params.countryCode}${params.mobile}`,
            email: params.email ? params.email: "",
            gender: params.gender,
            countryCode: params.countryCode,
            role: "User",
            mobile: params.mobile.toString(),
            fullName: params.fullName,
            profilePicture: params.profilePicture
        }).save();
        
            // Increate total user count 
            await Report.updateOne({},
                {
                $inc: { tUser: 1 },
                },
                { upsert: true }
            );

        if (!user) {
            return res.serverError({}, DM.SOMETHING_WRONG);
        }
        req.flash('success', DM.USER_ADD_SUCCESS);
        return res.success({});

    } catch (e) {
        return res.serverError({}, DM.SOMETHING_WRONG);
    }
});

/** User List Screen */
router.get('/', FUNC.Auth, async function (req, res) {
    console.log(process.env.S3_URL);
    res.render("user/index", {
        title: "User Manager",
        s3BaseUrl: process.env.S3_URL
    })
});

/** All Users List */
router.get('/list', FUNC.Auth, async function (req, res) {
    let params = _.extend(req.query || {}, req.params || {}, req.body || {});

    params.search = params.search.value;
    params.columnNo = (params.order) ? parseInt(params.order[0].column) : "";
    params.sortOrder = (params.order) ? params.order[0].dir === 'desc' ? -1 : 1 : -1;


    let userData = await getUserList(params);
    let temp = [];
    let skip = parseInt(params.start);
    async.eachSeries(userData.data, function (user, loop) {

        let badgeStatus = (user.status == true) ? " badge-success" : " badge-danger";
        let badgeLabel = (user.status == true) ? "Active" : "Inactive";
        let status = (user.status == true) ? 0 : 1;
        let statusHtml = '<span id="tblStatus' + user._id + '"><label data-id="tblStatus' + user._id + '" class="badge ' + badgeStatus + ' tblStatus" data-url="' + process.env.SITE_URL + 'user/update_status/' + user._id + '/' + status + '">' + badgeLabel + '</label></span>';

        temp.push({
            0: (skip += 1),
            1: user.fullName,
            2: (user.email) ? user.email :"N/A",
            3: (user.formattedMobile) ? user.formattedMobile : "N/A",
            4: user.createdAt,
            5: statusHtml,
            6: `<a href = "/user/view/${user._id}""> <i class="fa fa-eye"></i></a >`
        });
        loop();
    }, function (asyncErr, asyncRes) {
        return res.send({
            draw: parseInt(req.query.draw),
            recordsFiltered: userData.totalRecords,
            recordsTotal: userData.totalRecords,
            data: temp,
        });
    });
});

/** get user list function */
async function getUserList(reqData) {
    //paging
    let skip = parseInt(reqData.start);
    let limit = parseInt(reqData.length);
    let totalRecords = 0;

    //search    
    let searchQry = {
        isDeleted: false,
        role: "User"
    };
    if (reqData.search) {
        searchQry = {
            ...searchQry,
            $or: [
                { fullName: { $regex: reqData.search, $options: 'i' } },
                { email: { $regex: reqData.search, $options: 'i' } },
                { formattedMobile: { $regex: `.*\\${reqData.search}.*`, $options: 'i' } }
            ],
        }
    }

    //sorting
    let sortField = {};
    switch (reqData.columnNo) {
        case 2:
            sortField = "fullName"
            break;
        case 4:
            sortField = "createdAt"
            break;
    }
    totalRecords = await User.countDocuments(searchQry);

    let data = await User.find(searchQry)
        .sort([[sortField, reqData.sortOrder]])
        .skip(skip)
        .limit(limit);

    return { data: data, totalRecords: totalRecords };
}

/** User account active/inactive */
router.get("/update_status/:id/:status", FUNC.Auth, async function (req, res) {
    try {
        let params = _.extend(req.query || {}, req.params || {}, req.body || {});
        let updt = { status: params.status };
        if (params.status == 0) {
            updt = {
                ...updt,
                iat: 0
            }
        }
        await User.updateOne(
            {
                _id: params.id
            },
            {
                $set: updt
            }
        );

        // update total active user count
        Report.updateOne({}, {
            $inc: {
                activeUser: (params.status == 0) ? -1 : 1
            }
        }).exec();

        return res.json({
            status: (params.status == 0)
                ? false : true,
        });
    } catch (e) {
        req.flash('error', DM.SOMETHING_WRONG);
        return res.redirect(req.header('referer'));
    }
});

/** Edit user screen */
router.get('/view/:id', FUNC.Auth, async function (req, res) {

    let params = _.extend(req.query || {}, req.params || {}, req.body || {});
    let user = await User.findById(
        {
            _id: params.id
        }
    );
    if (!user) {
        req.flash('error', DM.USER_NOT_EXIST);
        return res.redirect(req.header('referer'));
    }

    console.log('profile Logo=========++>',process.env.S3_URL + user.profilePicture);

    return res.render('user/view', {
        title: "View User",
        user,
        logo: process.env.S3_URL + user.profilePicture, 
        S3URL: process.env.S3_URL
    });
});


/** User CSV excel */

router.get("/export", FUNC.Auth, async function (req, res) {
    let params = _.extend(req.query || {}, req.params || {}, req.body || {});
    const excel = require('node-excel-export');
    const styles = {
        headerDark: {
            fill: {
                fgColor: {
                    rgb: 'FF000000'
                }
            },
            font: {
                color: {
                    rgb: 'FFFFFFFF'
                },
                sz: 14,
                bold: true,
                underline: true
            }
        },
        cellPink: {
            fill: {
                fgColor: {
                    rgb: 'FFFFCCFF'
                }
            }
        },
        cellGreen: {
            fill: {
                fgColor: {
                    rgb: 'FF00FF00'
                }
            }
        },
        textcenter: {
            alignment: {
                horizontal: 'center'
            },
            border: {
                bottom: {
                    style: 'thin'
                },
                top: {
                    style: 'thin'
                },
                left: {
                    style: 'thin'
                },
                right: {
                    style: 'thin'
                }

            },
            font: {
                bold: true,
                underline: true
            }
        },
        subhead: {
            alignment: {
                horizontal: 'center'
            },
            font: {
                bold: true,
                sz: 12
            },

        }
    };

    const heading = [
        [
            "", "", "",
            { value: 'User Details', style: styles.textcenter },//13
            "", "", "",
        ]
    ];
    const specification = {
        fullName: {
            displayName: 'full Name',
            headerStyle: styles.subhead,
            width: 220
        },
        mobile: {
            displayName: 'Mobile',
            headerStyle: styles.subhead,
            width: 220
        },
        formattedMobile: {
            displayName: 'formatted Mobile',
            headerStyle: styles.subhead,
            width: 220
        },
        email: {
            displayName: 'Email',
            headerStyle: styles.subhead,
            width: 220
        },
        isCompProfile: {
            displayName: 'is Comp Profile',
            headerStyle: styles.subhead,
            width: 220
        },
        otpVerify: {
            displayName: 'otp Verify',
            headerStyle: styles.subhead,
            width: 220
        },
        isDeleted: {
            displayName: 'isDeleted',
            headerStyle: styles.subhead,
            width: 220
        },
        isEmailVerified: {
            displayName: 'isEmailVerified',
            headerStyle: styles.subhead,
            width: 220
        },
        isNotification: {
            displayName: 'isNotification',
            headerStyle: styles.subhead,
            width: 220
        },
        emailNotification: {
            displayName: 'emailNotification',
            headerStyle: styles.subhead,
            width: 220
        },
    }

    let order = params.order.split(",");
    params.columnNo = parseInt(order[0]);
    params.sortOrder = order[1] === 'desc' ? -1 : 1;
    params.start = 0;

    let empData = await User.find({role:"User", isDeleted: "false"});
    let dataset = [];
    let skip = 0;

    async.eachSeries(empData, function (emp, loop) {   
        dataset.push({
            fullName: emp.fullName,
            mobile: emp.mobile,
            formattedMobile: emp.formattedMobile,
            email: emp.email,
            isCompProfile: emp.isCompProfile,
            otpVerify: emp.otpVerify,
            isDeleted: emp.isDeleted,
            isEmailVerified: emp.isEmailVerified,
            isNotification: emp.isNotification,
            emailNotification: emp.emailNotification
        });
        loop();
    }, function (asyncErr, asyncRes) {

        const report = excel.buildExport(
            [
                {
                    name: 'All Users', // <- Specify sheet name (optional)
                    heading: heading, // <- Raw heading array (optional)
                    // merges: merges, // <- Merge cell ranges
                    specification: specification, // <- Report specification
                    data: dataset // <-- Report data
                }
            ]
        );

        res.attachment('Users.xlsx');
        return res.send(report);
    });

});

module.exports = router;
