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
    data:{ pageTitle: 'Arbol de trazabilidad' }
  });
})

.controller( 'ParentCheckCtrl', function ParentCheckCtrl( $rootScope, $scope, TrelloModel){

  $scope.filter = {};
  $scope.propertyName = 'projectId';
  $scope.reverse = false;

  $scope.popupOptions = {
    type: 'popup'
  }

  $rootScope.$on("memberLoaded", function (args) {
    $scope.getBoards();
  });

   var getAllBoardsData = function (){
    $scope.organizations = TrelloModel.organizations;
    TrelloModel.getAllBoardsData(doneOrganization,doneGettingData);
  }

  $scope.getBoards = function(){
    if($scope.searching)
          return;

    $scope.searching = true;
    TrelloModel.setMember($rootScope.member);
    TrelloModel.getBoards(getAllBoardsData);
  }

  var doneOrganization = function(organization) {
    organization.done = true;
  };

  var doneGettingData = function() {
    $scope.searching = false;
  };

  $scope.setCurrentBoard = function(board) {
    $scope.currentBoard = board;
  }

  $scope.init = function() {
    if($rootScope.member){
      $scope.getBoards();
    }
  }
  
  $scope.sortBy = function(propertyName) {
    $scope.reverse = ($scope.propertyName === propertyName) ? !$scope.reverse : false;
    $scope.propertyName = propertyName;
  };

  $scope.init();

})

;