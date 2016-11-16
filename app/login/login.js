angular.module( 'trelloUtilities.login', [
  'ui.router',
  'ng',
  'trello-api-client',
  'satellizer',
])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'login', {
    url: '/login',
    views: {
      "main": {
        controller: 'LoginCtrl',
        templateUrl: 'app/login/login.tpl.html'
      }
    },
    data:{ pageTitle: 'Inicia sesion' }
  });
})

.controller( 'LoginCtrl', function LoginCtrl( $scope, TrelloClient, $rootScope, $state ) {
  

  $scope.authenticate = function(){
    TrelloClient.authenticate().then(function(){
      $rootScope.getMember(function(member){
        if(member) {
          $state.go('projects',{});
        }
      });
    });
  }

  $scope.init = function() {
    $rootScope.getMember(function(member){
      if(member) {
        $state.go('projects',{});
      }
    });
  }
  $scope.init();
})

;
