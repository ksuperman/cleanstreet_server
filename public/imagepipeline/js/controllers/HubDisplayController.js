angular.module('HubDisplayController', [])
    .controller("HubDisplayController", function ($scope, serverUtilities) {

        $scope.pipelineImage = [];

        function handlePipelineImageResponse(response) {
            $scope.pipelineImage = $scope.pipelineImage.concat(response.data);
            console.log("Pipeline Images Fetched == > ", $scope.pipelineImage);
        }

        function initHubPage() {
            var data = {},
                headers = {'Content-Type': 'application/json'};

            serverUtilities.uploadDataToServer('/imagepipeline/getPipelineImages', 'POST', data, headers, handlePipelineImageResponse, handlePipelineImageResponse);
        }

        initHubPage();

    });
