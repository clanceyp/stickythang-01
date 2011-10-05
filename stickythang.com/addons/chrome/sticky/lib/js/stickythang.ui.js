/*
Copyright (c) 2011, P Clancey. All rights reserved.
Code licensed under the BSD License:
http://www.opensource.org/licenses/bsd-license.php
version: alpha 0.1
*/
 

if (chrome && chrome.extension){
	chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
		console.log("request recived:" + request.action)
		switch (request.action) {
			case "create-note" :
				stickythang.createNoteYUI(null);
				sendResponse({message:'thank you'});
			break;
			case "focus" :
				stickythang.backgroundnotes = request.notes;
				stickythang.checkforchanges();
				stickythang.addCSS({style:request.style});
				sendResponse({message:'thank you, Im checking'});
			break;			
			case "css" :
				stickythang.addCSS(request.style);
				sendResponse({message:'thank you, adding'});				 
			break;	
		}
		// sendResponse({message:'thank you'});
	});
}
 
 
window.stickythang={
	isloaded:false,
	activeids:[],
	backgroundnotes:[],
	currentids:[],
	currentnotes:[],
	user:"",
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
			console.log('setting saved')
		}
	},
	util:{
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
				//console.log( note.getData('state') )
				if (note.getData('state') === 'maximise')
					stickythang.util.state.min(note);
				else 
					stickythang.util.state.max(note);
			},
			max:function(note){
				note.replaceClass('minimise','maximise');
				note.setStyle("webkitTransformOrigin","0 0");
				note.setStyle("webkitAnimationName","stickyThangNoteMaximise");
			},
			min:function(note){
				note.setStyle("webkitTransformOrigin","0 0");
				note.setStyle("webkitAnimationName","stickyThangNoteMinimise");
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
				console.log( "flipping note:" )
				note.addClass('form-hide').addClass('in-flip').one('div.card').setStyle("webkitAnimationName","stickyThangNoteFlip");
				setTimeout(function(){
					note.addClass("flippingTemp")
				},dur/2)
				setTimeout(function(){
					note.removeClass('in-flip').replaceClass("flippingTemp","flipped").setData('flipped','true').one('div.card').setStyle("webkitAnimationName","");
					note.one('div.card').transition({
					    easing: 'ease-both',
					    duration: 0.75,
					    width: '200px',
					    height: '260px',
						on:{end:function(){note.removeClass('form-hide')}}
					});
				},dur)
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
		,className:["yellow","green","blue","red","gold","purple","silver","cornflowerblue","white"]
		,count:0
		,css:{left:350,leftOffset:120,top:50,topOffset:40}
		,defultsettings:{button:{left:0,top:50}}
		,domain:window.location.hostname
		,highestZ:1
		,path:window.location.pathname
		,skey:'stickythang.settings'
		,template:'<div class="closebutton"></div><div class="minimisebutton"></div><div class="maximisebutton"></div><div class="resizebutton hide-back hide-flip"></div><div class="flipbutton hide-flip"></div><div class="timestamp"></div><div class="edit front"></div>' +
			'<form class="settings back"><legend>Note settings:</legend>'+
				'<label>Colour <select></select></label>'+
				'<label>Share with: <span>(commer or line seporated list)</span><textarea></textarea></label>'+
				'<div class="scope">Scope: '+
				'<label><input type="radio" name="scope" class="path" value="path"> page</label>'+
				'<label><input class="domain" name="scope" type="radio" value="domain"> site</label>'+
				'<label><input class="global" name="scope" type="radio" value="global"> everwhere</label></div>'+
			'</form>'
	},
	Note:function(result){// note object set defaults here
		var Y = stickythang.Y;
		if (result) {// it's a record from the db parse ops 
			this.ops = Y.JSON.parse( result.ops );
			this.id = result.id;
			this.scope = result.scope;
			this.timestamp = result.timestamp;
			this.html = result.note;
			this.urlex = result.urlex;
		}
		else {// default ops for new notes
			this.ops = {
				className: stickythang.ops.className[ stickythang.util.random(0, stickythang.ops.className.length ) ],
				left: stickythang.util.random(stickythang.ops.css.left - stickythang.ops.css.leftOffset , stickythang.ops.css.left + stickythang.ops.css.leftOffset ),
				state: 'maximise',
				top: stickythang.util.random(stickythang.ops.css.top - stickythang.ops.css.topOffset , stickythang.ops.css.top + stickythang.ops.css.topOffset ) + Y.one("body").get("scrollTop"),
			}
			this.isNew = true;
			this.scope = 'global'
			this.timestamp = (new Date().getTime());
			this.id = stickythang.user + '-' + this.timestamp;
			this.html = '';
		}
		this.div = Y.Node.create('<div />');
		this.div.Super = this;
		// return this;
	}
} 
stickythang.loadAll = function(list){
    for (var i = 0; i < list.length; ++i) {
		console.log('getAll: loading note '+ i +":"+list[i].scope +":"+ list[i].path +":"+ list[i].domain)
		if (list[i].scope == 'global'){
			stickythang.createNoteYUI( list[i] );
		} else if (list[i].scope == 'domain' && list[i].domain == window.location.hostname){
			stickythang.createNoteYUI( list[i] );
		} else if (list[i].scope == 'path' && list[i].domain == window.location.hostname){
			stickythang.createNoteYUI( list[i] );
		} else if (list[i].path == window.location.href){
			stickythang.createNoteYUI( list[i] );
		}
    }	
}
stickythang.checkforchanges = function(){
	stickythang.checkforupdates();
	stickythang.checkfororphans();
	stickythang.checkfornewnotes();
}
stickythang.checkforupdates = function(){
	console.log('checking for updates')
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
				console.log(note.id +" !!! has changed")
				return stickythang.backgroundnotes[i];
			}
		}	
		return false;	
	}
}
stickythang.checkfororphans = function(){
	console.log('checking for orphans')
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
	console.log('checking for new notes');
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
	console.log("trying to remove:"+ id +" from:"+ stickythang.currentnotes.length)
	var node;
	for (var i = 0; i < stickythang.currentnotes.length;i++){
		if (stickythang.currentnotes[i].id == id ){
			console.log("idMATCH")
			try{
				console.log("trying to destroy:!!!!"+ id)
				//stickythang.currentnotes[i].remove(1);
				stickythang.currentnotes[i].destroy();
				stickythang.currentnotes.splice(i,1);
			}catch(e){
				console.log("trying to remove:error"+ e)
				stickythang.currentnotes.splice(i,1)
			}
			break;
		}else{
			console.log("idNO MATCH")
		}
	}	
}
stickythang.init = function(){
	if (stickythang.isloaded){return}
	stickythang.isloaded=true
	stickythang.user = "me";
	console.log('myStickies loading...');
	//stickythang.db.init();
	var temp = localStorage.getItem(stickythang.ops.skey);
	
	
	YUI().use('node','dd-plugin','resize','yql','json','transition', function(Y) {
		stickythang.Y  = Y;
		var settings = (temp) ? Y.JSON.parse(temp) : stickythang.ops.defultsettings ;
		
		Y.one('body').append('<div id="stickythangContainer" />')
		Y.one('body').append('<div id="stickythangButtonLayer" class="fade"><div id="stickythangFormContainer" /></div>');
		

		
		Y.one('#stickythangFormContainer')
			.setStyle('webkitAnimationName','stickyThangFadeIn')

	    // stickythang.db.count();
		chrome.extension.sendRequest({action: "getAll"}, function(response) {
		  stickythang.loadAll(response.list);
		});		
	})

 };
 
