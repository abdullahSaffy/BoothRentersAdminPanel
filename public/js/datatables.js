$(function () {
  /**
   * User List
   */
  $("#user-datatable").DataTable({
    aoColumnDefs: [
      {
        bSortable: false,
        aTargets: [0, 1, 3, 5, 6],
      },
    ],
    stateSave: false,
    searchDelay: 700,
    aaSorting: [[4, "desc"]],
    processing: true,
    serverSide: true,
    initComplete: function (settings, json) {},
    createdRow: function (row, data, dataIndex) {},
    language: {
      processing:
        '<i class="fa fa-spinner fa-spin fa-3x"></i><span class="sr-only">Loading...</span> ',
    },
    ajax: {
      url: "/user/list",
      data: function (json) {},
      dataSrc: function (json) {
        var myData = {};
        myData.draw = parseInt(json.draw);
        myData.recordsTotal = parseInt(json.recordsTotal);
        myData.recordsFiltered = parseInt(json.recordsFiltered);
        myData.data = json.data;
        myData.data.forEach((x) => {
          let myDate = new Date(x[4]);
          x["4"] = myDate.toLocaleString();
        });
        return myData.data;
      },
    },
  });

  /**
   * Barber List
   */
  $("#barber-datatable").DataTable({
    aoColumnDefs: [
      {
        bSortable: false,
        aTargets: [0, 2, 3, 4, 7, 8],
      },
    ],
    stateSave: false,
    searchDelay: 700,
    aaSorting: [[1, "desc"]],
    processing: true,
    serverSide: true,
    initComplete: function (settings, json) {},
    createdRow: function (row, data, dataIndex) {},
    language: {
      processing:
        '<i class="fa fa-spinner fa-spin fa-3x"></i><span class="sr-only">Loading...</span> ',
    },
    ajax: {
      url: "/barber/list",
      data: function (json) {},
      dataSrc: function (json) {
        var myData = {};
        myData.draw = parseInt(json.draw);
        myData.recordsTotal = parseInt(json.recordsTotal);
        myData.recordsFiltered = parseInt(json.recordsFiltered);
        myData.data = json.data;
        myData.data.forEach((x) => {
          let myDate = new Date(x[6]);
          x["6"] = myDate.toLocaleString();
        });
        return myData.data;
      },
    },
  });

  /**
   * Request List
   */
  $("#request-datatable").DataTable({
    aoColumnDefs: [
      {
        bSortable: false,
        aTargets: [0, 1, 3, 5, 6, 7],
      },
    ],
    stateSave: false,
    searchDelay: 700,
    aaSorting: [[4, "desc"]],
    processing: true,
    serverSide: true,
    initComplete: function (settings, json) {},
    createdRow: function (row, data, dataIndex) {},
    language: {
      processing:
        '<i class="fa fa-spinner fa-spin fa-3x"></i><span class="sr-only">Loading...</span> ',
    },
    ajax: {
      url: "/request/list",
      data: function (json) {},
      dataSrc: function (json) {
        var myData = {};
        myData.draw = parseInt(json.draw);
        myData.recordsTotal = parseInt(json.recordsTotal);
        myData.recordsFiltered = parseInt(json.recordsFiltered);
        myData.data = json.data;
        myData.data.forEach((x) => {
          let myDate = new Date(x[5]);
          x["5"] = myDate.toLocaleString();
        });
        return myData.data;
      },
    },
  });

  /** User list export */
  $("#userListExports").on("click", function (e) {
    e.preventDefault();
    let table = $("#user-datatable").DataTable();
    let search = table.search();
    let order = table.order();
    window.location.href = "/user/export?search=" + search + "&order=" + order;
  });

  /** Barber list export */
  $("#barberListExports").on("click", function (e) {
    e.preventDefault();
    let table = $("#barber-datatable").DataTable();
    let search = table.search();
    let order = table.order();
    window.location.href =
      "/barber/export?search=" + search + "&order=" + order;
  });

  /**
   * Booking List
   */
  $("#booking-datatable").DataTable({
    aoColumnDefs: [
      {
        bSortable: false,
        aTargets: [0, 1, 3, 5, 6, 7, 8],
      },
    ],
    stateSave: false,
    searchDelay: 700,
    aaSorting: [[4, "desc"]],
    processing: true,
    serverSide: true,
    initComplete: function (settings, json) {},
    createdRow: function (row, data, dataIndex) {},
    language: {
      processing:
        '<i class="fa fa-spinner fa-spin fa-3x"></i><span class="sr-only">Loading...</span> ',
    },
    ajax: {
      url: "/booking/list",
      data: function (json) {},
      dataSrc: function (json) {
        var myData = {};
        myData.draw = parseInt(json.draw);
        myData.recordsTotal = parseInt(json.recordsTotal);
        myData.recordsFiltered = parseInt(json.recordsFiltered);
        myData.data = json.data;
        myData.data.forEach((x) => {
          let myDate = new Date(x[6]);
          x["6"] = myDate.toLocaleString();
        });
        return myData.data;
      },
    },
  });

  /**
   * report List
   */
  $("#report-datatable").DataTable({
    aoColumnDefs: [
      {
        bSortable: false,
        aTargets: [0, 1, 3, 4],
      },
    ],
    stateSave: false,
    searchDelay: 700,
    aaSorting: [[4, "desc"]],
    processing: true,
    serverSide: true,
    initComplete: function (settings, json) {},
    createdRow: function (row, data, dataIndex) {},
    language: {
      processing:
        '<i class="fa fa-spinner fa-spin fa-3x"></i><span class="sr-only">Loading...</span> ',
    },
    ajax: {
      url: "/report/list",
      data: function (json) {},
    },
  });

  /**
   * payment List
   */
  $("#payment-datatable").DataTable({
    aoColumnDefs: [
      {
        bSortable: false,
        aTargets: [0, 1, 3, 5, 6],
      },
    ],
    stateSave: false,
    searchDelay: 700,
    aaSorting: [[4, "desc"]],
    processing: true,
    serverSide: true,
    initComplete: function (settings, json) {},
    createdRow: function (row, data, dataIndex) {},
    language: {
      processing:
        '<i class="fa fa-spinner fa-spin fa-3x"></i><span class="sr-only">Loading...</span> ',
    },
    ajax: {
      url: "/payment/list",
      data: function (json) {},
    },
  });

  /**
   * Page List
   */
  $("#page-datatable").DataTable({
    aoColumnDefs: [
      {
        bSortable: false,
        aTargets: [0, 3],
      },
    ],
    stateSave: false,
    searchDelay: 700,
    aaSorting: [[2, "desc"]],
    processing: true,
    serverSide: true,
    initComplete: function (settings, json) {},
    createdRow: function (row, data, dataIndex) {
      for (var i = 0; i <= dataIndex; i++) {
        $(row).attr("id", data[5]);
      }
      $(row).attr("model", "user");
    },
    language: {
      processing:
        '<i class="fa fa-spinner fa-spin fa-3x"></i><span class="sr-only">Loading...</span> ',
    },
    ajax: {
      url: "/content/list",
      data: function (json) {},
    },
  });

  /**
   * Barber Page List
   */
  $("#barber-page-datatable").DataTable({
    aoColumnDefs: [
      {
        bSortable: false,
        aTargets: [0, 3],
      },
    ],
    stateSave: false,
    searchDelay: 700,
    aaSorting: [[2, "desc"]],
    processing: true,
    serverSide: true,
    initComplete: function (settings, json) {},
    createdRow: function (row, data, dataIndex) {
      for (var i = 0; i <= dataIndex; i++) {
        $(row).attr("id", data[5]);
      }
      $(row).attr("model", "user");
    },
    language: {
      processing:
        '<i class="fa fa-spinner fa-spin fa-3x"></i><span class="sr-only">Loading...</span> ',
    },
    ajax: {
      url: "/pageBarber/list",
      data: function (json) {},
    },
  });
});

function bookingReportFilter(elm) {
  let bookingDateRange = $("#bookingDateRange").val();
  if (bookingDateRange.length == 10) {
    bookingDateRange = bookingDateRange + " to " + bookingDateRange;
  }
  let custName = $("#custName").val();
  let barberName = $("#barberName").val();
  let location = $("#location").val();
  let addressCoordinates = $("#addressCoordinates").val();
  let bookingStatus = $("#bookingStatus").val();
  let table = $("#booking-datatable").DataTable();
  table.ajax
    .url(
      "/booking/list?bookingDateRange=" +
        bookingDateRange +
        "&custName=" +
        custName +
        "&location=" +
        location +
        "&addressCoordinates=" +
        addressCoordinates +
        "&bookingStatus=" +
        bookingStatus +
        "&barberName=" +
        barberName
    )
    .load();
}
