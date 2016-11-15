angular.module('trelloUtilities', [
  'trelloUtilities.login',
  'trelloUtilities.projects', 
  'trelloUtilities.about',
  'trelloUtilities.parentCheck',
  'ui.router',
  'ng',
  'trello-api-client',
  'satellizer',
])

.filter('percentage', ['$filter', function ($filter) {
  return function (input, decimals) {
    return $filter('number')(input * 100, decimals) + '%';
  };
}])

.config( function myAppConfig ( $stateProvider, $urlRouterProvider ) {
  $urlRouterProvider.otherwise( '/projects' );
})

.config(function(TrelloClientProvider){
  TrelloClientProvider.init({
    key: '5443c286e5a91dca5a9b6541eb0c71f2',
    appName: 'Trello Utilities App',
    tokenExpiration: 'never',
    scope: ['read', 'write', 'account'],
  });
})

.controller( 'AppCtrl', function AppCtrl ( $rootScope, $scope, $location, TrelloClient,  $state ) {
  $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
    console.log("entro aca");
    if ( angular.isDefined( toState.data.pageTitle ) ) {
      $scope.pageTitle = toState.data.pageTitle ;
    }
  });  

  $scope.authenticate = TrelloClient.authenticate;

  $scope.init = function(){
    TrelloClient.get('/members/me').then(function(result){
      $scope.member = result.data;
      $rootScope.$broadcast("memberLoaded");
    }).catch(function(error){
      console.log(error);
      $state.go('login');
    });
  };
  $scope.init();
})
