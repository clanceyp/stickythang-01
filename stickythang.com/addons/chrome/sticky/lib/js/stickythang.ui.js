/*
Copyright (c) 2011, P Clancey. All rights reserved.
Code licensed under the BSD License:
http://www.opensource.org/licenses/bsd-license.php
version: 0.1
*/
 

if (chrome && chrome.extension){
	chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
		if (stickythang.debug == "true")
			stickythang.log("request recived:" + request.action)
		switch (request.action) {
			case "create-note" :
				stickythang.createNoteYUI(null);
				sendResponse({message:'thank you'});
			break;
			case "focus" :
				stickythang.backgroundnotes = request.notes;
				stickythang.urlSingleNote = request.urlSingleNote;
				stickythang.online = request.online;
				stickythang.debug = request.debug || "false";
				stickythang.user = request.user || "";
				stickythang.isLoggedIn = request.isLoggedIn;
				stickythang.checkforchanges();
				stickythang.stickiesActive(request.stickiesActive);
				if (stickythang.debug == "true"){
					console.log( "[debug]"+ stickythang.Y.JSON.stringify( request ) )
				}
				sendResponse({message:'thank you, Im checking:'+request.stickiesActive});
			break;
			case "css" :
				stickythang.stickiesActive(request.stickiesActive);
				sendResponse({message:'thank you, amending'});
			break;	
			case "checkforchanges" :
				if (stickythang.debug == "true")
					console.log("something changed, check for updates")
				stickythang.backgroundnotes = request.notes;
				stickythang.checkforchanges();
				sendResponse({message:'thank you, checking'})
			break;
		}
		// sendResponse({message:'thank you'});
	});
}
 
 
window.stickythang={
	isloaded:false,
	online:"false",
	log:function(message){if(stickythang.debug){console.log(message)}},
	debug:true,
	activeids:[],
	urlSingleNote:"",
	backgroundnotes:[],
	currentids:[],
	currentnotes:[],
	isLoggedIn:false,
	user:"",
	getLoggedInUser:function(fn,ops){
		chrome.extension.sendRequest({action:"checkLoggedInUser"},fn);
	},
	getUser:function(){return stickythang.user || ""},
	getUserId:function(){return stickythang.userId || ""},
	isUserLoggedIn:function(){ return stickythang.isLoggedIn == "true" },
	setUser:function(user){stickythang.user = user.name;stickythang.userId = user.id},
	getShareUrl:function(note){return stickythang.urlSingleNote +"?id="+note.div.getData('urlex')+"&c="+ note.div.getData('className') +"&author="+ stickythang.getUserId() },
	settings:{
		save:function(Y,node){
			var xy = node.getXY();
			var settings = {
				button:{
					left:xy[0]
					,top:xy[1]
				}
			}
			localStorage.setItem(stickythang.ops.skey, Y.JSON.stringify( settings ) )
			stickythang.log('setting saved')
		}
	},
	util:{
		shareSticky:function(note){
			if (note.getData('shared') == 'true') {
				return;
			}
			else {
				if (stickythang.debug)
					console.log('trying to share')
				note.one("input.buttonShareSticky").set('value', 'Setting public...')
				// self.one("#buttonShareSticky").set('value',"share")
				note.Super.shareMe( note.getData("id") );
			}
		},
		modifiedString:function(x,n){
	        var date = new Date();
			var m = (n) ? "Created:" : "Edited:"
	        date.setTime(parseFloat(x));
	    	return m + ' ' + date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
		},
		highestZ:function(){
			return ++stickythang.ops.highestZ;
		},
		random:function(bottom,top){
			return Math.floor( Math.random() * ( top - bottom ) + bottom );
		},
		remove:function(e){
			var note = e.currentTarget.ancestor('div.stickythang');
			note.Super.remove();
		},
		state:{
			toggle:function(e){
				var note = e.currentTarget.ancestor('div.stickythang');
				window.getSelection().removeAllRanges();
				if (note.getData('state') === 'maximise')
					stickythang.util.state.min(note);
				else 
					stickythang.util.state.max(note);
			},
			max:function(note){
				var card = note.one('div.card');
				note.replaceClass('minimise','maximise');
				card.setStyle("webkitTransformOrigin","0 0")
					.setStyle("webkitAnimationName","stickyThangNoteMaximise");
			},
			min:function(note){
				var card = note.one('div.card');
				card.setStyle("webkitTransformOrigin","0 0")
					.setStyle("webkitAnimationName","stickyThangNoteMinimise");
			}
		},
		flip:{
			toggle:function(e){
				var note = e.currentTarget.ancestor('div.stickythang');
				note.one('div.card').setStyle("webkitTransformOrigin","50% 50%");
				var dur = parseInt(1) * 500;
				window.getSelection().removeAllRanges();
				if (note.getData('flipped') === 'true')
					stickythang.util.flip.turnBack(note,dur);
				else 
					stickythang.util.flip.turnOver(note,dur);
			},
			turnOver:function(note,dur){
				stickythang.log( "flipping note:" )
				if (note.getData("shared") == "true"){
					note.one("input.buttonShareSticky").setStyle('display','none')
					note.one("span.buttonShareStickyNote").setContent("This sticky is shared, well done!")
					note.one("form").setStyle('overflow','visible');
				}else{
					chrome.extension.sendRequest({action:"checkLoggedInUser",ops:{noteId:note.get("id")}}, function(response) {
						stickythang.log( "flipping note: got response from server ("+ response.noteId +","+ response.user +")")
						stickythang.online = response.online;
						stickythang.isLoggedIn = response.isLoggedIn;
						stickythang.checkforloginstatusupdate();
						var Y = stickythang.Y,
							note = Y.one("#"+ response.noteId);
						if (stickythang.debug){
							console.log("note.id:"+ response.noteId);
						}
						if (stickythang.online == 'false'){
							if (stickythang.debug){
								console.log("stickythang.online:"+ stickythang.online);
							}
							note.one("input.buttonShareSticky").setStyle('display','none')
							note.one("span.buttonShareStickyNote").setContent("Sorry, StickyThang! is currently offline, maybe the clearer unpluged the server again. Rest assured our team of crack techies are on the job")
						} else if (!response.user || response.user == 'me' || response.user == 'undefined'){
							if (stickythang.debug){
								console.log("user not logged in:"+ response.user);
								console.log(response);
							}
							// user not logged in
							if (!note){
								console.log("CAN'T FIND NOTE!!!");
								console.log("note.id:"+ response.noteId);
								if (!document.getElementById(response.noteId)){
									console.log("getElementById can't find it " )
								}
								if (document.getElementById(response.noteId)) {
									console.log("getElementById can find it " )
								}
							}

						} else {
							stickythang.setUser({"name":response.user,"id":response.userId})
							if (stickythang.debug){
								console.log("gets here: "+ stickythang.getUser());
							}
							if (note.one("div.edit textarea").get("value") == ""){
								note.one("input.buttonShareSticky").set('value','Add content to share');
								return;
							}
							else if (note.getData('shared') == 'true') {
								note.one("input.buttonShareSticky").set('value','Already shared');
							} else {
								note.one("input.buttonShareSticky").set('value','Share as '+ stickythang.getUser());
							}
						}
						note.one("input.buttonShareSticky").on("click",function(e){
							stickythang.util.shareSticky(note);
						})
					})
				}
				note.addClass('form-hide').addClass('in-flip').one('div.card').setStyle("webkitAnimationName","stickyThangNoteFlip");
				setTimeout(function(){
					note.addClass("flippingTemp")
				},dur/2);
				setTimeout(function(){
					note.removeClass('in-flip').replaceClass("flippingTemp","flipped").setData('flipped','true').one('div.card').setStyle("webkitAnimationName","");
					note.one('div.card').transition({
						easing: 'ease-both',
						duration: 0.75,
						width: '230px',
						height: '180px',
						on:{end:function(){note.removeClass('form-hide')}}
					});
				},dur);
			},
			turnBack:function(note,dur){
				note.addClass('in-flip').one('div.card').setStyle("webkitAnimationName","stickyThangNoteFlip");
				setTimeout(function(){
					note.replaceClass("flipped"," flippingTemp2");
				},dur/2)
				setTimeout(function(){
					note.removeClass('in-flip').removeClass("flippingTemp2").setData('flipped','false').one('div.card').setStyle("webkitAnimationName","");
				},dur)					
			}
		}
	},
	ops:{
		captured:null
		,className:["black","blue","cornflowerblue","gold","green","purple","red","silver","slate","white","yellow"]
		,count:0
		,css:{left:350,leftOffset:120,top:50,topOffset:40}
		,defultsettings:{button:{left:0,top:50}}
		,domain:window.location.hostname
		,highestZ:1
		,path:window.location.pathname
		,skey:'stickythang.settings'
		,template:'<div class="closebutton"></div><div class="minimisebutton"></div><div class="maximisebutton"></div><div class="resizebutton hide-back hide-flip"></div><div class="flipbutton hide-flip"></div><div class="timestamp"></div><div class="edit front"></div>' +
			'<form class="settings back"><legend>Note settings:</legend>'+
				'<label title="the background colour">Colour <select name="colour"></select></label>'+
				//'<div class="scope">'+
				'<label title="pin sticky to browser (css:position fixed)">Pin <input type="checkbox" name="pin" /></label>'+
				'<label title="when to show the sticky (applies to personal stickies only)">Scope <select name="scope"><option value="page" title="exact href match only">full href</option><option value="path" title="path match">path</option><option title="domain match" value="domain">website</option><option value="global">everywhere</option></select></label>'+
				//'<label><input class="path" name="scope" type="radio" value="path"> page</label>'+
				//'<label><input class="domain" name="scope" type="radio" value="domain"> site</label>'+
				//'<label><input class="global" name="scope" type="radio" value="global"> everwhere</label>'+
				//'</div>'+
				'<div class="share">'+
				//'<label>Share with: <span>(comma or line separated list)</span><textarea disabled="true">@everyone</textarea></label>'+
				'<input type="button" value="share" class="buttonShareSticky" /><span class="buttonShareStickyNote"><iframe frameborder=0 style="width:99%;height:100px;" src=http://www.stickythang.com/oauth2callback></iframe></span>'+
				'</div>'+
			'</form>'
	},
	Note:function(result){// note object set defaults here
		var Y = stickythang.Y;
		if (result) {// it's a record from the db parse ops 
			this.html = result.note;
			this.id = result.id;
			this.ops = Y.JSON.parse( result.ops );
			this.scope = result.scope;
			this.timestamp = result.timestamp;
			this.user = result.user;
			this.urlex = result.urlex;
			this.shared = result.shared;
		}
		else {// default ops for new notes
			this.ops = {
				className: stickythang.ops.className[ stickythang.util.random(0, stickythang.ops.className.length ) ],
				left: stickythang.util.random(stickythang.ops.css.left - stickythang.ops.css.leftOffset , stickythang.ops.css.left + stickythang.ops.css.leftOffset ),
				state: 'maximise',
				top: stickythang.util.random(stickythang.ops.css.top - stickythang.ops.css.topOffset , stickythang.ops.css.top + stickythang.ops.css.topOffset ) + Y.one("body").get("scrollTop"),
			}
			this.isNew = true;
			this.scope = 'path';// default scope setting
			this.timestamp = (new Date().getTime());
			this.id = Y.guid();
			this.html = '';
			this.shared = '';
		}
		this.div = Y.Node.create('<div />');
		this.div.Super = this;
		// return this;
	}
} 
stickythang.loadAll = function(list){
	stickythang.log('stickythang.getAll('+ list.length+')');
    for (var i = 0; i < list.length; ++i) {
		var domain = list[i].domain == window.location.hostname,
			path = list[i].path == window.location.pathname;
			
		stickythang.log('stickythang.getAll: checking note['+ i +'].scope : '+ list[i].scope );
		if (list[i].scope == 'global'){
			stickythang.log('stickythang.getAll: creating global note '+ i)
			stickythang.createNoteYUI( list[i] );
		} else if (list[i].scope == 'domain' && domain){
			stickythang.log('stickythang.getAll: creating domain note '+ i )
			stickythang.createNoteYUI( list[i] );
		} else if (list[i].scope == 'path' && domain && path){
			stickythang.log('stickythang.getAll: creating path note '+ list[i].path )
			stickythang.createNoteYUI( list[i] );
		} else if (list[i].url == window.location.href){
			stickythang.log('stickythang.getAll: creating href match note ')
			stickythang.createNoteYUI( list[i] );
		} else {
			stickythang.log('stickythang.getAll: ignoring note '+i )
		}
    }	
}
stickythang.checkforchanges = function(){
	stickythang.checkforupdates();
	stickythang.checkfororphans();
	stickythang.checkfornewnotes();
	stickythang.checkforloginstatusupdate();
}
stickythang.checkforloginstatusupdate = function(){
	var Y = stickythang.Y;
	if (stickythang.isUserLoggedIn()){
		Y.one("#stickythangContainer").removeClass("st-anonymous");
	} else {
		Y.one("#stickythangContainer").addClass("st-anonymous");
	}
}
stickythang.checkforupdates = function(){
	stickythang.log('checking for updates')
	var updatedlist=[],temp,updatednote;
	for (var i = 0; i < stickythang.currentnotes.length;i++){
		updatednote = hasChanged(stickythang.currentnotes[i]);
		if ( updatednote ){
			updatedlist.push( updatednote );
			stickythang.currentnotes[i].destroy();
			temp = stickythang.currentnotes.splice(i,1);	
			delete temp;		
		}
	}
	stickythang.loadAll( updatedlist );
	function hasChanged( note ){
		for (var i = 0; i < stickythang.backgroundnotes.length;i++){
			if ( (note.id == stickythang.backgroundnotes[i].id) && (note.timestamp != stickythang.backgroundnotes[i].timestamp)){
				stickythang.log(note.id +" !!! has changed")
				return stickythang.backgroundnotes[i];
			}
		}	
		return false;	
	}
}
stickythang.checkfororphans = function(){
	stickythang.log('checking for orphans')
	for (var i = 0; i < stickythang.currentnotes.length;i++){
		if (!isAlive(stickythang.currentnotes[i].id)){
			stickythang.killById( stickythang.currentnotes[i].id );
		}
	}
	function isAlive(id){
		for (var i = 0; i < stickythang.backgroundnotes.length;i++){
			if (id == stickythang.backgroundnotes[i].id){
				return true;
			}
		}	
		return false;	
	}
}
stickythang.checkfornewnotes = function(){
	stickythang.log('checking for new notes');
	var newlist=[];
	for (var i = 0; i < stickythang.backgroundnotes.length;i++){
		if (isNew(stickythang.backgroundnotes[i].id)){
			newlist.push( stickythang.backgroundnotes[i] );
		}
	}
	stickythang.loadAll( newlist );
	function isNew(id){
		for (var i = 0; i < stickythang.currentnotes.length;i++){
			if (id == stickythang.currentnotes[i].id){
				return false;
			}
		}	
		return true;	
	}
}
stickythang.killById = function(id){
	stickythang.log("trying to remove:"+ id +" from:"+ stickythang.currentnotes.length)
	var node;
	for (var i = 0; i < stickythang.currentnotes.length;i++){
		if (stickythang.currentnotes[i].id == id ){
			try{
				stickythang.log("trying to destroy:!!!!"+ id)
				//stickythang.currentnotes[i].remove(1);
				stickythang.currentnotes[i].destroy();
				stickythang.currentnotes.splice(i,1);
			}catch(e){
				stickythang.log("trying to remove:error"+ e)
				stickythang.currentnotes.splice(i,1)
			}
			break;
		}else{
			stickythang.log("stickythang.killById:id NO MATCH")
		}
	}	
}
stickythang.init = function(){
	if (stickythang.isloaded){return}
	stickythang.isloaded=true
	stickythang.log('myStickies loading...');
	//stickythang.db.init();
	var temp = localStorage.getItem(stickythang.ops.skey);
	
	
	YUI().use('node','node-load','event-key','dd-plugin','resize','json','transition', function(Y) {
		// stickythang.Y  = Y;
		var settings = (temp) ? Y.JSON.parse(temp) : stickythang.ops.defultsettings ,
			body = Y.one('body');

		if (body){
			body.append('<div id="stickythangContainer" class="st-anonymous"/>')
			//Y.one('body').append('<div id="stickythangButtonLayer" class="fade"><div id="stickythangFormContainer" /></div>');
			Y.one("html").on("key",stickythang.stickiesMinimizeAll,"esc");

			// stickythang.db.count();
			chrome.extension.sendRequest({action: "getAll"}, function(response) {
			  stickythang.log('response recieved loading shares and stickies:'+ response.message);
			  stickythang.shares = response.shares;
			  stickythang.user = response.user || "";
			  stickythang.online = response.online;
			  stickythang.isLoggedIn = response.isLoggedIn;
			  stickythang.urlSingleNote = response.urlSingleNote;
			  stickythang.stickiesActive(response.stickiesActive);
			  stickythang.loadAll(response.list);
			  stickythang.checkforloginstatusupdate();
			});
		} else {
			chrome.extension.sendRequest({action: "disabled"});
		}
	})

 };
 
