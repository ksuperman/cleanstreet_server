CleanStreetToolApplication = angular.module('CleanStreetToolApplication', ['AnnotationHubController']);
CleanStreetToolApplication.service('serverUtilities', ['$http', function ($http) {
    this.uploadDataToServer = function (url, method, data, headers, success, failure) {
        var request;

        if(url) {
            method = method || 'GET';
            data = data || {};
            headers = headers || {};
            success = success || function(){};
            failure = failure || function(){};
            request = {
                method: method,
                url: url,
                data: data,
                headers: headers
            };

            $http(request)
                .then(function (result) {
                    success(result);
                }, function (result) {
                    failure(result);
                });
        }
    }
}]);