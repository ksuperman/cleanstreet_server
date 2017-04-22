angular.module('PendingImagesController', ['datatables'])//, 'datatables.buttons'
    .controller("PendingImagesController", function (DTDefaultOptions, DTOptionsBuilder, DTColumnBuilder, $scope, $timeout, $window, serverUtilities) {

        var self = this;

        $scope.selectedImage = {};

        /* Initialize the Image Popup Modal */
        $('#imageDetailModal').modal({
            complete: function () {
                /* Add Code to Remove the Existing Image*/
            }
        });

        /* Create the Data Table */
        DTDefaultOptions.setLoadingTemplate('<div class="preloader-wrapper big active"><div class="spinner-layer spinner-blue"><div class="circle-clipper left"><div class="circle"></div></div><div class="gap-patch"><div class="circle"></div> </div><div class="circle-clipper right"><div class="circle"></div></div></div>');

        self.dtOptions = DTOptionsBuilder.newOptions()
            .withOption('ajax', {
                url: '/tools/getPendingImages',
                type: 'POST'
            })
            //.withButtons(['colvis'])
            .withDataProp('data')
            .withOption('processing', true)
            .withOption('serverSide', true)
            .withOption('responsive', true)
            .withPaginationType('full_numbers')
            .withOption('rowCallback', rowClickCallback)
            .withOption('order', [4, 'desc']);

        self.dtColumns = [
            DTColumnBuilder.newColumn('idString').withTitle('Image Id').withOption('width', '40px'),
            DTColumnBuilder.newColumn('server_image_url').withTitle('Image').withOption('width', '90px').withOption('searchable', false).notSortable().renderWith(function (data, type, full) {
                return '<img width="300" class="z-depth-5" src="' + full.server_image_url + '"/>';
            }),
            DTColumnBuilder.newColumn('imagesize').withTitle('Image Size').withOption('width', '90px').withOption('searchable', false).renderWith(function (data, type, full) {
                return '<b>' + full.width + 'x' + full.height + '</b>';
            }).notSortable(),
            DTColumnBuilder.newColumn('file_name').withTitle('File Name').withOption('width', '90px'),
            DTColumnBuilder.newColumn('date_captured').withTitle('Date Captured').withOption('width', '90px').withOption('searchable', false).renderWith(function (data, type, full) {
                return new Date(full.date_captured).toDateString();
            }),
            DTColumnBuilder.newColumn('width').withTitle('Width').withOption('width', '90px').withOption('searchable', false).notSortable().notVisible(),
            DTColumnBuilder.newColumn('height').withTitle('Height').withOption('width', '90px').withOption('searchable', false).notSortable().notVisible(),
            DTColumnBuilder.newColumn('image_type').withTitle('Image Type').withOption('width', '90px').notVisible()
            /* POC for Image EXIF Extraction */
            /*DTColumnBuilder.newColumn('image').withTitle('image').withOption('width', '90px').withOption('searchable', false).notSortable().renderWith(function (data, type, full) {
                var exifObj = piexif.load(full.image);
                console.log(exifObj);
                for (var ifd in exifObj) {
                    if (ifd == "thumbnail") {
                        continue;
                    }
                    console.log("-" + ifd);
                    for (var tag in exifObj[ifd]) {
                        console.log("  " + piexif.TAGS[ifd][tag]["name"] + ":" + exifObj[ifd][tag]);
                    }
                }
                return '';
            }),*/
        ];

        $scope.navigateToAnnotationTool = function () {
          console.log('Selected Image is ', $scope.selectedImage);
          if($scope.selectedImage) {
              $window.location.href = '/tools/annotationTool/' + $scope.selectedImage.idString;
          }
        };

        function rowClickCallback(nRow, aData, iDisplayIndex, iDisplayIndexFull) {
            $('td', nRow).unbind('click');
            $('td', nRow).bind('click', function () {
                $scope.$apply(function () {
                    handleImageClick(aData);
                });
            });
            return nRow;
        }

        function handleImageClick(imageObject) {
            var data = {},
                headers = {'Content-Type': 'application/json'};

            console.log(imageObject);

            $scope.selectedImage = imageObject;

            data.image_id = parseInt(imageObject.idString);

            serverUtilities.uploadDataToServer('/tools/getScaledImageAnnotations', 'POST', data, headers, showPopupWithImage, showPopupWithImage);

        }

        function showPopupWithImage(response) {
            console.log(response.data);
            $timeout(function () {

                var canvas = document.getElementById('canvas'),
                    ctx,
                    polys = response.data || [],
                    Annotations = [[0.9, 0.9]],
                    imageElement;

                /* Trigger Click to Open Modal */
                $('#imageDetailModalButton').click();

                $timeout(function () {

                    imageElement = new Image();

                    imageElement.onload = function () {

                        console.log('Image Loaded into Element');

                        var hRatio = canvas.width / imageElement.width,
                            vRatio = canvas.height / imageElement.height,
                            ratio = Math.min(hRatio, vRatio),
                            vertex,
                            k,
                            j,
                            x,
                            y,
                            imWid,
                            imHei,
                            origin,
                            zoom;

                        canvas.height = $scope.selectedImage.height * ratio;

                        if (canvas.getContext) {

                            ctx = canvas.getContext('2d');

                            ctx.imageSmoothingEnabled = false;

                            ctx.drawImage(imageElement, 0, 0, imageElement.width, imageElement.height, 0, 0, imageElement.width, imageElement.height);

                            x = Annotations[0][0];
                            y = Annotations[0][1];
                            imWid = canvas.width;
                            imHei = canvas.height;
                            origin = {x: 0, y: 0};
                            zoom = 1;

                            for (k = 0; k < polys.length; k++) {
                                ctx.beginPath();
                                vertex = polys[k];
                                ctx.moveTo((vertex[0] * imWid - origin['x']) * zoom, (vertex[1] * imHei - origin['y']) * zoom);
                                for (j = 2; j < vertex.length; j += 2) {
                                    ctx.lineTo((vertex[j] * imWid - origin['x']) * zoom, (vertex[j + 1] * imHei - origin['y']) * zoom);
                                }
                                ctx.closePath();
                                ctx.fillStyle = 'rgba(0,0,255, 0.5)';
                                ctx.stroke();
                                ctx.fill();
                            }
                        }
                    };
                    imageElement.src = $scope.selectedImage.server_image_url;
                }, 300);
            }, 100);
        }
    });