stickythang.Note.prototype = {
	
	createOps: function(){
		var note = this,
			div = note.div;
//		self.ops.timestamp = (new Date().getTime());
		var xy = div.getXY();
		var ops = {ops:{// ops object saved as json string
			className:div.getData('className')
			,height:parseInt( div.one('div.card').getStyle('height') )
			,left:xy[0]
			,scope:div.getData('scope')
			,state:div.getData('state')
			,shared:div.getData('shared')
			,position:div.getData('position')
			,top:xy[1]
			,width:parseInt( div.one('div.card').getStyle('width') )
		}};

		ops.domain = window.location.host;
		ops.href = window.location.href;
		ops.json = stickythang.Y.JSON.stringify( ops.ops );
		ops.id = div.get('id');
		ops.html = note.getHTML();
		ops.path = window.location.pathname;
		ops.querystring = window.location.search;
		ops.scope = div.getData('scope');
		ops.shared = div.getData('shared')
		ops.user = stickythang.getUser();
	
		return ops;
	},
	focus:function(){
		var self = this;
		//console.log('trying to focus element')
		//self.div.one("div.edit textarea").getDOMNode().focus();
	},
	getHTML:function(){
		var html,
			self = this;
		if (self.div.getData('urlex')){
			html = self.html;
		}else{
			html = self.div.one("div.edit textarea").get('value');
		}
		return html;
	},
    saveSoon: function()
    {
        this.cancelPendingSave();
        var self = this;
        this._saveTimer = setTimeout(function() { self.save() }, 500);
    },
 
    cancelPendingSave: function()
    {
        if (!("_saveTimer" in this))
            return;
        clearTimeout(this._saveTimer);
        delete this._saveTimer;
    },
    
	onKeyUp: function()
    {
        this.edited = true;
        this.saveSoon();
    },
	hide: function()
	{
		this.div.setStyle("display","none");	
	},
    save: function()
    {
        this.cancelPendingSave();

        var ops = this.createOps();
		var note = this;
		ops.timestamp = note.timestamp = (new Date().getTime());
		note.div.one("div.timestamp").setContent( stickythang.util.modifiedString(note.timestamp, note.isNew) );
		if(note.isNew){
			stickythang.log('adding node:'+ops.id)	
			chrome.extension.sendRequest({action:"saveNew", ops:ops }, function(response) {
			  if(window.stickythang.debug){
				 console.log(response.message)
				}
			});				
			note.isNew = false;
		}else{
			stickythang.log('updating node:'+ops.id)
			chrome.extension.sendRequest({action:"save", ops:ops }, function(response) {
			 	stickythang.log(response.message)
			});
		}
		

	},
	remove: function(quick){
		if (quick){
			this.div.setStyle("display","none");	
		}
		this.div.setStyle("max-width",this.div.one("div.card").getStyle("max-width"));
		this.div.one('div.card')
				.setStyle("webkitTransformOrigin","100% 0")
				.setStyle('webkitAnimationName' , 'stickyThangNoteDelete');
		
		var id = this.id,
			action = (this.urlex) ? "remove" : "remove";
		stickythang.log('sticky '+action + ':'+ id )
		removeFormPageArrays(id)
		//stickythang.db.remove(id);
		chrome.extension.sendRequest({action:action, id:id }, function(response) {
			stickythang.log(response.message)
		});
		
		function removeFormPageArrays(id){
			try {
				for (var i = 0; i < stickythang.currentnotes.length; i++) {
					if (stickythang.currentnotes[i].id == id) {
						var temp = stickythang.currentnotes.splice(i, 1);
						break;
					}
				}
				for (var i = 0; i < stickythang.currentids.length; i++) {
					if (stickythang.currentids[i] == id) {
						var temp = stickythang.currentids.splice(i, 1);
						break;
					}
				}
			}catch(e){
				stickythang.log('couldnt remove item')
			}
		}
	},
	destroy: function(){
		this.div.remove();
	},
	loadExtenal: function(){
		var note = this,
			uri = stickythang.getShareUrl(this);
		note.div.addClass("st-shared");
		note.div.one("div.edit").addClass("externalURL");
		note.div.one("div.timestamp").setContent( "Shared by "+ note.user);
		// inner.set('innerHTML','trying to load content:'+url);
		note.div.one("div.edit").empty().append("<iframe src='"+ uri +"' />");
	},
	shareMe:function(noteId){
		var str,
			note = this,
			ops = note.createOps(),
			div = note.div;
		delete ops.ops;

		ops.id = stickythang.getUser() + '-' + (new Date().getTime());
		str = stickythang.Y.JSON.stringify(ops);
		
		chrome.extension.sendRequest({action:"newPost", ops:{noteId:noteId,message:str,subject:ops.html} }, function(response) {
			if (response.error){
				div.one("input.buttonShareSticky").set('value', 'Sorry, connection error :( ');
			} else {
				div.setData('shared','true');
				div.one("input.buttonShareSticky").set('value', 'Bamb... Thanks for sharing!')
				div.setData('urlex',response.ops.urlex);
				try {
					note.loadExtenal();
				} catch (e){
					console.log("could not load external ")
					console.log(e);
				}

			}
		 	if (stickythang.debug)
				console.log(response.message)
		});
	}
}


