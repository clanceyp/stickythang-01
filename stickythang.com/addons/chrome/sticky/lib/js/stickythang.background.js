
      // Called when the url of a tab changes.
      function checkForValidUrl(tabId, changeInfo, tab) {
        // If the letter 'g' is found in the tab's URL...
        if ( tab.url.indexOf('chrome://') == 0 ) {
          // don't show on chrome pages
        } else {
          chrome.pageAction.show(tabId);
		}
      };

      // Listen for any changes to the URL of any tab.
      chrome.tabs.onUpdated.addListener(checkForValidUrl);
	  chrome.tabs.onSelectionChanged.addListener(function( tabId,  selectInfo) {
			//chrome.tabs.getSelected(null, function(tab) {
			chrome.tabs.sendRequest(tabId, {
					action: "focus",
					stickiesActive:stickythang.getLocalStorage('stickiesActive'),
					online:stickythang.getLocalStorage('online'),
					notes:stickythang.db.listAll,
					urlSingleNote:stickythang.ops.urlSingleNote,
					debug:stickythang.getLocalStorage('debug','false'),
					shares:stickythang.shares // may be depricated, check!
				}, function(response) {
				console.log(response.message);
			});
			//});		  	
	  });
	  
	  
chrome.extension.onRequest.addListener(
  function(request, sender, sendResponse) {
    if (!stickythang.db.localdb){
		stickythang.db.init();
	}
	if (!stickythang.getupdates){
		stickythang.initGetUpdates();
	}
	switch (request.action){
		case "getList" : // get all stickies 
			// stickythang.db.getList(sendResponse);
			sendResponse({message:"depricated method, please check code"})
		break;
		case "getAll" : // get stickies length
			stickythang.db.count(sendResponse);
		break;
		case "getShares" : // depricated
			console.log('call to depricated method getShares')
			stickythang.db.getShares(sendResponse);
		break;
		case "remove" : // delete a sticky
			stickythang.db.remove(request.id,sendResponse);
		break;
		case "disable" : // disable a sticky
			stickythang.db.disable(request.id,sendResponse);
		break;
		case "save" : // update a sticky
			stickythang.db.save(request.ops,sendResponse);
		break;
		case "saveNew" : // save a new sticky
			stickythang.db.saveNew(request.ops,sendResponse);
		break;
		case "newPost" : // make a sticky public 
			stickythang.newPost(request.ops,sendResponse);
		break;
		case "updateUser" : // depricated 
			//stickythang.updateUser(request.user)
			sendResponse({message:"depricated method, please check code"})
		break;
		case "loginUser" : // login to stickythang
			stickythang.loginUser(request.ops,sendResponse);
		break;
		case "checkLoggedInUser" : // is user logged in
			//sendResponse({"message":"its the message"})
			stickythang.checkLoggedInUser(request.ops,sendResponse);
		break;
	}

});	  

