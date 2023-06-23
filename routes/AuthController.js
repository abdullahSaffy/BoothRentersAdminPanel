const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin.js').Admin;
const jwt = require('jsonwebtoken');
const mailer = require('../lib/mailer.js');
const Report = require('../models/Report').Report;
const Appointment = require('../models/Appointment').Appointment;

/** Admin Dashboard  **/
router.get('/', FUNC.Auth, async function (req, res) {
  let soldCnt = 0;
  let activeCnt = 0;
  let tProduct = 0;
  let tPurchase = 0;
  let tUser = 0;
  let tBarber = 0;
  let tBooking = 0;
  let tCancelBooking = 0;
  async.parallel(
    {
      // "adminEarning": function (callback) {
      //     // remanining from app end
      //     x = 1;
      //     callback(null, x);
      // },
      // "product": function (callback) {
      //     Product.find({})
      //         .exec((err, product) => {
      //             product.filter((p) => {
      //                 tProduct++;
      //                 if (p.isSold == true) {
      //                     soldCnt++;
      //                     tPurchase += (p.soldPrice) ? p.soldPrice : 0;
      //                     return;
      //                 }
      //                 if (p.status == true && p.isDeleted == false) {
      //                     activeCnt++;
      //                     return;
      //                 }
      //             })

      //             x = { soldCnt, tProduct, activeCnt, tPurchase: tPurchase.toFixed(2) };
      //             callback(null, x);
      //         });
      // },
      tUser: function (callback) {
        Report.findOne({}).exec((err, report) => {
          x = report.tUser;
          callback(null, x);
        });
      },
      tBarber: function (callback) {
        Report.findOne({}).exec((err, report) => {
          x = report.tBarber;
          callback(null, x);
        });
      },
      tBooking: function (callback) {
        Report.findOne({}).exec((err, report) => {
          x = report.tBooking;
          callback(null, x);
        });
      },
      tRequest: function (callback) {
        Report.findOne({}).exec((err, report) => {
          x = report.tRequest;
          callback(null, x);
        });
      },
      tCancelRequest: function (callback) {
        Report.findOne({}).exec((err, report) => {
          x = report.tCancelRequest;
          callback(null, x);
        });
      },
      tCancelBooking: function (callback) {
        Appointment.find({ status: 'canceled' })
          .count()
          .exec((err, data) => {
            x = data;
            callback(null, x);
          });
      },
      tCompletedBooking: function (callback) {
        Appointment.find({
          status: { $in: ['completed', 'completed_unverified'] },
        })
          .count()
          .exec((err, data) => {
            x = data;
            callback(null, x);
          });
      },
    },
    async function (err, record) {
      console.log('record--------------------------', record);
      return res.render('index', {
        title: 'Dashboard',
        record,
      });
    }
  );
});

/** Admin Login Screen  **/
router.get('/login', function (req, res) {
  if (req.session.user) {
    return res.redirect('/');
  }
  return res.render('auth/login', {
    title: 'Login',
  });
});

/**  Admin Login Verify  **/
router.post(
  '/login',
  FUNC.validate(validation.logIn),
  async function (req, res) {
    if (req.session.user) {
      return res.redirect('/');
    }
    let params = _.extend(req.query || {}, req.params || {}, req.body || {});
    const admin = await Admin.findOne({ email: params.email });
    console.log('admin: ', admin);
    if (!admin) {
      req.flash('error', DM.INVALID_CREDENTIAL);
      return res.redirect('/login');
    }
    const passwordMatched = await admin.comparePassword(params.password);
    console.log('passwordMatched: ', passwordMatched);

    if (!passwordMatched) {
      req.flash('error', DM.INVALID_CREDENTIAL);
      return res.redirect('/login');
    }
    if (admin.status == false) {
      req.flash('error', DM.INVALID_CREDENTIAL);
      return res.redirect('/login');
    }

    const adminJson = admin.toJSON();
    const token = jwt.sign(
      {
        formattedMobile: admin.formattedMobile,
        mobile: admin.mobile,
        _id: admin._id,
        changePasswordTime: admin.changePasswordTime,
      },
      process.env.JWT_SECRET
    );

    ['password', '__v'].forEach((key) => delete adminJson[key]);
    req.session.user = adminJson;
    req.session.token = token;

    req.flash('success', DM.LOGIN_SUCCESS);
    return res.redirect('/');
  }
);

/** Forgot Password Screen **/
router.get('/forgot_password', (req, res) => {
  res.render('auth/forgot_password', { title: 'Forgot Password' });
});

