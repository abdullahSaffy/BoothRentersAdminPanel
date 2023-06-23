const express = require('express');
const router = express.Router();
const User = require('../models/User').User,
  Report = require('../models/Report').Report,
  Shop = require('../models/Shop').Shop,
  Appointment = require('../models/Appointment').Appointment;
const UploadConfig = require('../lib/upload');

/** Add barber Screen  **/
router.get('/add', FUNC.Auth, async function (req, res) {
  return res.render('barber/add', {
    title: 'Add New User',
    country: '+1',
    imgConfig: UploadConfig.BARBER_THUMB_IMG,
  });
});

/** Add Barber  **/
router.post(
  '/add',
  FUNC.Auth,
  FUNC.validate(validation.addUser, true),
  async function (req, res) {
    try {
      let params = _.extend(req.query || {}, req.params || {}, req.body || {});
      params.countryCode = '+1';

      let isUser = await User.countDocuments({ mobile: params.mobile });
      if (isUser > 0) {
        return res.badRequest({}, DM.MOBILE_NO_ALREADY_EXISTS);
      }

      if (params.email != '') {
        let isUserEmail = await User.countDocuments({ email: params.email });
        if (isUserEmail > 0) {
          return res.badRequest({}, DM.EMAIL_EXIST);
        }
      }

      let user = await new User({
        formattedMobile: `${params.countryCode}${params.mobile}`,
        email: params.email,
        role: 'Barber',
        gender: params.gender,
        countryCode: params.countryCode,
        mobile: params.mobile,
        fullName: params.fullName,
        profilePicture: params.profilePicture,
      }).save();

      // Increate total user count
      await Report.updateOne(
        {},
        {
          $inc: { tBarber: 1 },
        },
        { upsert: true }
      );

      if (!user) {
        return res.serverError({}, DM.SOMETHING_WRONG);
      }
      req.flash('success', DM.USER_ADD_SUCCESS);
      return res.success('back');
    } catch (e) {
      return res.serverError({}, DM.SOMETHING_WRONG);
    }
  }
);

/** Barber List Screen */
router.get('/', FUNC.Auth, async function (req, res) {
  console.log(process.env.S3_URL);
  res.render('barber/index', {
    title: 'Barber Manager',
    s3BaseUrl: process.env.S3_URL,
  });
});

