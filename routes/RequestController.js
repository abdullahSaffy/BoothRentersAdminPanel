const express = require("express");
const router = express.Router();
const User = require("../models/User").User,
  Report = require("../models/Report").Report,
  Shop = require("../models/Shop").Shop,
  Request = require("../models/Request").Request,
  Appointment = require("../models/Appointment").Appointment;
const UploadConfig = require("../lib/upload");

/** Request List Screen */
router.get("/", FUNC.Auth, async function (req, res) {
  res.render("request/index", {
    title: "Request Manager",
    s3BaseUrl: process.env.S3_URL,
  });
});

/** All Requests List */
router.get("/list", FUNC.Auth, async function (req, res) {
  let params = _.extend(req.query || {}, req.params || {}, req.body || {});

  params.search = params.search.value;
  params.columnNo = params.order ? parseInt(params.order[0].column) : "";
  params.sortOrder = params.order
    ? params.order[0].dir === "desc"
      ? -1
      : 1
    : -1;

  let userData = await getRequestList(params);
  let temp = [];
  let skip = parseInt(params.start);
  async.eachSeries(
    userData.data,
    function (request, loop) {
      let badgeStatus =
        request.status == "In-progress" || "waiting"
          ? " badge-success"
          : " badge-danger";

      let badgeLabel = request.status;

      let status = request.status == true ? 0 : 1;
      let statusHtml = '<span><label class="badge ' + badgeStatus + '" data-url="' + process.env.SITE_URL + 'barber/update_status/' + request._id + '/' + status + '">' + badgeLabel + '</label></span>'

      let date = moment(request.startDate * 1000).format("DD-MM-YYYY");
      temp.push({
        0: (skip += 1),
        1: request.reqId,
        2: request.user && request.user.fullName ? request.user.fullName : "N/A",
        3: date,
        4: request.amount,
        5: request.createdAt,
        6: statusHtml,
        7: `<a href = "/request/view/${request._id}""> <i class="fa fa-eye"></i></a >`,
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

/** get Booking list function */
async function getRequestList(reqData) {
  //paging
  let skip = parseInt(reqData.start);
  let limit = parseInt(reqData.length);
  let totalRecords = 0;
  //search
  let searchQry = {
    status: { $ne: "expired" },
  };
  if (reqData.search) {
    searchQry = {
      ...searchQry,
      $or: [
        { reqId: { $regex: reqData.search, $options: "i" } },
        { "user.fullName": { $regex: reqData.search, $options: 'i' } },
      ],
    };
  }

  //sorting
  let sortQry = {};
  switch (reqData.columnNo) {
    case 2:
      sortQry = { reqId: reqData.sortOrder };
      break;
    case 4:
      sortQry = { createdAt: reqData.sortOrder };
      break;
  }

  let aggregate = [
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: {
        path: "$user",
        "preserveNullAndEmptyArrays": true
      }
    },
    {
      $match: searchQry
    }
  ];

  aggregate.push({ $group: { _id: null, count: { $sum: 1 } } });
  totalRecords = await Request.aggregate(aggregate);
  totalRecords = totalRecords[0] != undefined ? totalRecords[0].count : 0;
  aggregate.pop();

  aggregate.push(
    {
      $sort: sortQry,
    },
    {
      $skip: skip,
    },
    {
      $limit: limit,
    }
  );

  let data = await Request.aggregate(aggregate);

  // let data = await Request.find(searchQry)
  //     .populate('user', 'name fullName mobile status')
  //     .sort([[sortField, reqData.sortOrder]])
  //     .skip(skip)
  //     .limit(limit);

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

    // update total active user count
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
    req.flash("error", DM.SOMETHING_WRONG);
    return res.redirect(req.header("referer"));
  }
});

/** View Request screen */
router.get("/view/:id", FUNC.Auth, async function (req, res) {
  let params = _.extend(req.query || {}, req.params || {}, req.body || {});
  let request = await Request.findById({
    _id: params.id
  })
    .populate("user")
    .lean();
  if (!request) {
    req.flash("error", DM.REQUEST_NOT_EXIST);
    return res.redirect(req.header("referer"));
  }

  return res.render("request/view", {
    title: "View Request",
    request,
    S3URL: process.env.S3_URL,
  });
});

module.exports = router;