/** Forgot Password **/
router.post(
  '/forgot_password',
  FUNC.validate(validation.forgotPassword),
  async function (req, res, next) {
    console.log('varified');
    let params = _.extend(req.query || {}, req.params || {}, req.body || {});
    console.log('params:', params);
    let admin = await Admin.findOne({
      email: params.email,
    });
    console.log('admin: ', admin);
    if (!admin) {
      req.flash('error', DM.INCORRECT_EMAIL);
      return res.redirect('/forgot_password');
    }

    let isOtpSent = await sendOtp(admin);
    console.log('isOtpSent: ', isOtpSent);

    if (!isOtpSent.success) {
      req.flash('error', DM.SOMETHING_WRONG);
      return res.redirect('/forgot_password');
    }
    req.flash('success', DM.OTP_SENT);
    return res.redirect('/otp_verify/' + admin._id);
  }
);

/** Resend Otp **/
router.put('/resend_otp/:id', async function (req, res) {
  let params = _.extend(req.query || {}, req.params || {}, req.body || {});

  let admin = await Admin.findOne({
    _id: params.id,
  });

  if (!admin) {
    return res.badRequest({}, DM.SOMETHING_WRONG);
  }
  let isOtpSent = await sendOtp(admin);

  if (!isOtpSent.success) {
    return res.badRequest({}, DM.SOMETHING_WRONG);
  }
  return res.success({}, DM.OTP_SENT);
});

/** Enter otp screen */
router.get('/otp_verify/:id', async function (req, res) {
  let params = _.extend(req.query || {}, req.params || {}, req.body || {});

  let admin = await Admin.findOne({
    _id: params.id,
    otp: { $exists: true },
  });

  if (!admin) {
    return res.redirect('/forgot_password');
  }

  return res.render('auth/verify_otp', {
    title: 'Verify Otp',
  });
});

/**  Otp Verification Screen**/
router.put(
  '/otp_verify/:id',
  FUNC.validate(validation.otpVerify, true),
  async function (req, res) {
    let params = _.extend(req.query || {}, req.params || {}, req.body || {});

    let admin = await Admin.findOne({
      _id: params.id,
      otp: params.otp,
    });
    if (!admin) {
      return res.badRequest({}, DM.INVALID_OTP);
    }

    if (admin.otpExp < new Date().getTime()) {
      return res.badRequest({}, DM.OTP_EXPIRED);
    }
    admin.otpVerify = true;
    admin.save();
    req.flash('success', DM.OTP_VERIFIED);
    return res.success({});
  }
);

/** Reset Password Screen */
router.get('/reset_password/:id', async function (req, res) {
  let params = _.extend(req.query || {}, req.params || {}, req.body || {});
  console.log('params: ', params);
  let admin = await Admin.findOne({
    _id: params.id,
    otpVerify: true,
  });
  console.log('admin: ', admin);
  //   if (!admin || admin.otpExp < new Date().getTime()) {
  //     return res.redirect('/forgot_password');
  //   }

  return res.render('auth/reset_password', {
    title: 'Reset Password',
  });
});

/**  Reset Password **/
router.put(
  '/reset_password/:id',
  FUNC.validate(validation.resetPassword, true),
  async function (req, res) {
    let params = _.extend(req.query || {}, req.params || {}, req.body || {});

    let admin = await Admin.findOne({
      _id: params.id,
      otpVerify: true,
    });

    // if (!admin || admin.otpExp < new Date().getTime()) {
    //   return res.badRequest({}, DM.SOMETHING_WRONG);
    // }
    console.log('admin: ', admin);
    admin.password = params.password;
    admin.otp = undefined;
    admin.otpExp = undefined;
    admin.otpVerify = undefined;
    await admin.save();

    req.flash('success', DM.RESET_SUCCESS);
    return res.success({});
  }
);

/* Admin Logout */
router.all('/logout', FUNC.Auth, function (req, res) {
  if (req.session.user) {
    req.session.user.destroy; // Deletes the session in the database.
    req.session.user = null; // Deletes the cookie.
    req.session.token = null; // Deletes the cookie.
  }

  req.flash('success', DM.LOGOUT_SUCCESS);
  return res.redirect('/login');
});

/** send otp to email */
async function sendOtp(admin) {
  try {
    // Send otp
    let otp = 1234;
    let expTime =
      parseInt(new Date().getTime()) + parseInt(process.env.OTPEXPIRY);
    await Admin.updateOne(
      {
        email: admin.email,
      },
      {
        $set: {
          otp: otp,
          otpExp: expTime,
          otpVerify: false,
        },
      }
    );

    let sendParams = {
      to: admin.email,
      fullName: admin.name,
      otp: otp,
    };
    await mailer('ResetPassword', sendParams);
    return { success: true };
  } catch (e) {
    return { success: false };
  }
}

module.exports = router;