/** All Barber List */
router.get('/list', FUNC.Auth, async function (req, res) {
  let params = _.extend(req.query || {}, req.params || {}, req.body || {});

  params.search = params.search.value;
  params.columnNo = params.order ? parseInt(params.order[0].column) : '';
  params.sortOrder = params.order
    ? params.order[0].dir === 'desc'
      ? -1
      : 1
    : -1;

  console.log('params.order[0].dir', params.order[0].dir);
  let userData = await getUserList(params);
  //   console.log("userData======",userData)
  let temp = [];
  let skip = parseInt(params.start);
  async.eachSeries(
    userData.data,
    function (user, loop) {
      //status work for shop
      // let shopBadgeStatus = (user.shopStatus == true) ? " badge-success" : " badge-danger";
      // let shopBadgeLabel = (user.shopStatus == true) ? "Accept" : "decline";
      // let statusShop = (user.shopStatus == true) ? 0 : 1;
      // let statusHtmlShop = '<span id="tblStatus' + user._id + '"><label data-id="tblStatus' + user._id + '" class="badge ' + shopBadgeStatus + ' tblStatus" data-url="' + process.env.SITE_URL + 'user/confirmShop/' + user._id + '/' + statusShop + '">' + shopBadgeLabel + '</label></span>';
      //end status work for shop
      //status work for shop
      let statusHtml = 'N/A';
      let thumbImg = 'N/A';
      if (user.shopDetails[0]) {
        let badgeStatus =
          user.shopDetails[0].status == true
            ? ' badge-success'
            : ' badge-danger';
        let badgeLabel =
          user.shopDetails[0].status == true ? 'Active' : 'Inactive';
        let status = user.shopDetails[0].status == true ? 0 : 1;
        statusHtml =
          '<span id="tblStatus' +
          user._id +
          '"><label data-id="tblStatus' +
          user._id +
          '" class="badge ' +
          badgeStatus +
          ' tblStatus" data-url="' +
          process.env.SITE_URL +
          'barber/update_status/' +
          user.shopDetails[0]._id +
          '/' +
          status +
          '">' +
          badgeLabel +
          '</label></span>';
        thumbImg = `<a href="#" id="preview-btn"><img src=${
          process.env.S3_URL
        }${
          user.shopDetails[0] && user.shopDetails[0].thumbImg
            ? user.shopDetails[0].thumbImg
            : ''
        } alt="img" class="img-circle thumb-md m-r-15"></a>`;
      }

      temp.push({
        0: (skip += 1),
        1: user.fullName,
        2: user.shopDetails[0] ? user.shopDetails[0].name : 'N/A',
        3: user.formattedMobile ? user.formattedMobile : 'N/A',
        4: thumbImg,
        5: user.tAppointment,
        6: user.createdAt,
        7: statusHtml,
        8: `<a href = "/barber/view/${user._id}""> <i class="fa fa-eye"></i></a >`,
      });
      loop();
    },
    function (asyncErr, asyncRes) {
      return res.send({
        draw: parseInt(req.query.draw),
        recordsFiltered: userData.totalRecords,
        recordsTotal: userData.totalRecords,
        data: temp,
      });
    }
  );
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
    role: 'Barber',
  };

  if (reqData.search) {
    searchQry = {
      ...searchQry,
      $or: [
        { fullName: { $regex: reqData.search, $options: 'i' } },
        { 'shopDetails.name': { $regex: reqData.search, $options: 'i' } },
        { email: { $regex: reqData.search, $options: 'i' } },
        {
          formattedMobile: { $regex: reqData.search, $options: 'i' },
        },
      ],
    };
  }

  //sorting
  let sortField = {};
  switch (reqData.columnNo) {
    case 2:
      sortField = {
        $sort: {
          fullName: reqData.sortOrder,
        },
      };
      break;
    case 5:
      sortField = {
        $sort: {
          tAppointment: reqData.sortOrder,
        },
      };
      break;
    default:
      sortField = {
        $sort: {
          createdAt: reqData.sortOrder,
        },
      };
  }
  totalRecords = await User.countDocuments(searchQry);

  let data = await User.aggregate([
    {
      $lookup: {
        from: 'shops',
        localField: 'shop',
        foreignField: '_id',
        as: 'shopDetails',
      },
    },
    {
      $lookup: {
        from: 'appointments',
        localField: '_id',
        foreignField: 'barber',
        as: 'appointmentsDetails',
      },
    },
    { $match: searchQry },
    {
      $addFields: {
        tAppointment: {
          $size: '$appointmentsDetails',
        },
      },
    },
    sortField,
    {
      $skip: skip,
    },
    {
      $limit: limit,
    },
  ]);
  return { data: data, totalRecords: totalRecords };
}

/** User account active/inactive */
router.get('/update_status/:id/:status', FUNC.Auth, async function (req, res) {
  try {
    let params = _.extend(req.query || {}, req.params || {}, req.body || {});
    let updt = { status: params.status };

    let userQry = {
      shopStatus: true,
    };

    if (params.status == '0') {
      userQry = {
        shopStatus: false,
        iat: 0,
      };
    }

    if (params.status == 0) {
      updt = {
        ...updt,
        iat: 0,
      };
    }
    await Shop.updateOne(
      {
        _id: params.id,
      },
      {
        $set: updt,
      }
    );

    await User.updateOne(
      {
        shop: params.id,
      },
      {
        $set: userQry,
      },
      {
        new: true,
      }
    );

    // update total active shop count
    Report.updateOne(
      {},
      {
        $inc: {
          activeShop: params.status == 0 ? -1 : 1,
        },
      }
    ).exec();

    return res.json({
      status: params.status == 0 ? false : true,
    });
  } catch (e) {
    req.flash('error', DM.SOMETHING_WRONG);
    return res.redirect(req.header('referer'));
  }
});

/** User Shop active/inactive */
router.get('/confirmShop/:id', FUNC.Auth, async function (req, res) {
  try {
    let params = _.extend(req.query || {}, req.params || {}, req.body || {});
    console.log('d================>>', params);

    await Shop.updateOne(
      {
        _id: params.id,
      },
      {
        $set: { status: true },
      }
    );

    await User.updateOne(
      {
        shop: params.id,
      },
      {
        $set: { shopStatus: true },
      }
    );

    // update total active active shop count
    Report.updateOne(
      {},
      {
        $inc: {
          activeShop: 1,
        },
      }
    ).exec();
    return res.redirect('/barber/view/' + params.id);
  } catch (e) {
    req.flash('error', DM.SOMETHING_WRONG);
    return res.redirect(req.header('referer'));
  }
});
/** View user screen */
router.get('/view/:id', FUNC.Auth, async function (req, res) {
  let params = _.extend(req.query || {}, req.params || {}, req.body || {});
  let user = await User.findById({
    _id: params.id,
    role: 'Barber',
    isDeleted: false,
  })
    .populate('shop')
    .lean();
  if (!user) {
    req.flash('error', DM.USER_NOT_EXIST);
    return res.redirect(req.header('referer'));
  }
  let shopLogo = '';
  if (user.shop && user.shop.thumbImg) {
    shopLogo = process.env.S3_URL + user.shop.thumbImg;
  }

  let findTotalAppointment = await Appointment.find({
    barber: params.id,
  }).count();
  return res.render('barber/view', {
    title: 'View Barber',
    user,
    shopLogo: shopLogo,
    logo: process.env.S3_URL + user.profilePicture,
    S3URL: process.env.S3_URL,
    findTotalAppointment,
  });
});