window.stickythang = {
	user:'',bespokeCSS:"",shares:[],
	ops:{
		uriUserName:"http://www.stickythang.com/login",
		uriLogin:"http://www.stickythang.com/login",
		uriNewPost:"http://www.stickythang.com/notes/add.php",
		urlListNots:"http://www.stickythang.com/notes/list.php",
		urlSingleNote:"http://www.stickythang.com/notes/one.php"
	},
	getLocalStorage:function(key,def){
		return localStorage[key] || def || ''
	},
	setLocalStorage:function(key,val){
		localStorage[key] = val || localStorage[key] || '';
		return val;
	},
	updateUser:function(user){
		localStorage["user"] = user;
		stickythang.user = user;
	},
	isBuddy:function(buddy){
		var buddies = stickythang.db.listBuddies;
		for (var i = buddies.length;i>0;i--){
			if (buddies[i-1] == buddy){
				return true;
			}
		}
		return false;
	},
	getBuddyList:function(){
		stickythang.db.getBuddies();
		var buddies = stickythang.db.listBuddies;
		return buddies.join(",") ;
	},
	getPublicStickies:function(buddy){
		console.log("checking public stickies")
		var uri = stickythang.ops.urlListNots,
			Y = stickythang.Y,
			buddies = stickythang.getBuddyList(),
			formObject = Y.one("#getList"),
				cfg = {
				method: 'POST',
				form: {
					id : formObject
				},
				on: {
					complete:function(id,request){
						// console.log("request.responseText: "+ request.responseText);
						if ( !request.responseText.trim() ){
							return;
						}
						var obj = Y.JSON.parse(request.responseText),
							ids = window.ids;
						/*console.log("ids:"+ ids.length);
						console.log("obj:"+ obj.notes.length);
						console.log("sql:"+ obj.sql);*/
						for (var i = 0; i < obj.notes.length ; i++){
							var note = obj.notes[i],
								id = note.id, 
								x=false;
							// console.log("id element "+ id)
							for (var ii = 0; ii < ids.length; ii++){
								if (ids[ii] == id){
									x = true;
									break;
								}
							}
							if (x){
								//console.log("id exsists in db for element "+ id)
								continue;
							}
							//console.log(note.ops);
							//continue;
							ids.push(note.id);
							note.ops = Y.JSON.parse(note.ops);
							stickythang.db.saveNew({
								id:note.id, 
								domain:note.ops.domain, 
								html:note.note, 
								json:note.ops.json, 
								path:note.ops.path, 
								querystring:note.ops.querystring, 
								scope:"path", 
								timestamp:(new Date().getTime()), 
								href:note.ops.href,
								urlex:note.id, 
								user:note.author
							},null);
						}
						
					}
				}
			};
		if (buddy){
			console.log("getting;" + buddy)
			Y.one("#inputAuthors").set("value", buddy);
			Y.one("#inputOffset").set("value", stickythang.getLocalStorage("inputOffset","0"));
			Y.one("#inputFrom").set("value", "1275427064000");
			Y.io(uri, cfg);
		} else if (buddies) {
			stickythang.db.getIds();
			console.log("getting;" + buddies)
			Y.one("#inputAuthors").set("value", buddies);
			Y.one("#inputOffset").set("value", stickythang.getLocalStorage("inputOffset","0"));
			Y.one("#inputFrom").set("value", stickythang.getLocalStorage("lastUpdated","1275427064000"));
			stickythang.setLocalStorage("lastUpdated", new Date().getTime() );
			Y.io(uri, cfg);
		} else {
			console.log("not checking for updates")
		}
	},
	loginUser:function(ops,sendResponse){
		window.stickythang.login(ops,sendResponse);
	}
}	
window.ids = []; 

