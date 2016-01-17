angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, $rootScope) {
  setInterval(function(){
    $.getJSON($rootScope.url, function(data) {
      console.log(data);

      $scope.realAngle = data.angle;
      $scope.position = data.position;
      $scope.angle1 = data.angle1;
      $scope.angle2 = data.angle2;


      $scope.$apply();
    });
  }, 500);
})


.controller('AccountCtrl', function($scope, $rootScope) {

});
