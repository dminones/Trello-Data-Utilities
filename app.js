angular.module('demo', [
  'ng',
  'trello-api-client',
  'satellizer'
])

.config(function(TrelloClientProvider){
  TrelloClientProvider.init({
    key: '5443c286e5a91dca5a9b6541eb0c71f2',
    appName: 'Trello Utilities App',
    tokenExpiration: 'never',
    scope: ['read', 'write', 'account'],
  });
})

.controller('demoCtrl', function($scope, TrelloClient){
  $scope.popupOptions = {
    type: 'popup'
  }
  $scope.authenticate = TrelloClient.authenticate

  $scope.organizations = {};
  $scope.searching = false;

  var doneOrganization = function(organization) {
    organization.done = true;
    console.log("done", organization);
  };

  var doneGettingData = function() {
    console.log($scope.organizations);
    $scope.searching = false;
  };

  var getAllBoardsData = function (){
    async.forEachOfSeries(  
    $scope.organizations, 
      function(organization,key,callback){
        async.forEachOfLimit(organization.boards, 5, function(board, index, callback) {
          console.log("intento con board ",board.name);

          async.waterfall([
            function(callback){
              async.retry({ times: 20, interval: 5000 }, function(retryCallback,results){
                TrelloClient.get('/boards/'+board.id+'/lists').then(function(result){
                  board.lists = {};
                  result.data.forEach(function(list){
                    board.lists[list.id] = list;
                    if(list.name == "Lista Comercial") {
                      board.listaComercialId = list.id;
                    }
                    if(list.name == "Lista Comercial Done") {
                      board.listaComercialDoneId = list.id;
                    }
                  });
                  retryCallback(null,result.data);
                }).catch(function(error){
                  retryCallback(error);
                });
              }, function(err, result) {
                  if(err) console.error(err);
                  callback(err);
              });
            },
            function(callback){
              async.retry({ times: 20, interval: 5000 }, function(retryCallback,results){
                TrelloClient.get('/boards/'+board.id+'/checklists').then(function(result){
                  board.checklists = {};
                  result.data.forEach(function(checklist){
                    board.checklists[checklist.id] = checklist;
                  });
                  retryCallback(null,result.data);
                }).catch(function(error){
                  retryCallback(error);
                });
              }, function(err, result) {
                  if(err) console.error(err);
                  callback(err);
              });
            }, 
            function(callback){
              //console.log(board);
              // try calling apiMethod 3 times, waiting 200 ms between each retry
              async.retry( { times: 20, interval: 5000 },
                function(retryCallback,results){
                  TrelloClient.get('/boards/'+board.id+'/cards/open').then(function(result){
                    board.cards = result.data;
                    board.cardsUrlsWithParent = [];
                    result.data.forEach(function(card){
                      //board.cards[card.url] = card;
                      card.idChecklists.forEach(function(id){
                        var checklist = board.checklists[id];
                        if(checklist.name == "Children"){
                          console.log(card.name, " tiene hijos");
                          checklist.checkItems.forEach(function(hijo){
                            board.cardsUrlsWithParent.push(hijo.name);
                          });
                        }
                      });
                    });
                    retryCallback(null,result.data);
                  }).catch(function(error){
                    retryCallback(error);
                  });
                }, function(err, result) {
                    if(err) {
                      console.error(err);
                    } else {
                      board.cardsMissingParent = [];
                      board.cards.forEach(function(card){
                        if((board.cardsUrlsWithParent.indexOf(card.url) == -1) &&
                           card.idList != board.listaComercialId &&
                           card.idList != board.listaComercialDoneId ){
                          board.cardsMissingParent.push(card);
                        }
                      });
                    }
                    callback(err);
                }); 
          }], function (err, result) {
            console.log("termine con board ",board);
              callback(err);
          });
        },
        function(err){
          callback(err);
          doneOrganization(organization);
        });
    }, function(err){
      doneGettingData();
    } );
  }

  $scope.getBoards = function(){
    console.log($scope.member);
    $scope.searching = true;
    async.each($scope.member.idOrganizations, function (id, callback) {
        $scope.organizations[id] = {
          profile : {},
          boards: [],
          done: false
        };

        async.waterfall([
          function(callback) {
            TrelloClient.get('/organizations/'+id+'').then(function(result){
              $scope.organizations[id].profile = result.data;
              callback(null);
            }).catch(function(error){
              callback(error);
            });
          },
          function(callback) {
              TrelloClient.get('/organizations/'+id+'/boards/all').then(function(result){
                $scope.organizations[id].boards = result.data;
            callback(null);
          }).catch(function(error){
            callback(error);
          });
          }
      ], function (err, result) {
        if (err) {
          console.error(err.message); 
        }
        callback();
      });
      
    }, function (err) {
        if (err) console.error(err.message);

        getAllBoardsData();
    });

  }

  
  $scope.setCurrentBoard = function(board) {
    console.log(board);
    $scope.currentBoard = board;
  }

  $scope.init = function(){
    TrelloClient.get('/members/me').then(function(result){
      $scope.member = result.data;
      console.log($scope.member);
    }).catch(function(error){
      console.log(error);
      $scope.authenticate();
    });
  };
  $scope.init();
});
