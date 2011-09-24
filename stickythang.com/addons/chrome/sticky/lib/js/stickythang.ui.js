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
			break;	
			case "get-list" :
				stickythang.db.getList(sendResponse);
			break;				
		}
		// sendResponse({message:'thank you'});
	});
}
 
window.stickythang={
	isloaded:false,
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
				note.setStyle("webkitTransformOrigin","50% 50%");
				var dur = parseInt(1) * 500;
				window.getSelection().removeAllRanges();
				if (note.getData('flipped') === 'true')
					stickythang.util.flip.turnBack(note,dur);
				else 
					stickythang.util.flip.turnOver(note,dur);
			},
			turnOver:function(note,dur){
				console.log("flipping note:"+note.getComputedStyle('webkitAnimationDuration'))
				note.addClass('form-hide').addClass('in-flip').setStyle("webkitAnimationName","stickyThangNoteFlip");
				setTimeout(function(){
					note.addClass("flippingTemp")
				},dur/2)
				setTimeout(function(){
					note.removeClass('in-flip').replaceClass("flippingTemp","flipped").setStyle("webkitAnimationName","").setData('flipped','true');
					note.transition({
					    easing: 'ease-both',
					    duration: 0.75,
					    width: '200px',
					    height: '240px',
						on:{end:function(){note.removeClass('form-hide')}}
					});
				},dur)
			},
			turnBack:function(note,dur){
				note.setStyle("webkitAnimationName","stickyThangNoteFlip").addClass('in-flip');
				setTimeout(function(){
					note.replaceClass("flipped"," flippingTemp2");
				},dur/2)
				setTimeout(function(){
					note.removeClass('in-flip').removeClass("flippingTemp2").setStyle("webkitAnimationName","").setData('flipped','false');
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
				'<label>Share with: <span>(commer or line seporated list)</span><textarea></textarea></label><div class="scope">Scope: <label><input type="radio" name="scope" class="path" value="path"> page</label><label><input class="domain" name="scope" type="radio" value="domain"> site</label></div>'+
			'</form>'
	},
	Note:function(result){
		var Y = stickythang.Y;
		if (result) {// it's a record from the db
			this.ops = Y.JSON.parse( result.ops );
			this.id = result.id;
			this.scope = result.scope;
			this.timestamp = result.timestamp;
			this.html = result.note;
		}
		else {
			this.ops = {
				className: stickythang.ops.className[ stickythang.util.random(0, stickythang.ops.className.length ) ],
				left: stickythang.util.random(stickythang.ops.css.left - stickythang.ops.css.leftOffset , stickythang.ops.css.left + stickythang.ops.css.leftOffset ),
				state: 'maximise',
				top: stickythang.util.random(stickythang.ops.css.top - stickythang.ops.css.topOffset , stickythang.ops.css.top + stickythang.ops.css.topOffset ) + Y.one("body").get("scrollTop"),
			}
			this.isNew = true;
			this.scope = 'domain'
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
		console.log('getAll: loading note '+ i)
		stickythang.createNoteYUI( list[i] );
    }	
}
stickythang.init = function(){
	if (stickythang.isloaded){return}
	stickythang.isloaded=true
	stickythang.user = "me";
	console.log('myStickies loading...');
	stickythang.db.init();
	var temp = localStorage.getItem(stickythang.ops.skey);
	
	
	YUI().use('node','dd-plugin','resize','json','transition', function(Y) {
		stickythang.Y  = Y;
		var settings = (temp) ? Y.JSON.parse(temp) : stickythang.ops.defultsettings ;
		
		Y.one('body').append('<div id="stickythangContainer" />')
		Y.one('body').append('<div id="stickythangButtonLayer" class="fade"><div id="stickythangFormContainer" /></div>');
		
		/*
		Y.one('#stickythangFormContainer')
			.setStyles({
				'left':settings.button.left
				,'top':settings.button.top
			})
			.setContent('<span class="handle"></span><input alt="Add sticky" title="Add sticky" type=image id="stickythangButton01" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABSNJREFUeNq0V1tsVFUUXec+5j19TGkrDW1NBaOJNkG0tDRBYwTUCj74MRr/lBg1ih8mmqDED01EDbUh6g/4JT9+gFVIAIP1EdtSLEIMCK3lMZ0ynWGm79fMnXvd59x7OzOdthiYue3OzOx75ux11957nT0MgHJqb+NhBXqLrhso5CVJDBqkIw1vdz1DHzXuU8jciqG3rH1xm+ViluXzMkyjaGe+bW/hMckmbAAuXU+Rqx649CHFVgvz+EYSuHs3dP0Q/+TKBMAEOg5CBHfQa54ZMAyTVB5DsJGmWEkvSmAkzEFohQFgpFBal8i5lQFAQ+n92ym4UpgaoP2FLQ6AmSijR01XIRjgFe7dkfNwGQzYNaDmH4DIOzNjLJkC6NSoMr3K+U8BM8z9hWEZBgxOv1ygGjBuwgBXQUnielUYAEwyYyydgpQVvEAAxL6p5bpAs1qwQCmwWn3pLphHWSgGjDSQpdtQzg+A+TZm6Q4TLC/XBQLdbQLghUZHrngQ/p4tECJZgsz9OQBsxFwHDOlWD3sKoOBiNIgD/3Th+OAopIzn37KqGDsavPBKai4APiiMDvSjJKBYWsEW9PD/Ce7Avt5j+H5oAE+vewFtjzXB7XCL2zOJaZy92onXT36JjakV2aSRVfS2Ng77AgGsaa5dIFZWcE6hri/ax4JqRcVHXYdxenwM72z7BKHxTvwdPoTI5JRYUuHz4r47nsWq4g3Yd3QXwuH4Nyd34xXelwLAmS+ahlc3rceFjj9MwbKDWpVbXrsCdQ/U0fLcPua0X4oN4o2uH7Br+x50D7YhMhHEHKW87SkT8Js/MjiJ3Ep/NTbU7ERb+we4fnnq4V8/x2/zOhC7cgpVd8koq2BwFVOelGKyAM0nAXQf7EDdQ2ssOV1Q7bIqcv5cw0s4Fz6A+HQQCpGSYNnLuC9G9/4a2o8n1j2Pg2P7P6Zbj0p2kZZVeZFISIiGgakYjU+zI8BcjHaKmzsIkbKFyjZFnKDHgxHUVBYhNHEBGu01R9lKZKSSv+c+fi84cR4ry718u2Yxj9ptIqkeBFYaiA3NIBY1yKXBVzJKcawhVbSVlC0mwqdAoduR2R5RPp9uzq2Tr7amfe/+xDA802OXucNkgP5kxUMgXAhUuaFpDPEbDFNjlHNt1KpVaUnjBE0mrgmab3aRFIi1FgCm2MXOGZCTKZGOQBUQJybiUQ4saT64REslI7sTBAOycI3MXIeL5tn3f2ZIEhWzVIStW8y1O49RXdHXVVrupjVjs6G09NjtplDPSg4PFGJCJibKOBPUJLGIpQoCgGVC6Sy1o2tzbS0iVC5Oql2PE/CReRxpnPy98DnNNTEqq+Q0emHLHiM4zFMEp8cH1eOHw+WH6vaivNoDTWe4d+OD6OvowWgoShM9jfQuvpNlqoKX6zfh/IAZTFWFSwSyL6flc6hmSf17GQj9iVZYzVJxem9jPyHxG4Y1u4l/JqrfpIoXpSkQOj9QMrIg0wI3c+C7VD963GE80mASk6QUJC3ZUGUTAK/Szh4q2Cto79iDt8gzxLcvIat77cnq5tmknWCWrZVZ0+0iYkhDn5Fkxtm1wcdr7sTWe0gyKiupSS2V0QjM8DBwsY/oD+LIL5/hPXJf5b+OmDkGw0/mTdfELV08XNHqTWisXY9XHUWon2eKoiTGce5aN77uO4HfyRMiG7OlGAv67HZmLn76lJLxE8dnqZU9702S3SCjEsSUPZ/le/SxGXWbPzLTEwEvOH4wkiUz1ew/AQYAWCLP2hYlv1wAAAAASUVORK5CYII="/>')
			.plug(Y.Plugin.Drag)
			.dd.addHandle('span.handle');
		Y.one('#stickythangFormContainer').dd.on("drag:end",function(e){
				console.log( 'drag:end ');
				stickythang.settings.save(Y,Y.one('#stickythangFormContainer'));
			})	
		Y.one('#stickythangButton01').on('click',function(e){
			stickythang.createNoteYUI(null,Y)
		})
		*/
		
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
			,height:parseInt(self.getStyle('height'))
			,left:xy[0]
			,state:self.getData('state')
			,scope:self.getData('scope')
			,top:xy[1]
			,width:parseInt(self.getStyle('width'))
		}};
		YUI().use('node','json', function(Y) {
			// console.log( Y.JSON.stringify( self.ops ) )
			ops.json = Y.JSON.stringify( ops.ops );
			ops.className = self.getData('className');
			ops.id = self.get('id');
			ops.domain = window.location.host
			ops.html = self.one("div.edit").get('innerHTML');
			ops.path = window.location.pathname
			ops.querystring = window.location.search
			ops.scope = self.getData('scope');
			ops.user = "me";
		})		
		return ops;
	},
	
    saveSoon: function()
    {
        this.cancelPendingSave();
        var self = this;
        this._saveTimer = setTimeout(function() { self.save() }, 3000);
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
	
    save: function()
    {
        this.cancelPendingSave();
/*        if ("edited" in this) {
            delete this.edited;
        }else{
			return;
		}
 */		
        var ops = this.createOps();
		
		if(this.isNew){
			console.log('adding node:'+ops.id)
			chrome.extension.sendRequest({action:"saveNew", ops:ops }, function(response) {
			  console.log(response.message)
			});				
			// stickythang.db.saveNew(ops);
			this.isNew = false;
		}else{
			console.log('updating node:'+ops.id)
			//stickythang.db.save(ops);
			chrome.extension.sendRequest({action:"save", ops:ops }, function(response) {
			  console.log(response.message)
			});					
		}

    },
	remove: function(){
		this.div.setStyle("webkitTransformOrigin","100% 0");	
		this.div.setStyle('webkitAnimationName' , 'stickyThangNoteDelete') ;	
		var id = this.div.get('id');
		console.log('remove:'+ id )
		//stickythang.db.remove(id);
		chrome.extension.sendRequest({action:"remove", id:id }, function(response) {
		  console.log(response.message)
		});			
	},
	destroy: function(){
		this.div.remove();
	}	
}


stickythang.createNoteYUI = function(result){
		console.log('trying to creat note');
		var Y = stickythang.Y;
		var note = new stickythang.Note(result);

		// console.log( Y.JSON.stringify( note.state ) )
		
		note.div.set('id',note.id)
			.addClass("stickythang")
			.addClass(note.ops.state)
			.addClass(note.ops.className)
			.setStyles({
				'height':note.ops.height
				,'left':note.ops.left
				,'top':note.ops.top
				,'width':note.ops.width
				,'z-index':stickythang.util.highestZ()
			})
			.setData('className',note.ops.className)
			.setData('scope',note.scope || 'global')
			.setData('state',note.ops.state || 'maximise')
			.setData('ops',note.ops.json)
			.setContent("<div class=card>"+stickythang.ops.template+"</div>")
			.on('click',function(){note.edited = true; note.saveSoon()})
		


		note.div.one("div.timestamp").setContent( stickythang.util.modifiedString(note.timestamp, note.isNew) );
		note.div.one("div.edit")
			.setAttribute( 'contenteditable' , 'true' )
			.set('innerHTML', note.html)
			.on('keyup',function(){note.edited=true;note.saveSoon();});
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
				note.edited = true; 
				note.save();
			}
		}, false);
		
		var instance = new Y.Resize({
			node: note.div,
			handles: 'br'
		});			
		instance.on('resize:end',function(){
			note.edited = true; 
			note.save();
		});
		function InitForm(){
			var self = this;
			self.one("input."+self.getData('scope')).setAttribute('checked','checked');
			self.one("form").on('click',function(e){
				var scope = self.one("input:checked").getAttribute("value");
				self.setData('scope',scope)
			})
			self.one('select').setContent( function(){
				var opts = "";
				for (name in stickythang.ops.className){
					if (self.getData('className') === stickythang.ops.className[name])					
						opts += "<option selected='selected'>"+ stickythang.ops.className[name] +"</option>"
					else
						opts += "<option>"+ stickythang.ops.className[name] +"</option>"
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

// stickythang.db = chrome.extension.getBackgroundPage().db;
	/*
	YUI().use('node', function(Y) {
	      Y.on("domready", function(){
		  	console.log('stickythang going down1!');
		  	stickythang.init();
		  }); 
	});
YUI().use('node', function(Y) {
	Y.on("domready", function(){
		console.log('dom is ready');
	  	// your code
	}); 
});	

 (function() {
	var yui = document.createElement('script');
	var yui2 = document.createElement('script');
	yui.src = 'http://yui.yahooapis.com/3.3.0/build/yui/yui-min.js';
	yui2.src = 'http://yui.yahooapis.com/3.3.0/build/loader/loader-min.js';
	document.documentElement.firstChild.appendChild(yui);
	document.documentElement.firstChild.appendChild(yui2);
})();


	document.addEventListener('click',function(){
		if(stickythang.isloaded) return;
		console.log('stickythnag going down1!');
		
		var yui = document.createElement('script');
		yui.src = 'http://yui.yahooapis.com/3.4.0/build/yui/yui-min.js';
		document.documentElement.firstChild.appendChild(yui);

		window.setTimeout(function() { 
			console.log('stickythang going down2!');
			stickythang.init(); 
		}, 2000)
	},false)

*/
	
	
/*
	window.setTimeout(function() { 
		console.log('stickythang going down2!');
		//stickythang.init(); 
	}, 2000)

*/
	
	
