const HttpResponseCode = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  FORCE_LOGOUT: 440,
  SERVER_ERROR: 500,
};

const Response = {
  success: function (data = null, message = "") {
    this.status(HttpResponseCode.OK).send({
      success: true,
      data,
      message,
    });
  },
  badRequest: function (data = null, message = "") {
    this.status(HttpResponseCode.BAD_REQUEST).send({
      success: false,
      data,
      message,
    });
  },
  unauthorized: function (data = null, message = "") {
    this.status(HttpResponseCode.UNAUTHORIZED).send({
      success: false,
      data,
      message,
    });
  },
  notFound: function (data = null, message = "") {
    this.status(HttpResponseCode.NOT_FOUND).send({
      success: false,
      data,
      message,
    });
  },
  serverError: function (
    data = null,
    message = "",
    /** @type Error */ err = null
  ) {
    if (err) console.error(err);
    this.status(HttpResponseCode.SERVER_ERROR).send({
      success: false,
      data,
      message,
    });
  },
  forceLogout: function (data = null, message = "") {
    this.status(HttpResponseCode.FORCE_LOGOUT).send({
      success: false,
      data,
      message,
    });
  },
};

module.exports.HttpResponseCode = HttpResponseCode;
module.exports.Response = Response;
