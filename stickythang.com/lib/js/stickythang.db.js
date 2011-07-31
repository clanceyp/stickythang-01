if (! ("stickythang" in window) )
window.stickythang = {}
 
stickythang.db = {
		localdb:null,
		version:"1.0",
		
		init: function(){
			
			stickythang.db.localdb = openDatabase("StickyThang", "", "StickyThangs!", 200000);
			console.log("open db version:"+stickythang.db.localdb.version)
			stickythang.db.open();
				
		},
		open: function(){
			// open db assume it's the first time
			stickythang.db.localdb.transaction(function(trans){
				console.log("db.open.trans connection open")
				trans.executeSql('CREATE TABLE IF NOT EXISTS stickies '+
					'	(id TEXT, '+
					'	className TEXT,'+
					'	domain TEXT, '+
					'	left TEXT, '+
					'	note TEXT, '+
					'	path TEXT, '+
					'	querystring TEXT, '+
					'	scope TEXT, '+
					'	state TEXT, '+
					'	timestamp REAL, '+
					'	top TEXT, '+
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
