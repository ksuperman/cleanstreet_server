angular.module('HeaderController', [])
    .controller("HeaderController", function ($scope, serverUtilities) {

        $('#imageUploadModal').modal();
        $(".button-collapse").sideNav();

        $scope.createTrainingFile = function () {
            var data = {},
                headers = {'Content-Type': 'application/json'};

            Materialize.toast('Your Request for Training Data JSON has been Received by the Server, You\'ll be notified when the Data is Generated in the Server.', 8000, '', function () {});

            serverUtilities.uploadDataToServer('/tools/getTrainingJSONFile', 'POST', data, headers, handledJSONFIleGenerationResponse, handledJSONFIleGenerationResponse);

        };
    });
