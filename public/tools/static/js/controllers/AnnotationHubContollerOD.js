angular.module('AnnotationHubController', ['HeaderController', 'PendingImagesController', 'ReviewedImagesController', 'ImageUploadController'])
    .controller("AnnotationHubController", function ($scope) {
        $scope.products = ["Milk", "Bread", "Cheese"];
    });