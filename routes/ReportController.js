const express = require('express');
const router = express.Router();
const User = require("../models/User").User,
    UserReport = require("../models/UserReport").UserReport;
const UploadConfig = require("../lib/upload");


/** Report List Screen */
router.get('/', FUNC.Auth, async function (req, res) {
    res.render("report/index", {
        title: "Report Manager",
    })
});

router.get("/list", FUNC.Auth, async function (req, res) {
    let params = _.extend(req.query || {}, req.params || {}, req.body || {});

    params.search = params.search.value;
    params.columnNo = params.order ? parseInt(params.order[0].column) : "";
    params.sortOrder = params.order ? params.order[0].dir === "desc" ? -1 : 1 : -1;
    let searchQry = {};
  
    if (params.search) {
      searchQry = {
        $or: [
          {
            "reportBy.fullName": { $regex: params.search, $options: "i" },
          },
          {
            "reportedTo.fullName": { $regex: params.search, $options: "i" },
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
      case 2:
        sortField = {
          "reportedTo.fullName": params.sortOrder,
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
          localField: "reportBy",
          foreignField: "_id",
          as: "reportBy",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "reportedTo",
          foreignField: "_id",
          as: "reportedTo",
        },
      },
      {
        $match: searchQry
      }
    ];
  
    aggregate.push({ $group: { _id: null, count: { $sum: 1 } } });
    let totalRecords = await UserReport.aggregate(aggregate);
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
  
    let report = await UserReport.aggregate(aggregate);
    let response = {};
    let temp = [];
  
    async.eachSeries(
      report,
      function (report, loop) {

        let badgeStatus = (report.status == true) ? " badge-success" : " badge-danger";
        let badgeLabel = (report.status == true) ? "Active" : "Inactive";
        let status = (report.status == true) ? 0 : 1;
        // let statusHtml = '<span id="tblStatus' + report._id + '"><label data-id="tblStatus' + report._id + '" class="badge ' + badgeStatus + ' tblStatus" data-url="' + process.env.SITE_URL + 'report/update_status/' + report._id + '/' + status + '">' + badgeLabel + '</label></span>';

        temp.push({
          0: (skip += 1),
          1: report.reportBy[0] && report.reportBy[0].fullName ? report.reportBy[0].fullName: "-",
          2: report.reportedTo[0] && report.reportedTo[0].fullName ? report.reportedTo[0].fullName: "-",
          3: report.reportedFor,
          4: FUNC.showDateFromString(report.createdAt, "MMM DD YYYY")
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


module.exports = router;
