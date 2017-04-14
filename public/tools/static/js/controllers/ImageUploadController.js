angular.module('ImageUploadController', [])
    .controller("ImageUploadController", function ($scope, serverUtilities) {

        $scope.imageUpload = {};

        $scope.uploadFileToUrl = function () {
            var imageFile = document.getElementById('imagefilepath').files[0],
                reader = new FileReader(),
                data = {},
                headers = {'Content-Type': 'application/json'};

            data.imagetags = $scope.imageUpload.imagetags;

            reader.onloadend = function (e) {
                data.image = e.target.result;
                serverUtilities.uploadDataToServer('uploadImage', 'POST', data, headers, uploadHandler, uploadHandler);
            };

            reader.readAsDataURL(imageFile);

            function uploadHandler(response) {
                console.log(response);
            }
        };

    });
