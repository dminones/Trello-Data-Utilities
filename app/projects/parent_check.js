angular.module( 'trelloUtilities.parentCheck', [
  'ui.router',
  'ng',
  'trelloUtilities.trelloModel'
])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'parentcheck', {
    url: '/parentcheck',
    views: {
      "main": {
        controller: 'ParentCheckCtrl',
        templateUrl: 'app/projects/parent_check.tpl.html'
      }
    },
    data:{ pageTitle: 'ParentCheck' }
  });
})

.controller( 'ParentCheckCtrl', function ParentCheckCtrl( $rootScope, $scope, TrelloModel){
  $scope.popupOptions = {
    type: 'popup'
  }

  $rootScope.$on("memberLoaded", function (args) {
    $scope.getBoards();
  });

})

;