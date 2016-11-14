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

  $scope.popupOptions = {
    type: 'popup'
  }

  $rootScope.$on("memberLoaded", function (args) {
    $scope.getBoards();
  });

   var getAllBoardsData = function (){
    console.log(TrelloModel.organizations);
    $scope.organizations = TrelloModel.organizations;
    TrelloModel.getAllBoardsData(doneOrganization,doneGettingData);
  }

  $scope.getBoards = function(){
    if($scope.searching)
          return;

    $scope.searching = true;
    TrelloModel.setMember($scope.member);
    TrelloModel.getBoards(getAllBoardsData);
  }

  var doneOrganization = function(organization) {
    organization.done = true;
    console.log("done", organization);
  };

  var doneGettingData = function() {
    console.log($scope.organizations);
    $scope.searching = false;
  };

  $scope.setCurrentBoard = function(board) {
    console.log("currentBoar",board);
    $scope.currentBoard = board;
  }

  $scope.init = function() {
    if($scope.member){
      $scope.getBoards();
    }
  }
  $scope.init();

})

;