stickythang.Note.prototype = {
	
	createOps: function(){
		var self = this.div;
//		self.ops.timestamp = (new Date().getTime());
		var xy = self.getXY();
		var ops = {ops:{
			className:self.getData('className')
			,height:parseInt(self.one('div.card').getStyle('height'))
			,left:xy[0]
			,scope:self.getData('scope')
			,state:self.getData('state')
			,top:xy[1]
			,width:parseInt(self.one('div.card').getStyle('width'))
		}};
		// YUI().use('node','json', function(Y) {
			// console.log( Y.JSON.stringify( self.ops ) )
			ops.className = self.getData('className');
			ops.domain = window.location.host
			ops.href = window.location.href
			ops.json = stickythang.Y.JSON.stringify( ops.ops );
			ops.id = self.get('id');
			ops.html = self.one("div.edit").get('innerHTML');
			ops.path = window.location.pathname
			ops.querystring = window.location.search
			ops.scope = self.getData('scope');
			ops.user = "me";
		// })		
		return ops;
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
			console.log('adding node:'+ops.id)			
			chrome.extension.sendRequest({action:"saveNew", ops:ops }, function(response) {
			  console.log(response.message)
			});				
			note.isNew = false;
		}else{
			console.log('updating node:'+ops.id)
			chrome.extension.sendRequest({action:"save", ops:ops }, function(response) {
			  console.log(response.message)
			});
		}
		

    },
	remove: function(quick){
		if (quick){
			this.div.setStyle("display","none");	
		}
		this.div.setStyle("webkitTransformOrigin","100% 0");	
		this.div.setStyle('webkitAnimationName' , 'stickyThangNoteDelete') ;	
		
		var id = this.id;
		console.log('remove:'+ id )
		removeFormPageArrays(id)
		//stickythang.db.remove(id);
		chrome.extension.sendRequest({action:"remove", id:id }, function(response) {
		  console.log(response.message)
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
				console.log('couldnt remove item')
			}
		}
	},
	destroy: function(){
		this.div.remove();
	}	
}


stickythang.addCSS = function(style){
	if (stickythang.bespokeCSS && stickythang.bespokeCSS == style){
		return;
	}else{
		stickythang.bespokeCSS = style;
	}
	var s = document.createElement('style');
	s.setAttribute("type", "text/css");

	var stxt = document.createTextNode(style);
    s.appendChild( stxt );

	document.getElementsByTagName('head')[0].appendChild(s);	
}

