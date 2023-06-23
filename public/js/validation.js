$(function () {
  let adminId = window.location.href.split('/').pop();
  //------------Login Form-----------------//

  $("#login-form").validate({
    errorPlacement: function (error, element) {
      const name = $(element).attr("name");
      error.appendTo($("." + name));
    },
    submitHandler: function (form, event) {
      $(form).find(":submit").prop('disabled', 'disabled');
      form.submit();
    },
    rules: {
      email: {
        required: {
          depends: function () {
            $(this).val($(this).val().trimStart());
            return true;
          }
        },
        email: true
      },
      password: {
        required: {
          depends: function () {
            $(this).val($(this).val().trimStart());
            return true;
          }
        }
      }
    },
    messages: {},
    ignore: ''
  });

  //------------Frogot Password Form-----------------//

  $("#forgot-pass-form").validate({
    errorPlacement: function (error, element) {
      const name = $(element).attr("name");
      error.appendTo($("." + name));
    },
    submitHandler: function (form, event) {
      $(form).find(":submit").prop('disabled', 'disabled');
      form.submit();
    },
    rules: {
      email: {
        required: {
          depends: function () {
            $(this).val($(this).val().trimStart());
            return true;
          }
        },
        email: true
      }
    },
    messages: {},
    ignore: ''
  });

  //------------Reset Password Form-----------------//

  $("#reset-pass-form").validate({
    errorPlacement: function (error, element) {
      const name = $(element).attr("name");
      error.appendTo($("." + name));
    },
    submitHandler: async function (form, event) {
      event.preventDefault();
      $(form).find(":submit").prop('disabled', 'disabled');
      await submitForm(form, window.location.href, 'PUT', '/login');
    },
    rules: {
      password: {
        required: {
          depends: function () {
            $(this).val($(this).val().trimStart());
            return true;
          }
        },
        minlength: 8,
      },
      confirmPassword: {
        required: {
          depends: function () {
            $(this).val($(this).val().trimStart());
            return true;
          }
        },
        minlength: 8,
        equalTo: "#password"
      }
    },
    messages: {},
    ignore: ''
  });

  //------------Otp Verification Form-----------------//
  $("#otp-verification").validate({
    errorPlacement: function (error, element) {
      const name = $(element).attr("name");
      error.appendTo($("." + name));
    },
    submitHandler: async function (form, event) {
      event.preventDefault();
      $(form).find(":submit").prop('disabled', 'disabled');
      await submitForm(form, window.location.href, 'PUT', '/reset_password/' + adminId);
    },
    rules: {
      otp: {
        required: {
          depends: function () {
            $(this).val($(this).val().trimStart());
            return true;
          }
        },
        maxlength: 4,
      }
    },
    messages: {},
    ignore: ''
  });

  //------------------------Resent otp------------------------------//
  $("#resent-otp").on('click', async function (event) {
    event.preventDefault();
    let form = $("#otp-verification");
    $(form).find(":submit").prop('disabled', 'disabled');
    await submitForm(form, '/resend_otp/' + adminId, 'PUT', '');
  });
});


//----------------------Submit Form-------------------------------//
const submitForm = (form, url, method, redirect) => {
  return new Promise((resolve, reject) => {
    $(".flash-message").empty();
    $(form).find(":submit").prop('disabled', true);
    $.ajax({
      url: url,
      type: method,
      data: $(form).serialize(),
      dataType: 'json',
    })
      .done(response => {
        if (redirect) {
          window.location.href = redirect;
        }
        else {
          $(".flash-message").append(`<div class="alert alert-success alert-dismissable"><button aria-hidden="true" data-dismiss="alert" class="close" type="button">&times;</button>${response.message}</div>`)
          $(form).find(":submit").prop('disabled', false);
          return;
        }
      })
      .catch((err) => {
        $(".flash-message").append(`<div class="alert alert-danger alert-dismissable"><button aria-hidden="true" data-dismiss="alert" class="close" type="button">&times;</button>${err.responseJSON.message}</div>`)
        $(form).find(":submit").prop('disabled', false);
      });
  });
}




