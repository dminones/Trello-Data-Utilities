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
  $urlRouterProvider.otherwise( '/about' );
})

.config(function(TrelloClientProvider){
  TrelloClientProvider.init({
    key: '5443c286e5a91dca5a9b6541eb0c71f2',
    appName: 'Trello Utilities App',
    tokenExpiration: '1hour',
    scope: ['read', 'write', 'account'],
    returnUrl: window.location
  });
})

.controller( 'AppCtrl', function AppCtrl ( $rootScope, $scope, $location, TrelloClient,  $state ) {
  $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
    if ( angular.isDefined( toState.data.pageTitle ) ) {
      $scope.pageTitle = toState.data.pageTitle ;
    }
  });  

  $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState) {
    if (!$rootScope.member && (toState.name != 'login')) {
      event.preventDefault();
      $state.go('login',{returnUrl: toState.name});
    }
  });

  $rootScope.getMember = function(callback) {
    TrelloClient.get('/members/me').then(function(result){
      $rootScope.$broadcast("memberLoaded");
      $rootScope.member = result.data;
      callback($rootScope.member);
    }).catch(function(error){
      console.log(error);
      callback(null);
    });
  };

  $scope.init = function(){
    $rootScope.getMember(function(member) {
      if(!member) {
        $state.go('login',{returnUrl: "/login"});
      }
    });
  };
  $scope.init();
})
