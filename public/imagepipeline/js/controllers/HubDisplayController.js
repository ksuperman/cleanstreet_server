angular.module('HubDisplayController', [])
    .controller("HubDisplayController", function ($scope, serverUtilities) {

        $scope.pipelineImage = [];

        function handlePipelineImageResponse(response) {
            if (response && response.data) {
                response.data = response.data.slice().reverse();
                $scope.pipelineImage = $scope.pipelineImage.concat(response.data);
            }
        }

        function initHubPage() {
            var data = {},
                headers = {'Content-Type': 'application/json'};

            serverUtilities.uploadDataToServer('/imagepipeline/getPipelineImages', 'POST', data, headers, handlePipelineImageResponse, handlePipelineImageResponse);
        }

        initHubPage();

    });
