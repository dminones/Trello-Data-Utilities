
angular.module( 'trelloUtilities.trelloModel', [
  'trello-api-client',
  'satellizer'
])

.factory('TrelloFactory', [ 
	function(){
		function List (list)  {
			return list;
		}

		function Card (card)  {
			return card;
		}

		function Board (board){
			board.setLists = function(lists) {
				board.lists = {};
	            lists.forEach(function(list){
		            board.lists[list.id] = List(list);
		            if(list.name == "Lista Comercial") {
		            	board.listaComercialId = list.id;
		            	board.listaComercial = list;
		            }
		            if(list.name == "Lista Comercial Done") {
		            	board.listaComercialDoneId = list.id;
		            	board.listaComercialDone = list;
		            }
		        });
			}

			board.setChecklists = function(checklists) {
				board.checklists = {};
          		checklists.forEach(function(checklist){
            		board.checklists[checklist.id] = checklist;
          		});
			}

			board.setCards = function(cards) {
				board._cardsUrlsWithParent = [];
				board.cards = [];
                cards.forEach(function(card){
                  board.cards.push(card);
                  card.idChecklists.forEach(function(id){
                    var checklist = board.checklists[id];
                    if(checklist.name == "Children"){
                      console.log(card.name, " tiene hijos");
                      checklist.checkItems.forEach(function(hijo){
                        board._cardsUrlsWithParent.push(hijo.name);
                      });
                    }
                  });
                });
			}

			board.boardLoaded = function() {
				board.cardsMissingParent = [];
	            board.cards.forEach(function(card){
		            if((board._cardsUrlsWithParent.indexOf(card.url) == -1) &&
		            	card.idList != board.listaComercialId &&
		                card.idList != board.listaComercialDoneId ){
		                board.cardsMissingParent.push(card);
		            }
	           	});
			}

			return board;
		}

		function Organization (){
			var profile = {};
			var done = false;
			var boards = [];
		
			function setBoards (theBoards) {
				theBoards.forEach(function(board){
					boards.push(Board(board));
				});
			}

			return {
		       	profile : profile,
		        boards: boards,
		        done: done,
		        setBoards: setBoards
			};
		}

		return {
			newOrganization: Organization,
			newBoard: Board,
			newList: List,
			newCard: Card
		};
	}
])

.factory('TrelloModel', [ 'TrelloClient', 'TrelloFactory',
	function(TrelloClient, TrelloFactory){
		var member = {};
		var organizations = {};
		var balance = {};

		function setMember(aMember){
			member = aMember;
		}

		function getBoards(callback) {
		    async.each(member.idOrganizations, function (id, callback) {
		        async.waterfall([
		          function(callback) {
		            TrelloClient.get('/organizations/'+id+'').then(function(result){
		              console.log(result.data.displayName);
		              if(result.data.displayName.indexOf("Projects") != -1) {
		                organizations[id] = TrelloFactory.newOrganization();
						organizations[id].profile = result.data;
		                callback(null);
		              } else {
		                callback({ message : "noProjectOrganization" });
		              }
		              
		            }).catch(function(error){
		              callback(error);
		            });
		          },
		          function(callback) {
		              TrelloClient.get('/organizations/'+id+'/boards/all').then(function(result){
		                organizations[id].setBoards(result.data);
		                callback(null);
		              }).catch(function(error){
		                callback(error);
		              });
		          }
		      ], function (err, result) {
		        if (err && (err.message != "noProjectOrganization") ) console.error(err.message);

		        callback();
		      });
		      
		    }, function (err) {
		        if (err) console.error(err.message);

		        callback();
		    });
		}

		function getAllBoardsData(doneOrganization, callback) {
			async.forEachOfSeries(  
		    	organizations, 
		      	function(organization,key,callback){
		        	async.forEachOfLimit(organization.boards, 5, function(board, index, callback) {
		          	async.waterfall([
			            function(callback){
			              async.retry({ times: 20, interval: 5000 }, function(retryCallback,results){
			                TrelloClient.get('/boards/'+board.id+'/lists').then(function(result){
			                  board.setLists(result.data);
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
			                  board.setChecklists(result.data);
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
			                    board.setCards(result.data);
			                    retryCallback(null,result.data);
			                  }).catch(function(error){
			                    retryCallback(error);
			                  });
			                }, function(err, result) {
			                    if(err) {
			                      console.error(err);
			                    } else {
			                      board.boardLoaded();
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
			      callback();
			    } );
			  }

		return {
			setMember: setMember,
			getBoards: getBoards,
			getAllBoardsData: getAllBoardsData,
			organizations: organizations,
			member: member
		};
	}
])

;