YUI().use("io","json", function(Y) {
	
	window.stickythang.Y = Y;
	
	function onFailure(transactionid, response, arguments) {
		stickythang.setLocalStorage('online','false');
		console.log("connection problem:"+ response.status)
		//console.log('not good:'+ response.responseText +','+response.statusText+','+response.status)
	}
	// Subscribe to "io.failure".
	Y.on('io:failure', onFailure, Y, 'Transaction Failed');
	
	function onSuccess(transactionid, response, arguments) {
		stickythang.setLocalStorage('online','true');
		//console.log('good:'+ response.responseText)
	}	
	Y.on('io:success', onSuccess, Y, true);		
		
	window.stickythang.login = function(ops,sendResponse){
		var sync = (sendResponse) ? false : true;
		if (!ops || !ops.user || !ops.pass){
			var user = stickythang.getLoggedInUser();
			if (user){
				return {responseText:'Logged in, user name '+ user, st:'true'}
			}else{
				return {responseText:'Not logged in and user name and/or password not set',st:'true'}
			}
		} else {
			stickythang.setLocalStorage('user',ops.user)
		}
			
		// Subscribe to "io.success".
		Y.one("#loginFormUsername").set('value',ops.user);
		Y.one("#loginFormPassword").set('value',ops.pass);
		var uri = stickythang.ops.uriLogin,
			formObject = Y.one("#loginForm"),
	    	cfg = {
	        method: 'POST',
			sync: sync,
	        form: {
				id : formObject
	        }
	    };
		if (!sync) {
			cfg.on = {
				complete:function(id,request){
					var i = request.responseText.indexOf("user"),obj,user = 'me';
					if (i > 0 && i < 5 ){
						obj = Y.JSON.parse(request.responseText);	
					}
					if (obj && obj.user){
						user = obj.user
						window.stickythang.setLocalStorage('user',user);
					}
					sendResponse({'message':'from login','user':user,'ops':ops,'online':stickythang.getLocalStorage('online')});
				}
			}
			Y.io(uri, cfg);
		} else {
			return Y.io(uri, cfg);
		}
	}
	window.stickythang.newPost = function(ops,sendResponse){
		
		try {
			var uri = stickythang.ops.uriNewPost,
				user = stickythang.getLoggedInUser(),
		    	cfg = {
			        method: 'POST',
					sync: false,
			        form: {
						id:Y.one("#newPost")
			        },
					on: {
						complete:function(id,request){
							// TODO; handle errors
							sendResponse({message:"request to save note recived by stickythang.com",'online':stickythang.getLocalStorage('online')});
						}
					}
			    };
				if (user && user != 'me' && ops.message && ops.subject){
					Y.one("#postAuthor").set('value', user);	
					Y.one("#postOps").set('value',ops.message);	
					Y.one("#postNote").set('value',ops.subject);
					//console.log('Trying to submit note; user:'+ user +', "'+ ops.message + '", subject:'+ ops.subject);
					request = Y.io(uri,cfg);
				} else {
					//console.log('Could not submit note; user:'+ user +', "'+ ops.message + '", subject:'+ ops.subject);
					sendResponse({message:"Could not save sticky",error:"user not logged in, or content error"});
				}
					
					
				
				
				
				
			
		}catch(e){
			sendResponse({message:e.message+": couldn't save note :( user may not be logged in."});
		}
	}
	window.stickythang.getLoggedInUser = function(){// sync get the logged in user name
		var user = '',
			uri = stickythang.ops.uriUserName,
	    	cfg = {sync:true},
	        request,
			obj;
	   
	    request = Y.io(uri, cfg);
		try {
			var i = request.responseText.indexOf("user");
			if (i > 0 && i < 5 ){
				obj = Y.JSON.parse(request.responseText);	
			}
			if (obj && obj.user){
				user = obj.user
				window.stickythang.setLocalStorage('user',user);
			}
		}catch(e){user="Error getting user info:"+e.message}
		
		return user;
	}
	window.stickythang.checkLoggedInUser = function(ops,sendResponse){// lazy get the logged in user name
		var uri = stickythang.ops.uriUserName,
			request,
			obj,
			cfg = {on:{complete:function(id,request){
				//console.log('got user name:'+ request.responseText);
				var i = request.responseText.indexOf("user"),
					obj,
					user;
				if (i > 0 && i < 5 ){
					try {
						obj = Y.JSON.parse(request.responseText);
					} 
					catch (e) {
						console.log('not logged in, or error:' + e.message);
					}finally {
						console.log('user:'+user)
					}
				}else{
					console.log( 'not logged in' );
					user = "me";
				}
				if (obj && obj.user){
					window.stickythang.setLocalStorage('user',obj.user);
					user = obj.user;
					console.log("obj and obj.user :"+ user);
				} else {
					console.log("undefined issue");
				}
				if (sendResponse){
					ops.user = user;
					ops.message = "response from server";
					ops.online = stickythang.getLocalStorage('online');
					sendResponse(ops)
				}
			}}};
	    Y.io(uri, cfg);
		
	}
	

})
stickythang.stickiesActive = function(state){
	localStorage.stickiesActive = state;
	console.log("stickiesActive:"+state)
	chrome.tabs.getSelected(null, function(tab) {
	  chrome.tabs.sendRequest(tab.id, {action: "css", stickiesActive: state ,tabid: tab.id}, function(response) {
		console.log(response.message);
	  });
	});
}
stickythang.initGetUpdates = function(){
	var updateInterval = parseInt(stickythang.getLocalStorage('updateInterval',30),10) * 60000;
	
	stickythang.getPublicStickies();
	stickythang.getupdates = setInterval(function(){
		window.stickythang.getPublicStickies();
	},updateInterval);		
	
}
stickythang.db = {
		localdb:null,
		version:"1.0",
		tableName:"stickies",
		listAll:[],
		listBuddies:[],
		
		init: function(){

			stickythang.db.localdb = openDatabase("StickyThang-background", "", "StickyThangs!", 200000);
			console.log("open db version:"+stickythang.db.localdb.version)
			stickythang.db.open();
				
		},
		getList:function(sendResponse){
			console.log('Loading list');
		    stickythang.db.localdb.transaction(function(tx) {
		        tx.executeSql("SELECT id, note, url, timestamp FROM "+ stickythang.db.tableName + " WHERE state=?", [1], function(tx, result) {
		        	console.log("returing notes list :"+ result.rows.length);
					var list = [];
					for (var i = 0; i < result.rows.length; ++i) {
						list.push({note:result.rows.item(i).note,url:result.rows.item(i).url});
					}
					sendResponse({results:list,stickiesActive:stickythang.getLocalStorage('stickiesActive'),user:stickythang.getLocalStorage('user')})			
		        }, function(tx, error) {
		            console.log('Failed to retrieve notes from database - ' + error.message);
					sendResponse({results:[]});
		        });
		    });					
		},
		getAll:function(sendResponse){
			console.log('Loading stickies from getAll');
		    stickythang.db.localdb.transaction(function(tx) {
		        tx.executeSql("SELECT * FROM "+ stickythang.db.tableName +" WHERE state=?", [1], function(tx, result) {
		        	console.log("loading stikies :"+ result.rows.length);
					var list = [];
					for (var i = 0; i < result.rows.length; ++i) {
						list.push({
							id:result.rows.item(i).id
							,domain:result.rows.item(i).domain
							,note:result.rows.item(i).note
							,ops:result.rows.item(i).ops
							,path:result.rows.item(i).path
							,scope:result.rows.item(i).scope
							,timestamp:result.rows.item(i).timestamp
							,urlex:result.rows.item(i).urlex
							,user:result.rows.item(i).user
						});
						stickythang.db.listAll = list;
					}
					if (sendResponse) {
						sendResponse({
							list: stickythang.db.listAll,
							stickiesActive: stickythang.getLocalStorage('stickiesActive'),
							urlSingleNote: stickythang.ops.urlSingleNote,
							// user: stickythang.getLocalStorage('user','me'),
							shares: stickythang.shares,
							message: 'success'
						})
					}
									
		        }, function(tx, error) {
					if (sendResponse)
			            sendResponse({message:error.massage,list:[]})
		            return;
		        });
		    });					
		},
		get:function(sendResponse){
			console.log('Loading stickies');
		    stickythang.db.localdb.transaction(function(tx) {
		        tx.executeSql("SELECT * FROM "+ stickythang.db.tableName +" WHERE state=?", [1] , function(tx, result) {
		        	console.log("loading stickies :"+ result.rows.length);
					var list = [];
					for (var i = 0; i < result.rows.length; ++i) {
						list.push({
							id:result.rows.item(i).id
							,domain:result.rows.item(i).domain
							,note:result.rows.item(i).note
							,ops:result.rows.item(i).ops
							,path:result.rows.item(i).path
							,scope:result.rows.item(i).scope
							,timestamp:result.rows.item(i).timestamp
							,url:result.rows.item(i).url
							,urlex:result.rows.item(i).urlex
							,user:result.rows.item(i).user
						});
						stickythang.db.listAll = list;
					}
					sendResponse({list:list,stickiesActive:stickythang.getLocalStorage('stickiesActive'),user:stickythang.getLocalStorage('user'),message:'success'})					
		        }, function(tx, error) {
		            sendResponse({message:error.massage,list:[]})
		        });
		    });					
		},
		getBuddies:function(sendResponse){
			console.log('getting buddies')
		    stickythang.db.localdb.transaction(function(tx) {
		        tx.executeSql("SELECT buddy FROM "+ stickythang.db.tableName +"_buddies order by buddy", [], function(tx, result) {
		        	console.log("returing buddies list :"+ result.rows.length);
					stickythang.db.listBuddies = [];
					for (var i = 0; i < result.rows.length; ++i) {
						stickythang.db.listBuddies.push(result.rows.item(i).buddy);
					}	
					if (sendResponse){
						sendResponse({message:"buddies list updated"})
					} else {
						return	stickythang.db.listBuddies;	
					}
					
		        }, function(tx, error) {
		            console.log('Failed to retrieve notes from database - ' + error.message);
					// sendResponse({results:[]});
		        });
		    });					
		},
		getIds:function(){
			console.log('getting ids')
		    stickythang.db.localdb.transaction(function(tx) {
		        //tx.executeSql("SELECT id, note, url, timestamp FROM "+ stickythang.db.tableName +" WHERE state=?", [1], function(tx, result) {
		        tx.executeSql("SELECT id FROM "+ stickythang.db.tableName +" WHERE state=?", [1], function(tx, result) {
		        	console.log("returing list :"+ result.rows.length);
					window.ids = [];
					for (var i = 0; i < result.rows.length; ++i) {
						window.ids.push(result.rows.item(i).id);
					}			
		        }, function(tx, error) {
		            console.log('Failed to retrieve notes from database - ' + error.message);
					sendResponse({results:[]});
		        });
		    });					
		},
		getShares:function(sendResponse){
			console.log('getShare; depricated method...')
			if (sendResponse)
			sendResponse({
				results:new array,
				message:'depricated method'
			});
			/*
		    stickythang.db.localdb.transaction(function(tx) {
		        tx.executeSql("SELECT id, label, url FROM "+ stickythang.db.tableName +"_share", [], function(tx, result) {
		        	console.log("returing list :"+ result.rows.length);
					window.stickythang.shares = [];
					for (var i = 0; i < result.rows.length; ++i) {
						window.stickythang.shares.push({
							id:result.rows.item(i).id,
							label:result.rows.item(i).label,
							url:result.rows.item(i).url
						});
					}		
					if (sendResponse){
						sendResponse({results:stickythang.shares});
					}	
		        }, function(tx, error) {
		            console.log('Failed to retrieve notes from database - ' + error.message);
					if (sendResponse){
						sendResponse({results:[]});
					}
					
		        });
		    });		
		    */		
		},
		count:function(sendResponse){
		    stickythang.db.localdb.transaction(function(tx) {
				tx.executeSql("DELETE FROM "+ stickythang.db.tableName + " WHERE note = ''", []);
		        tx.executeSql("SELECT COUNT(id) as count FROM "+ stickythang.db.tableName +" WHERE state=?", [1], function(tx,result) {
		        	// count exists loading stickies
					if (result && result.rows && result.rows.item(0) && result.rows.item(0).count) {
						console.log('count - loading sticky-notes')
						stickythang.db.getIds();
			            stickythang.db.getShares();
			            stickythang.db.getAll(sendResponse);
					}
					else {
						
					}
		        }, function(tx, error) {
		        //    tx.executeSql("CREATE TABLE "+ stickythang.db.tableName +" (id TEXT, note TEXT, timestamp REAL, left TEXT, top TEXT, pathway TEXT, page TEXT, scope TEXT, state TEXT, class TEXT)", [], function(result) { 
		                //stickythang.loadNotes(); 
						console.log('no count - no notes to load');
						if (sendResponse){
							sendResponse({message:'no notes found',list:[]})
						} else {
							return "no notes found"
						}
		        //    });
		        });
		    });				
		},
		disable:function(id,sendResponse){			
	        stickythang.db.localdb.transaction(function (trans){
	            trans.executeSql("UPDATE "+ stickythang.db.tableName +" SET state=? WHERE id = ?", 
					[0,id],
					function(){
						for (var i=0;i<stickythang.db.listAll.length;i++){
							if (stickythang.db.listAll[i].id == id){
								stickythang.db.listAll.splice(i,1);
								break;
							}
						}
						if (sendResponse){
							sendResponse({message:'disabled'})
						} else {
							
							chrome.tabs.getSelected(null, function(tab) {
							  chrome.tabs.sendRequest(tab.id, {action: "checkforchanges",notes:stickythang.db.listAll}, function(response) {
								console.log(response.message);
							  });
							});
						}
					},
					function(tx,error){
						sendResponse(error)
				});
	        });			
		},
		remove:function(id,sendResponse){			
	        stickythang.db.localdb.transaction(function (trans){
	            trans.executeSql("DELETE from "+ stickythang.db.tableName +" WHERE id = ?", 
					[id],
					function(){
						stickythang.db.getAll();
						if (sendResponse){
							sendResponse({message:'removed'})
						} else {
							chrome.tabs.getSelected(null, function(tab) {
							  chrome.tabs.sendRequest(tab.id, {action: "checkforchanges"}, function(response) {
								console.log(response.message);
							  });
							});
						}
						
					},
					function(tx,error){
						sendResponse(error)
				});
	        });			
		},
		removeBuddy:function(buddy,sendResponse){	
			if (!stickythang.isBuddy( buddy )){
				stickythang.db.getBuddies();
				sendResponse({message:'ignore removeBuddy as buddy not in DB'});
				return;
			}		
	        stickythang.db.localdb.transaction(function (trans){
	            trans.executeSql("DELETE from "+ stickythang.db.tableName +"_buddies WHERE buddy = ?", 
					[buddy],
					function(){
						stickythang.db.getBuddies(sendResponse);
					},
					function(tx,error){
						sendResponse(error)
				});
	        });
			stickythang.db.localdb.transaction(function (trans){
	            trans.executeSql("DELETE from "+ stickythang.db.tableName +" WHERE user = ?", 
					[buddy],
					function(){
						// ignore responce
					},
					function(tx,error){
						// ignore error
				});
	        });
		},
		save:function(note,sendResponse){			
	        stickythang.db.localdb.transaction(function (trans){
	            trans.executeSql("UPDATE "+ stickythang.db.tableName +" SET note = ?, ops = ?, scope = ?, timestamp = ? WHERE id = ?", 
					[note.html, note.json, note.scope, note.timestamp , note.id],
					function(){
						stickythang.db.getAll();
						sendResponse({message:'updated'})
					},
					function(tx,error){
						sendResponse(error)
				});
	        });			
		},
		share:function(note,sendResponse){			
			// presume we are logged in so post new message to wall
			var uri = "http://stickythang.com/lib/test.js",
				cfg = {
			        sync: true
			    };
			var request = Y.io(uri, cfg);	        			
		},
		saveNew:function(note,sendResponse){			
			console.log('trying to save a new note');
			if (!note.user){
				note.user = stickythang.user;
			}
	        stickythang.db.localdb.transaction(function (trans){
	            trans.executeSql("INSERT INTO "+ stickythang.db.tableName +" (id, domain, note, ops, path, querystring, scope, timestamp, url, user, urlex) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", 
					[note.id, note.domain, note.html, note.json, note.path, note.querystring, note.scope, note.timestamp, note.href , note.user, (note.urlex||"")],
					function(){
						stickythang.db.getAll();
						if (sendResponse)
							sendResponse({message:'inserted'})
					},
					function(tx,error){
						console.log(error.message)
						if (sendResponse)
							sendResponse(error)
				});
	        });			
		},
		saveNewBuddy:function(buddy,sendResponse){			
			console.log('trying to save a new buddy');
			if (stickythang.isBuddy( buddy ) || !buddy){
				sendResponse({message:'ignore saveNewBuddy as buddy already in DB, or empty'});
				return;
			}
	        stickythang.db.localdb.transaction(function (trans){
	            trans.executeSql("INSERT INTO "+ stickythang.db.tableName +"_buddies (id,label,buddy) VALUES (?, ?, ?)", 
					["","",buddy],
					function(){
						stickythang.db.getBuddies(sendResponse);
						stickythang.getPublicStickies(buddy);
					},
					function(tx,error){
						console.log(error.message)
						sendResponse(error)
				});
	        });			
		},
		saveNewIfNotExists:function(note){			
			//console.log('trying to save a new note from an external source, called by popup.html');
			if (!note.html || note.html == ''){
				//sendResponse({message:'!!!!note empty, not creating'})
			}
	        stickythang.db.localdb.transaction(function (trans){
	            trans.executeSql("SELECT COUNT(id) as count from "+ stickythang.db.tableName +" where id = ?", 
					[note.id],
					function(tx, result){

						if (result && result.rows && result.rows.item(0) && result.rows.item(0).count ){
							console.log(result.rows.item(0).count +' exists already: '+ note.id);
						}else{
							console.log('Note NOT exists, we need to add it: '+ note.id);
				            tx.executeSql("INSERT INTO "+ stickythang.db.tableName +" (id, domain, note, ops, path, querystring, scope, timestamp, url, user, urlex) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", 
								[note.id, note.domain, note.html, note.json, note.path, note.querystring, note.scope, note.timestamp, note.href , note.user, note.urlex],
								function(){
									stickythang.db.getAll();
									console.log("inserted new item")
									//sendResponse({message:'inserted new item'})
								},
								function(tx,error){
									console.log(error.message);
									//sendResponse(error);
							});							
						}
						/* / count exists so no need to do anything
						sendResponse({
							message: "record exists, ignore instert"
						})
						*/
					},
					function(tx,error){
						// no records returned so instert
						console.log('Adding note: '+ note.id);
			            tx.executeSql("INSERT INTO "+ stickythang.db.tableName +" (id, domain, note, ops, path, querystring, scope, timestamp, url, user, urlex) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", 
							[note.id, note.domain, note.html, note.json, note.path, note.querystring, note.scope, note.timestamp, note.href , note.user, note.urlex],
							function(){
								stickythang.db.getAll();
								console.log("inserted new item")
								//sendResponse({message:'inserted new item'})
							},
							function(tx,error){
								console.log(error.message)
								//sendResponse(error);
						});
				});
	        });			
		},
		updateShare:function(){
			//var dataverson = stickythang.getLocalStorage('dataversion');
			var Y = stickythang.Y;
			console.log("updating share depricated!!!!")
			return;
			/*
			var uri = "http://stickythang.com/lib/test.js",
				cfg = {
			        sync: true
			    };
			var request = Y.io(uri, cfg);
			var shareRS = Y.JSON.parse(request.responseText);
			console.log("updating share...")
			stickythang.db.localdb.transaction(function (trans){
				trans.executeSql("delete from "+ stickythang.db.tableName +"_share",[],
					function(){},
					function(tx,error){
						console.log(error.message)
					});
				for (name in shareRS){
					rs = shareRS[name];
		            trans.executeSql("INSERT INTO "+ stickythang.db.tableName +"_share (id, label, url) VALUES (?, ?, ?)",[rs.id, rs.label, rs.url],
					function(){},
					function(tx,error){
						console.log(error.message)
					});
				};
				stickythang.db.getShares();// update the list
			});
			*/
		},
		open: function(){
			// open db assume it's the first time
			stickythang.db.localdb.transaction(function(trans){
				console.log("db.open.trans connection open")
				trans.executeSql('CREATE TABLE IF NOT EXISTS '+ stickythang.db.tableName +' '+
					'	(id TEXT, '+
					'	state INTEGER DEFAULT 1, '+
					'	domain TEXT, '+
					'	note TEXT, '+
					'	ops TEXT, '+
					'	path TEXT, '+
					'	querystring TEXT, '+
					'	scope TEXT, '+
					'	timestamp REAL, '+
					'	url TEXT, '+
					'	urlex TEXT, '+
					'	user TEXT '+
					');',[],function(){
							console.log("db.open.trans connection open and returned")
						},function(tx,e){
							console.log("db.open.trans connection open and returned an error "+ tx +"\n"+ stickythang.explode(e))
						});
				trans.executeSql('CREATE TABLE IF NOT EXISTS '+ stickythang.db.tableName +'_buddies '+
					'	(id TEXT, '+
					'	label TEXT, '+
					'	buddy TEXT '+
					');',[],function(){
						/*
							trans.executeSql("INSERT INTO "+ stickythang.db.tableName +"_buddies (id, label, buddy) VALUES (?,?,?)",["","","andrew"],
									function(){stickythang.db.getBuddies();},
									function(tx,error){console.log(error.message)});
							trans.executeSql("INSERT INTO "+ stickythang.db.tableName +"_buddies (id, label, buddy) VALUES (?,?,?)",["","","patrick"],
									function(){stickythang.db.getBuddies();},
									function(tx,error){console.log(error.message)});
							trans.executeSql("INSERT INTO "+ stickythang.db.tableName +"_buddies (id, label, buddy) VALUES (?,?,?)",["","","tester"],
									function(){stickythang.db.getBuddies();},
									function(tx,error){console.log(error.message)});
						*/
						},function(tx,e){
							console.log("db.open.trans connection open and returned an error "+ tx +"\n"+ stickythang.explode(e))
						});
			});
		}
	};	
	 
	  
	  
	  /*
	function Init(){
		var updateInterval = parseInt(stickythang.getLocalStorage('updateInterval',30),10) * 60000;
		
		stickythang.getupdates = setInterval(function(){
			window.stickythang.getPublicStickies();
		},updateInterval);		
		
	}
	*/
	//Init();

















