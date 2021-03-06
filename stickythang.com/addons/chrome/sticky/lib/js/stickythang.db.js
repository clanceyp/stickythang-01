/*
Copyright (c) 2011, P Clancey. All rights reserved.
Code licensed under the BSD License:
http://www.opensource.org/licenses/bsd-license.php
version: alpha 0.1
*/
 
window.stickythang.db = {
		localdb:null,
		version:"1.0",
		tableName:"stickies",
		
		init: function(){
			
			stickythang.db.localdb = openDatabase("StickyThang", "", "StickyThangs!", 200000);
			console.log("open db version:"+stickythang.db.localdb.version)
			stickythang.db.open();
				
		},
		getList:function(sendResponse){
			console.log('Loading list');
		    stickythang.db.localdb.transaction(function(tx) {
		        tx.executeSql("SELECT id, note, url, timestamp FROM "+ stickythang.db.tableName +" where ( (path='"+stickythang.ops.path+"') or (domain='"+stickythang.ops.domain+"' and scope='domain') or (scope='global') ) and user='"+ stickythang.user+"'", [], function(tx, result) {
		        	console.log("returing list :"+ result.rows.length);
					var list = [];
					for (var i = 0; i < result.rows.length; ++i) {
						list.push({note:result.rows.item(i).note,url:result.rows.item(i).url});
					}					
		            sendResponse({results:list,domain:window.location.hostname})
		        }, function(tx, error) {
		            console.log('Failed to retrieve notes from database - ' + error.message);
		            return;
		        });
		    });					
		},
		getAll:function(){
			console.log('Loading stickies');
		    stickythang.db.localdb.transaction(function(tx) {
		        tx.executeSql("SELECT id, note, ops, scope, timestamp FROM "+ stickythang.db.tableName +" where ( (path='"+stickythang.ops.path+"') or (domain='"+stickythang.ops.domain+"' and scope='domain') or (scope='global') ) and user='"+ stickythang.user+"'", [], function(tx, result) {
		        	console.log("loading stikies :"+ result.rows.length);
		            for (var i = 0; i < result.rows.length; ++i) {
						console.log('getAll: loading note '+ i)
						stickythang.createNoteYUI( result.rows.item(i) );
		            }
		        }, function(tx, error) {
		            console.log('Failed to retrieve notes from database - ' + error.message);
		            return;
		        });
		    });					
		},
		count:function(){
		    stickythang.db.localdb.transaction(function(tx) {
		        tx.executeSql("SELECT COUNT(*) FROM "+ stickythang.db.tableName, [], function(result) {
		        	// count exists loading stickies
					console.log('count - loading sticky-notes')
		            stickythang.db.getAll();
		        }, function(tx, error) {
		        //    tx.executeSql("CREATE TABLE "+ stickythang.db.tableName +" (id TEXT, note TEXT, timestamp REAL, left TEXT, top TEXT, pathway TEXT, page TEXT, scope TEXT, state TEXT, class TEXT)", [], function(result) { 
		                //stickythang.loadNotes(); 
						console.log('no count - no notes to load');
		        //    });
		        });
		    });				
		},
		remove:function(id){			
	        stickythang.db.localdb.transaction(function (trans){
	            trans.executeSql("DELETE from "+ stickythang.db.tableName +" WHERE id = ?", 
					[id],
					function(){},
					function(tx,error){
					console.log(error.message)
				});
	        });			
		},
		save:function(note){			
	        stickythang.db.localdb.transaction(function (trans){
	            trans.executeSql("UPDATE "+ stickythang.db.tableName +" SET note = ?, ops = ?, scope = ?, timestamp = ? WHERE id = ?", 
					[note.html, note.json, note.scope, (new Date().getTime()), note.id],
					function(){},
					function(tx,error){
					console.log(error.message)
				});
	        });			
		},
		saveNew:function(note){
	        stickythang.db.localdb.transaction(function (trans){
	            trans.executeSql("INSERT INTO "+ stickythang.db.tableName +" (id, domain, note, ops, path, scope, timestamp, url, user) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", 
					[note.id, note.domain, note.html, note.json, note.path, note.scope, (new Date().getTime()) , window.location.href , stickythang.user],
					function(){},
					function(tx,error){
					console.log(error.message)
				});
	        });			
		},
		open: function(){
			// open db assume it's the first time
			stickythang.db.localdb.transaction(function(trans){
				console.log("db.open.trans connection open")
				trans.executeSql('CREATE TABLE IF NOT EXISTS '+ stickythang.db.tableName +' '+
					'	(id TEXT, '+
					'	domain TEXT, '+
					'	note TEXT, '+
					'	ops TEXT, '+
					'	path TEXT, '+
					'	querystring TEXT, '+
					'	scope TEXT, '+
					'	timestamp REAL, '+
					'	url TEXT, '+
					'	user TEXT '+
					');',[],function(){
							console.log("db.open.trans connection open and returned")
						},function(tx,e){
							console.log("db.open.trans connection open and returned an error "+ tx +"\n"+ stickythang.explode(e))
						});
			});
		}
	};	
	stickythang.explode = function(obj){
		if (typeof obj == "string") return "'"+obj+"'";
		if (obj == null) return "null";
		var s  = "{"
		for (name in obj){
			s+= name+":"+ stickythang.explode(obj[name]) +","
		}
		s+="}";
		return s;
	}
	
/*
	
	YUI().use('node', function(Y) {
	      Y.on("domready", function(){
		  	stickythang.init();
		  }); 
	});
	
*/



	
