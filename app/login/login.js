angular.module( 'trelloUtilities.login', [
  'ui.router',
  'ng'
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

.controller( 'LoginCtrl', function LoginCtrl( $scope ) {
  
})

;
