var myApp = angular.module('myApp', []);

myApp.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);

myApp.service('fileUpload', ['$http', function ($http) {
    this.uploadFileToUrl = function(file, uploadUrl, $scope){
        var fd = new FormData();
        fd.append('image', file);
        fd.append('imageContent', $scope.image);
        console.log($scope.image);
        var request = {
            method: 'POST',
            url: uploadUrl,
            data: {"image" :$scope.image}
        };

        $http(request)
            .then(function (result) {
                //$scope.user = result;
                $scope.showProgress = false;
                console.log(JSON.stringify(result));
            }, function(result) {
                //some error
                $scope.showProgress = false;
                console.log("error" + result);
            });
    }
}]);

myApp.controller('myCtrl', ['$scope', 'fileUpload', function($scope, fileUpload){
    $scope.imagePresent = false;
    $scope.uploadFile = function(){
        var file = $scope.myFile;
        var reader = new FileReader();
        reader.onload = $scope.imageIsLoaded;
        $scope.showProgress = true;
        reader.readAsDataURL(file);
        console.log('file is ' );
        console.dir(file);

    };

    $scope.imageIsLoaded = function(e){
        $scope.$apply(function() {
            console.log("calling you");
            $scope.image = e.target.result;
            $scope.imagePresent = true;
            var uploadUrl = "/images/fileUpload";
            fileUpload.uploadFileToUrl($scope.myFile, uploadUrl, $scope);
        });
    };
}]);