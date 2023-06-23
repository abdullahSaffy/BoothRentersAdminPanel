$(function () {
    var $dropZoneUpload = $(".dropZoneUpload");
    const requester = (url, data = {}, type = 'DELETE', dataType = 'json', msgElem = '.apiMessage') => {
        const $apiMessage = $(msgElem);
        return new Promise(resolve => {
            $.ajax({
                url,
                type,
                data,
                dataType,
                success: function (res) {
                    const { success, message } = res;
                    if (success) {
                        $apiMessage.html(`<div class="alert alert-success alert-dismissible fade show" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">×</span></button>${message}</div>`).parents('div.row').show();
                    } else {
                        $apiMessage.html(`<div class="alert alert-danger alert-dismissible fade show" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">×</span></button>${message}</div>`).parents('div.row').show();
                    }
                    if (msgElem === '.apiMessage') {
                        $('html, body').animate({
                            scrollTop: $apiMessage.offset().top - 100
                        }, 200);
                    }
                    resolve(success);
                },
                error: function (res) {
                    $apiMessage.html(`<div class="alert alert-danger alert-dismissible fade show" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">×</span></button>${res.responseJSON.message}</div>`).parents('div.row').show();
                    if (msgElem === '.apiMessage') {
                        $('html, body').animate({
                            scrollTop: $apiMessage.offset().top - 100
                        }, 200);
                    }
                    resolve(false);
                }
            });
        });
    };
    $dropZoneUpload.each((i, elem) => {
        const $this = $(elem);
        const uploadedObjects = $this.attr('data-uploaded') ? JSON.parse($this.attr('data-uploaded')) : {};
        const maxFiles = !isNaN(parseInt($this.attr('data-maxFiles'))) ? parseInt($this.attr('data-maxFiles')) : 1;
        const removeClass = $this.attr('data-removeClass') || '';

        $this.dropzone({
            paramName: $this.attr('data-paramName') || 'file',
            url: `/upload/add?type=${$this.attr('data-url')}`,
            uploadMultiple: $this.attr('data-maxFiles') > 1,
            maxFiles,
            maxFilesize: !isNaN(parseInt($this.attr('data-maxFilesize'))) ? parseInt($this.attr('data-maxFilesize')) : 1,
            acceptedFiles: $this.attr('data-acceptedFiles') || 'image/*',
            parallelUploads: 1,
            addRemoveLinks: true,
            targetUrl: `${$this.attr('targetUrl')}`,
            init: function () {

                const addFiles = (mockFile) => {

                    this.emit("addedfile", mockFile);
                    this.emit('thumbnail', mockFile, mockFile.thumb)
                    mockFile.previewElement.classList.add('dz-success');
                    mockFile.previewElement.classList.add('uploadedImg');
                    mockFile.previewElement.classList.add('dz-complete');
                    $(mockFile.previewElement).find('.dz-image').children('img').addClass("image-preview");
                    this.emit("complete", mockFile);
                  
                    let fName = mockFile.key.split("/");
                    $(mockFile.previewElement).find('.dz-filename').children('span').text(fName[1]);  // show file name on preview
                  
                    if (mockFile.type === 'video') {
                        $(mockFile.previewElement).find('.dz-image').empty().html(`<video src="${mockFile.thumb}"class="video-preview" /> `);
                    }
                    if (mockFile.type == "document") {
                        $(mockFile.previewElement).find('.dz-image').empty().html(`
                        <embed class="image-preview" src="${mockFile.thumb}" type="application/pdf">
                        `)
                    }
                    this.options.maxFiles > 0 && (this.options.maxFiles = this.options.maxFiles - 1);
                    $this.children().last().find('.dz-remove').attr('href', 'javascript: void(0);').addClass(removeClass)
                };
                this.on("processing", function (file) {
                    showLoader();
                });
                this.on("success", function (file, responseText) {

                    if (responseText.success) {
                        let mediaName = "";
                        $this.siblings('.text-danger').hide();
                        $this.children('.needsclick').hide();
                        const $thisRes = $(`#${$this.attr('data-saveTo')}`);
                        if (`${$thisRes.val().length}` > 0) {
                            mediaName = `${$thisRes.val()},${responseText.data}`;
                        }
                        else {
                            mediaName = `${$thisRes.val()}${responseText.data}`
                        }
                        let urls = mediaName.split(',');
                        urls = urls.filter((item, i, ar) => ar.indexOf(item) === i).join(',');
                        $thisRes.val(urls);

                        // Code for thumb
                        const tempUrlArr = urls.split(',').filter(i => i);
                        file.key = tempUrlArr[tempUrlArr.length - 1];
                        file.thumb = `${window.s3Base}${tempUrlArr[tempUrlArr.length - 1]}`;
                        $("#" + this.options.targetUrl).prop('disabled', false);     // for video or url option
                        $.loadingBlockHide({});
                    }

                });
                this.on("error", function (file, res) {
                    if (res.message) {
                        res = res.message;
                    }
                    let $apiMessage = $this.children('[data-msg-id]').attr('data-msg-id');
                    $($apiMessage).html(`<div class="alert alert-danger alert-dismissible fade show" role="alert"><button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">×</span></button>${res}</div>`).parents('div.row').show();
                    $('html, body').animate({
                        scrollTop: $($apiMessage)
                            .offset().top - 100
                    }, 200);
                    $.loadingBlockHide({});
                });

                this.on("removedfile", async file => {
                    showLoader();

                    $this.children('.needsclick').hide();

                    if (file.key) {

                        // check if image is exist in uploadedObjects
                        let check = _.find(uploadedObjects.objects, function (n) {
                            return n.key == file.key
                        })
                        const url = (check) ? "" : `/upload/delete?type=${$this.attr('data-url')}`;
                        const data = {
                            ...uploadedObjects.data,
                            key: file.key,
                        };

                        // Add validation to not delete already uploaded media from S3 until user submit form 
                        let result = true;
                        if (url) {
                            result = await requester(url, data, uploadedObjects.type, uploadedObjects.dataType, $this.children('[data-msg-id]').attr('data-msg-id'))
                        }
                        if (result) {
                            //Remove key from saved field
                            const $thisRes = $(`#${$this.attr('data-saveTo')}`);
                            let urls = $thisRes.val().split(',').filter(i => i);
                            delete urls[urls.indexOf(file.key)];
                            urls = urls.filter(i => i).join(',');
                            $thisRes.val(urls ? `${urls},` : '');
                            $this.children('.dz-preview').length < maxFiles && (this.options.maxFiles = this.options.maxFiles + 1);

                            // Add delete media key in another field
                            const $removeRes = $(`#${$this.attr('data-remove')}`);
                            if ($removeRes.val() && `${$removeRes.val().length}` > 0) {
                                $removeRes.val(`${$removeRes.val()},${file.key}`);
                            }
                            else {
                                $removeRes.val(`${$removeRes.val()}${file.key}`);
                            }

                        } else {
                            addFiles(file);
                        }
                        if (!$this.children('.dz-preview').length) {
                            $this.children('.needsclick').show();
                            $this.siblings('.text-danger').show();
                        }

                        if (result && uploadedObjects) {
                            _.remove(uploadedObjects.objects, function (n) {
                                return n.key == file.key
                            });
                        }
                        $.loadingBlockHide({});
                        $("#" + this.options.targetUrl).prop('disabled', false);   // for video or url option

                    }

                    else if (!file.key && !$this.children('.dz-preview').length) {
                        $this.children('.needsclick').show();
                        $this.siblings('.text-danger').show();
                        $.loadingBlockHide({});
                    }
                    else {
                        $.loadingBlockHide({});
                    }
                });

                uploadedObjects.objects && uploadedObjects.objects.forEach(mockFile => addFiles(mockFile));
            }
        });
    });
});
