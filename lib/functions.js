const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin.js').Admin;
const AWS = require('aws-sdk');
AWS.config.update({
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_KEY,
  region: process.env.S3_REGION,
  apiVersion: '2020-12-18',
  signatureVersion: 'v4',
  ACL: 'public-read',
});
const s3 = new AWS.S3();
const sanitizer = require('sanitizer');
const sanitizeHtml = require('sanitize-html');
let errCnt = 0;
let htmlAllowRoute = ['/content', '/pageBarber'];

async function sanitizeArr(paramsArr, reqUrl = '', cb) {
  let sanitizeVal = '';
  let temp = '';
  paramsArr = Object.keys(paramsArr).map((p) => {
    if (Array.isArray(paramsArr[p])) {
      let sanArr1 = Object.keys(paramsArr[p]).map((o) => {
        if (typeof paramsArr[p][o] == 'string') {
          sanitizer.sanitize(paramsArr[p][o]) != paramsArr[p][o]
            ? errCnt++
            : '';
          return paramsArr[p][o];
        } else {
          sanitizeArr(paramsArr[p][o], reqUrl, (err, result) => {
            temp = result.paramsArr;
          });
          return Object.assign({}, ...temp);
        }
      });
      return { [p]: sanArr1 };
    } else {
      sanitizeVal =
        htmlAllowRoute.includes(reqUrl) == false
          ? sanitizer.sanitize(paramsArr[p])
          : sanitizeHtml(paramsArr[p], {
              allowedAttributes: {
                '*': ['style'],
              },
            });

      if (sanitizeVal == '' && paramsArr[p] != '') {
        errCnt++;
      }

      let escapeHtmlVal = '';
      if (htmlAllowRoute.includes(reqUrl) == false) {
        escapeHtmlVal = sanitizer.escape(paramsArr[p]);
        escapeHtmlVal = escapeHtmlVal.replace(/&amp;/g, '&');
        if (escapeHtmlVal != paramsArr[p] && typeof paramsArr[p] != 'boolean') {
          errCnt++;
        }
      }
      return { [p]: escapeHtmlVal ? escapeHtmlVal : sanitizeVal };
    }
  });
  return cb(null, { paramsArr, errCnt });
}

module.exports = {
  validate:
    (
      schema,
      isAjax = false,
      field = 'body',
      options = { abortEarly: false },
      redirect = 'self'
    ) =>
    (req, res, next) => {
      const { error, value } = schema.validate(req[field], {
        ...options,
      });

      console.log('validate is called', value);
      console.log('validate is error', error);

      if (error) {
        if (isAjax) {
          return res.status(400).json({
            success: false,
            data: '',
            message: error.message,
          });
        }
        req.flash('error', error.message);
        return res.redirect(
          redirect === 'self' ? req.headers.referer || '/' : redirect
        );
      }

      sanitizeArr(value, req.baseUrl, (err, result) => {
        req[field] = Object.assign({}, ...result.paramsArr);
        errCnt = 0;

        console.log('result : ', result);

        if (result.errCnt == 0) {
          return next();
        }
        console.log('isAjax', isAjax);
        if (isAjax) {
          return res.status(400).json({
            success: false,
            data: '',
            message: DM.INVALID_DATA,
          });
        }
        console.log('DM.INVALID_DATA', DM.INVALID_DATA);

        req.flash('error', DM.INVALID_DATA);
        return res.redirect(
          redirect === 'self' ? req.headers.referer || '/' : redirect
        );
      });
    },
  randomString: function (len, charSet) {
    charSet =
      charSet ||
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var randomString = '';
    for (var i = 0; i < len; i++) {
      var randomPoz = Math.floor(Math.random() * charSet.length);
      randomString += charSet.substring(randomPoz, randomPoz + 1);
    }
    return randomString;
  },
  Auth: function (req, res, next) {
    jwt.verify(
      req.session.token,
      process.env.JWT_SECRET,
      async (err, decoded) => {
        if (err || !decoded) {
          req.session.user = null;
          req.session.token = null;
          return res.redirect('/login');
        }

        const admin = await Admin.findOne({
          _id: decoded._id,
          //authTokenIssuedAt: decoded.iat,
        });

        if (!admin || admin.changePasswordTime != decoded.changePasswordTime) {
          req.session.user = null;
          req.session.token = null;
          req.flash('error', DM.UNAUTHORIZED);
          return res.redirect('/login');
        }

        res.user = admin;
        const adminJson = admin.toJSON();
        ['password', '__v'].forEach((key) => delete adminJson[key]);
        req.session.user = adminJson;
        return next();
      }
    );
  },
  capitalize: function (s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  },
  utcDateTime: function () {
    date = new Date(date);
    return new Date(
      Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        date.getUTCHours(),
        date.getUTCMinutes(),
        date.getUTCSeconds()
      )
    );
  },
  resetToken: function (user, token) {
    // Generate reset token
    let resetCode = jwt.sign(
      {
        formattedMobile: user.formattedMobile,
        email: user.email,
        resetTime: parseInt(new Date().getTime() / 1000),
      },
      token
    );
    return resetCode;
  },
  readHTMLFile: function (path) {
    return new Promise((resolve, reject) => {
      fs.readFile(path, { encoding: 'utf-8' }, function (err, html) {
        if (err) {
          reject(err);
        } else {
          resolve(html);
        }
      });
    });
  },
  showDate: (date, format) => {
    date = new Date(date * 1000);
    return moment(date).format(format);
  },
  getSlug: async function (name) {
    return new Promise((resolve, reject) => {
      let slug = name.trim().split(' ').join('_');
      slug = slug.toLowerCase();
      return resolve(slug);
    });
  },
  showDateFromString: (date, format) => {
    let changeDate = Date.parse(date);
    return moment(changeDate).format(format);
  },
  fileUpload: function (random_name, file) {
    return new Promise((resolve, reject) => {
      var params = {
        Bucket: process.env.S3_BUCKET,
        Key: random_name,
        ContentType: file.mimetype,
        Body: file.data,
        ACL: 'public-read',
      };
      s3.upload(params, (err, response) => {
        return resolve({ name: random_name });
      });
    });
  },
  getExtension: function (file_name, callback) {
    var file_ext = file_name.split('.');
    return file_ext[1];
  },
  deleteObject: function (file) {
    return new Promise((resolve, reject) => {
      var params = {
        Bucket: process.env.S3_BUCKET,
        Key: file,
      };
      s3.deleteObject(params, (err, data) => {
        return resolve();
      });
    });
  },

  timeConverter: function (UNIX_timestamp) {
    var a = new Date(UNIX_timestamp * 1000);
    var months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var time = month + '' + date + ' ' + +' ' + year;
    return time;
  },

  showFileName: (file) => {
    return file.split('/').pop();
  },

  removeEmptySlugImage: (fileArray) => {
    fileArray.map((e) => {
      if (e == '') {
        fileArray.pop(e);
        return fileArray;
      }
    });
  },
};