stickythang.createNoteYUI = function(result){
		console.log('trying to creat note');
		var Y = stickythang.Y;
		var note = new stickythang.Note(result);
		
		stickythang.currentids.push(note.id);
		stickythang.currentnotes.push(note);

		// console.log( Y.JSON.stringify( note.state ) )
		
		note.div.set('id',note.id)
			.addClass("stickythang")
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
			.setData('ops',note.ops.json)
			.setContent("<div class='card'>"+stickythang.ops.template+"</div>")
			.on('click',function(){note.edited = true; note.saveSoon()})
		note.div.one("div.card").setStyles({
				'height':note.ops.height
				,'width':note.ops.width
			})
		


		note.div.one("div.timestamp").setContent( stickythang.util.modifiedString(note.timestamp, note.isNew) );
		if (note.urlex){
			note.div.one("div.edit").addClass("externalURL")
				//.setContent("<iframe src='"+ note.urlex +"' />");	
				/// debugger
				console.log('oopar')
				Y.YQL('select * from feed where url="http://stickythang.com/phpBB3/feed.php?f=2&t=2"', (function(inner) {
					return function(r) {
						//var inner = mod.one('div.inner')
		                if (r && r.query && r.query.results) {
			                var html = '',
								obj = {},
								str;
		                    //Walk the list and create the news list
		                    Y.each(r.query.results, function(items) {
		                        Y.each(items, function(v, k) {
		                            if (1) {
		                                if (v.content && v.content.content) {
		                                   v.content = v.content.content.replace(/&quot;/g,'"').replace(/(\r\n|\n|\r)/g,"");
		                                }
										obj = Y.JSON.parse( v.content );
										if (obj.text)
		                                	html += Y.Lang.sub('<li>!!{text}</li>', obj);
										//html+= "<li><textarea>"+ obj.className +"\n"+ temp  +"\n"+ (v.content == temp) +"</textarea></li>"
		                            }
		                        });
		                    });
		                    //Set the innerHTML of the module
		                    inner.set('innerHTML', '<ul>' + html + '</ul>');
		                }else{
							inner.set('innerHTML', '<ul>problems :( </ul>');
						}
		            }
		        })(  note.div.one("div.edit")  ));					
		} else {
			note.div.one("div.edit")
				.setAttribute( 'contenteditable' , 'true' )
				.set('innerHTML', note.html)
				.on('keyup',function(){note.edited=true;note.saveSoon();});
		}
		note.div.one("div.flipbutton").on('click',stickythang.util.flip.toggle)
		note.div.one("div.minimisebutton").on('click',stickythang.util.state.toggle)
		note.div.one("div.maximisebutton").on('dblclick',stickythang.util.state.toggle)
		note.div.one("div.closebutton").on('click',stickythang.util.remove)

		Y.one("#stickythangContainer").appendChild(note.div);
		note.div.setStyle("webkitTransformOrigin","100% 0");	
		note.div.setStyle('webkitAnimationName' , 'stickyThangNoteCreate') ;
		note.div.initForm = InitForm;
		note.div.initForm();

 		note.div.plug(Y.Plugin.Drag);
		note.div.dd.addHandle('div.timestamp');	
		note.div.dd.addHandle('div.maximisebutton');	
		note.div.on("focus",function(e){
			console.log( 'focus '+ note.id );
			note.div.setStyle('zIndex',stickythang.util.highestZ() );
		})
		note.div.dd.on("drag:start",function(e){
			console.log( 'drag:start '+ note.id );
			note.div.addClass('stickythangInDrag');
			note.div.setStyle('zIndex',stickythang.util.highestZ() );
		})	
		note.div.dd.on("drag:end",function(e){
			console.log( 'drag:end '+ note.id );
			note.div.removeClass('stickythangInDrag')
			note.edited = true;
			note.save();
		})		
	    document.getElementById( note.id ).addEventListener('webkitAnimationEnd', function() { 
			var animation = note.div.getStyle('webkitAnimationName');
			note.div.setStyle('webkitAnimationName', '') ;
			
			switch (animation) {
				case "stickyThangNoteMinimise" :
					note.div.replaceClass('maximise','minimise').setData('state','minimise')
					console.log("webkitAnimationEnd:set data min");
					noteSave();
					break;
				;
				case "stickyThangNoteMaximise" :
					note.div.setData('state','maximise')
					console.log("webkitAnimationEnd:set data max");
					noteSave();
					break;
				;
				case "stickyThangNoteDelete" :
					console.log("webkitAnimationEnd:set delete");
					note.destroy();
					break;
				;
				case "stickyThangNoteFlip" :
					console.log("webkitAnimationEnd: resize to fit form");
					break;
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
		function InitForm(){
			var self = this;
			console.log("ST!InitForm()")
			self.one("input."+self.getData('scope')).setAttribute('checked','checked');
			self.one("form").on('click',function(e){
				var scope = self.one("input:checked").getAttribute("value");
				self.setData('scope',scope)
			})
			self.one('select').setContent( function(){
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
		}	
} 

	