stickythang.stickiesActive = function(stickiesActive){
	if (stickiesActive == 'hide'){
		stickythang.Y.one("#stickythangContainer").addClass("hide");
	} else {
		stickythang.Y.one("#stickythangContainer").removeClass("hide");
	}
	
}

stickythang.stickiesMinimizeAll = function(toggle){
	for (var i = 0; i < stickythang.currentnotes.length; i++ ){
		var note = stickythang.currentnotes[i].div;
		if (note.getData('state') === 'maximise')
			stickythang.util.state.min(note);
	}
}


stickythang.createNoteYUI = function(result){
		stickythang.log('stickythang.createNoteYUI() trying to create note');
		if (!stickythang.Y){
			stickythang.log('ERROR: Y has not been defined');
			return; 
		}
		var Y = stickythang.Y;
		var note = new stickythang.Note(result);
		
		stickythang.currentids.push(note.id);
		stickythang.currentnotes.push(note);

		if (stickythang.debug)
			console.log( Y.JSON.stringify( note.ops ) )
		
		note.div.set('id',note.id)
			.addClass("stickythang")
			.addClass(note.ops.position)
			.addClass(note.ops.state)
			.addClass(note.ops.className)
			.setStyles({
				'left':note.ops.left
				,'top':note.ops.top
				,'z-index':stickythang.util.highestZ()
			})
			.setData('className',note.ops.className)
			.setData('scope',note.scope || 'global')
			.setData('state',note.ops.state || 'maximise')
			.setData('position',note.ops.position || 'absolute')
			.setData('ops',note.ops.json)
			.setData('shared',note.ops.shared)
			.setData('id',note.id)
			.setData('urlex',note.urlex)
			.setContent("<div class='card'>"+stickythang.ops.template+"</div>")
			.on('click',function(){note.edited = true; note.saveSoon()})
			
		note.div.one("div.card").setStyles({
				'height':note.ops.height
				,'width':note.ops.width
			})
		


		note.div.one("div.timestamp").setContent( stickythang.util.modifiedString(note.timestamp, note.isNew) );
		note.div.one("div.flipbutton").on('click',stickythang.util.flip.toggle)
		note.div.one("div.minimisebutton").on('click',stickythang.util.state.toggle)
		note.div.one("div.maximisebutton").on('dblclick',stickythang.util.state.toggle)
		note.div.one("div.closebutton").on('click',stickythang.util.remove)

		Y.one("#stickythangContainer").appendChild(note.div);
		note.div.one("div.card")
				.setStyle("opacity","0.99")
				.setStyle("webkitTransformOrigin","100% 0")
				.setStyle('webkitAnimationName' , 'stickyThangNoteCreate') ;
		note.div.initForm = InitForm;
		note.div.initForm(note);

 		note.div.plug(Y.Plugin.Drag);
		note.div.dd.addHandle('div.timestamp');	
		note.div.dd.addHandle('div.maximisebutton');	
		
		/* stop google form stealing the key press */
		function StopPropagation(e){
			// Stop the event's default behavior
			// e.preventDefault();
			
			// Stop the event from bubbling up the DOM tree
			e.stopPropagation();
		}
		note.div.on('keypress',StopPropagation);
		note.div.on('keydown',StopPropagation);

		if (note.urlex){
			stickythang.log( 'note is shared: '+ note.id );
			note.loadExtenal();					
		} else {
			stickythang.log( 'note not shared: '+ note.id );
			note.div.one("div.edit")
			//	.setAttribute( 'contenteditable' , 'true' )
				.set('innerHTML', '<textarea>'+note.html+'</textarea>')
				.on('keyup',function(e){note.edited=true;note.saveSoon();});
		}	
		
		note.div.on("focus",function(e){
			stickythang.log( 'focus '+ note.id );
			note.div.setStyle('zIndex',stickythang.util.highestZ() );
		})
		note.div.dd.on("drag:start",function(e){
			stickythang.log( 'drag:start '+ note.id );
			note.div.addClass('stickythangInDrag');
			note.div.setStyle('zIndex',stickythang.util.highestZ() );
		})	
		note.div.dd.on("drag:end",function(e){
			stickythang.log( 'drag:end '+ note.id );
			note.div.removeClass('stickythangInDrag')
			note.edited = true;
			note.save();
		})
		document.getElementById( note.id ).addEventListener('webkitAnimationEnd', function() { 
			var animation = note.div.one('div.card').getStyle('webkitAnimationName');
			note.div.one('div.card').setStyle('webkitAnimationName', '') ;
			//console.log(animation)
			switch (animation) {
				case "stickyThangNoteMinimise" :
					note.div.replaceClass('maximise','minimise').setData('state','minimise')
					stickythang.log("webkitAnimationEnd:set data min");
					noteSave();
					break;
				;
				case "stickyThangNoteMaximise" :
					note.div.setData('state','maximise')
					stickythang.log("webkitAnimationEnd:set data max");
					noteSave();
					break;
				;
				case "stickyThangNoteDelete" :
					stickythang.log("webkitAnimationEnd:set delete");
					note.destroy();
					break;
				;
				case "stickyThangNoteFlip" :
					stickythang.log("webkitAnimationEnd: resize to fit form");
					break;
				;
				case "stickyThangNoteCreate":
					//note.focus();
					if ("#"+ note.id == window.location.hash){
						window.location = "#"+ note.id;
					}
					break;
				;
			}
			function noteSave(){
				note.save();
			}
		}, false);
		
		var instance = new Y.Resize({
			node: note.div.one('div.card'),
			handles: 'br'
		});			
		instance.on('resize:end',function(){
			note.save();
		});
		function InitForm(note){
			var self = this;
			stickythang.log("ST!InitForm()")
			if (note.urlex){
				self.one("form").addClass("externalShare");
			}
			/*
			self.one("input."+self.getData('scope')).setAttribute('checked','checked');
			self.one("form").on('click',function(e){
				var scope = self.one("input:checked").getAttribute("value");
				self.setData('scope',scope)
			})
			*/
			self.one("select[name='scope']").set('value',self.getData('scope')).on('change',function(e){
				var scope = e.currentTarget.get('value');
				self.setData('scope',scope);
			});
			self.one("select[name='colour']").setContent( function(){
				var opts = "",colour;
				for (name in stickythang.ops.className){
					colour = stickythang.ops.className[name];
					if (self.getData('className') === colour)
						opts += "<option selected='selected' class='"+ colour +"'>"+ colour +"</option>"
					else
						opts += "<option class='"+ colour +"'>"+ colour +"</option>"
				}
				return opts
			}() ).on('change',function(e){
				// select change, set new class name 
				var newClassName = e.currentTarget.get('value');
				var currentClassName = self.getData('className');
				self.setData('className',newClassName).replaceClass( currentClassName , newClassName )
			})
			self.one("input[name='pin']")
				.set("checked", (self.getData('position') == 'fixed') )
				.on('click',function(){
					var position = self.one("input[name='pin']").get("checked") ? 'fixed':'absolute';
					self.removeClass("fixed").addClass(position).setData('position',position);
				})
		}	
		
} 

function receiveMessage(message){
	if ( /^https?:\/\/www\.stickythang\.com/.test(message.origin)){
		if (message.data.action === "login"){
			//console.log(message.data.id +": "+ message.data.name);
			chrome.extension.sendRequest({"action": "userLogin","userId":message.data.id,"userName":message.data.name,'isLoggedIn':'true'},function(response){
				if (response.error){
					console.log(response.message + " " +response.error)
				}else{
					stickythang.isLoggedIn = "true";
					stickythang.setUser({id:message.data.id,name:message.data.name})
					stickythang.checkforloginstatusupdate();
					YUI().use('node','transition', function(Y) {
						Y.all("#stickythangContainer input.buttonShareSticky").set('value','Share as '+ stickythang.getUser());
					})
				}
			});
		} else if (message.data.action === "logout"){
			stickythang.isLoggedIn = "";
			stickythang.setUser({id:'',name:''})
			stickythang.checkforloginstatusupdate();
			chrome.extension.sendRequest({"action": "userLogout"},function(response){});
			//console.log('unsupported request')
		}
	}else{
		//console.log(message.origin)
		//console.log('This domain is not permitted to post messages')
	}
}
window.addEventListener("message",receiveMessage,false);