/** Edit page */
router.post('/edit/:id', async function (req, res) {
  try {
    let params = _.extend(req.query || {}, req.params || {}, req.body || {});
    let latLong = params.coordinates.split(',');

    await Shop.updateOne(
      {
        _id: params.id,
      },
      {
        $set: {
          location: latLong,
          googleAddress: params.address,
          address: params.address,
        },
      }
    );

    return res.json({
      success: true,
      address: params.address,
    });
  } catch (e) {
    return res.serverError({}, DM.SOMETHING_WRONG);
  }
});

/** User CSV excel */

router.get('/export', FUNC.Auth, async function (req, res) {
  let params = _.extend(req.query || {}, req.params || {}, req.body || {});
  const excel = require('node-excel-export');
  const styles = {
    headerDark: {
      fill: {
        fgColor: {
          rgb: 'FF000000',
        },
      },
      font: {
        color: {
          rgb: 'FFFFFFFF',
        },
        sz: 14,
        bold: true,
        underline: true,
      },
    },
    cellPink: {
      fill: {
        fgColor: {
          rgb: 'FFFFCCFF',
        },
      },
    },
    cellGreen: {
      fill: {
        fgColor: {
          rgb: 'FF00FF00',
        },
      },
    },
    textcenter: {
      alignment: {
        horizontal: 'center',
      },
      border: {
        bottom: {
          style: 'thin',
        },
        top: {
          style: 'thin',
        },
        left: {
          style: 'thin',
        },
        right: {
          style: 'thin',
        },
      },
      font: {
        bold: true,
        underline: true,
      },
    },
    subhead: {
      alignment: {
        horizontal: 'center',
      },
      font: {
        bold: true,
        sz: 12,
      },
    },
  };

  const heading = [
    [
      '',
      '',
      '',
      { value: 'Barber Details', style: styles.textcenter }, //13
      '',
      '',
      '',
    ],
  ];
  const specification = {
    fullName: {
      displayName: 'full Name',
      headerStyle: styles.subhead,
      width: 220,
    },
    mobile: {
      displayName: 'Mobile',
      headerStyle: styles.subhead,
      width: 220,
    },
    formattedMobile: {
      displayName: 'formatted Mobile',
      headerStyle: styles.subhead,
      width: 220,
    },
    email: {
      displayName: 'Email',
      headerStyle: styles.subhead,
      width: 220,
    },
    isCompProfile: {
      displayName: 'is Comp Profile',
      headerStyle: styles.subhead,
      width: 220,
    },
    otpVerify: {
      displayName: 'otp Verify',
      headerStyle: styles.subhead,
      width: 220,
    },
    isDeleted: {
      displayName: 'isDeleted',
      headerStyle: styles.subhead,
      width: 220,
    },
    isEmailVerified: {
      displayName: 'isEmailVerified',
      headerStyle: styles.subhead,
      width: 220,
    },
    isNotification: {
      displayName: 'isNotification',
      headerStyle: styles.subhead,
      width: 220,
    },
    emailNotification: {
      displayName: 'emailNotification',
      headerStyle: styles.subhead,
      width: 220,
    },
  };

  let order = params.order.split(',');
  params.columnNo = parseInt(order[0]);
  params.sortOrder = order[1] === 'desc' ? -1 : 1;
  params.start = 0;

  let empData = await User.find({ role: 'Barber', isDeleted: false });
  let dataset = [];
  let skip = 0;

  async.eachSeries(
    empData,
    function (emp, loop) {
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
        emailNotification: emp.emailNotification,
      });
      loop();
    },
    function (asyncErr, asyncRes) {
      const report = excel.buildExport([
        {
          name: 'All Barber', // <- Specify sheet name (optional)
          heading: heading, // <- Raw heading array (optional)
          // merges: merges, // <- Merge cell ranges
          specification: specification, // <- Report specification
          data: dataset, // <-- Report data
        },
      ]);

      res.attachment('Barber.xlsx');
      return res.send(report);
    }
  );
});

module.exports = router;
