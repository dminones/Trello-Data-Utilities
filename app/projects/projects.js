angular.module( 'trelloUtilities.projects', [
  'ui.router',
  'ng',
  'trelloUtilities.trelloModel'
])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'projects', {
    url: '/projects',
    views: {
      "main": {
        controller: 'ProjectsCtrl',
        templateUrl: 'app/projects/projects.tpl.html'
      }
    },
    data:{ pageTitle: 'Projects' }
  });
})

.controller( 'ProjectsCtrl', function ProjectsCtrl( $rootScope, $scope, TrelloModel, $state){
  $scope.popupOptions = {
    type: 'popup'
  }
  $scope.filter = {};
  $scope.organizations = {};
  $scope.searching = false;

  $scope.propertyName = 'projectId';
  $scope.reverse = false;

  var doneOrganization = function(organization) {
    organization.done = true;
  };

  var doneGettingData = function() {
    $scope.searching = false;
  };

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

  $scope.setCurrentBoard = function(board) {
    $scope.currentBoard = board;
  }

  $rootScope.$on("memberLoaded", function (args) {
    $scope.getBoards();
  });

  $scope.init = function() {
    if($rootScope.member){
      $scope.getBoards();
    }
  };

  $scope.sortBy = function(propertyName) {
    $scope.reverse = ($scope.propertyName === propertyName) ? !$scope.reverse : false;
    $scope.propertyName = propertyName;
  };

  $scope.init();
})

;
