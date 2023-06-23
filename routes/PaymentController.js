const express = require('express');
const router = express.Router();
const User = require("../models/User").User,
      Payment = require("../models/Payment").Payment,
      Shop = require("../models/Shop").Shop;
const UploadConfig = require("../lib/upload");


/** Payment List Screen */
router.get('/', FUNC.Auth, async function (req, res) {
    res.render("payment/index", {
        title: "Payment Manager",
    })
});

/** All Payment list */

router.get("/list", FUNC.Auth, async function (req, res) {
    let params = _.extend(req.query || {}, req.params || {}, req.body || {});
    params.search = params.search.value;
    params.columnNo = params.order ? parseInt(params.order[0].column) : "";
    params.sortOrder = params.order
      ? params.order[0].dir === "desc"
        ? -1
        : 1
      : -1;
    let searchQry = {};
  
    if (params.search) {
      searchQry = {
        $or: [
          {
            reqId: { $regex: params.search, $options: "i" },
          },
          {
            "user.fullName": { $regex: params.search, $options: "i" },
          },
          {
            "shop.name": { $regex: params.search, $options: "i" },
          },
        ],
      };
    }
  
    // add order filter
    let filterQry = {};
  
    // // product filter
    // if (params.product) {
    //   filterQry = {
    //     product: ObjectId(params.product)
    //   }
    // }
    
    let skip = parseInt(params.start);
    let limit = parseInt(params.length);
    let sortField = {};
    switch (params.columnNo) {
      case 1:
        sortField = {
          "user.fullName": params.sortOrder,
        };
        break;
      default:
        sortField = {
          createdAt: -1,
        };
        break;
    }
  
    let aggregate = [
      {
        $match: filterQry
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind:
          {
            path: "$user",
            preserveNullAndEmptyArrays: true
          }
      },
      {
        $lookup: {
          from: "shops",
          localField: "shop",
          foreignField: "_id",
          as: "shop",
      },
      },
      {
        $unwind:
          {
            path: "$shop",
            preserveNullAndEmptyArrays: true
          }
      },
      {
        $match: searchQry
      }
    ];
  
    aggregate.push({ $group: { _id: null, count: { $sum: 1 } } });
    let totalRecords = await Payment.aggregate(aggregate);
    totalRecords = totalRecords[0] != undefined ? totalRecords[0].count : 0;
    aggregate.pop();
  
    aggregate.push(
      {
        $sort: sortField,
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      }
    );
  
    let payment = await Payment.aggregate(aggregate);
    let response = {};
    let temp = [];
    console.log('payment data for users ==================<<<<<<<<< ',payment);

    async.eachSeries(
        payment,
      function (payment, loop) {

        let badgeStatus = (payment.status == true) ? " badge-success" : " badge-danger";
        let badgeLabel = (payment.status == true) ? "Active" : "Inactive";
        let status = (payment.status == true) ? 0 : 1;
        // let statusHtml = '<span id="tblStatus' + payment._id + '"><label data-id="tblStatus' + payment._id + '" class="badge ' + badgeStatus + ' tblStatus" data-url="' + process.env.SITE_URL + 'payment/update_status/' + payment._id + '/' + status + '">' + badgeLabel + '</label></span>';

        temp.push({
          0: (skip += 1),
          1: payment.reqId ? payment.reqId : "-",
          2: payment.user && payment.user.fullName ? payment.user.fullName: "N/A",
          3: payment.shop && payment.shop.name ? payment.shop.name: "N/A",
          4: payment.amount,
          5: FUNC.showDateFromString(payment.createdAt, "MMM DD YYYY"),
          6: `<a href = "/payment/view/${payment._id}""> <i class="fa fa-eye"></i></a >`
        });
        loop();
      },
      function (asyncErr, asyncRes) {
        response.data = temp;
        return res.send({
          draw: parseInt(req.query.draw),
          recordsFiltered: totalRecords,
          recordsTotal: totalRecords,
          data: temp,
        });
      }
    );
  });

/** View Payment screen */
router.get('/view/:id', FUNC.Auth, async function (req, res) {

    let params = _.extend(req.query || {}, req.params || {}, req.body || {});
    let payment = await Payment.findById(
        {
            _id: params.id
        }
    ).populate('user', 'fullName').populate('shop', 'name').lean();
    if (!payment) {
        req.flash('error', DM.PAYMENT_NOT_EXIST);
        return res.redirect(req.header('referer'));
    }
    return res.render('payment/view', {
        title: "View Payment",
        payment
    });
});

module.exports = router;
