/**
 * @author patcla
 */
	var background = chrome.extension.getBackgroundPage();
		background.stickythang.checkLoggedInUser();

		if (!background.stickythang.db.localdb){
			background.stickythang.db.init();
		}		
		if (!background.stickythang.db.listBuddies.length){
			background.stickythang.db.getBuddies();
		}
		// background.stickythang.db.updateShare();
		var stickythang = {
			setUserDetails:function(ops){
				alert(ops.user +"-"+ops.pass);
			}
			
		}
		
		
		YUI().use('node','yql','json-parse','node-load',"io-form","transition",function(Y){
			window.Y = Y;
			Y.all("ul.menu a").on("click",function(e){
				e.preventDefault();
				var target = e.currentTarget;
				
				Y.all("ul.menu li").removeClass("active");
				target.ancestor("li").addClass("active")
				
				Y.all("div.unit").addClass("off")
				Y.one("#"+ target.get("className") ).removeClass("off");
				
				if (target.get("className") == "Options"){
					BuildBuddyList();
				}
				
			});		
			
			function onFailure(transactionid, response, arguments) {
			   console.log('not good'+ response.responseText)
			}
			// Subscribe to "io.failure".
			Y.on('io:failure', onFailure, Y, 'Transaction Failed');
			
			function onSuccess(transactionid, response, arguments) {
			   console.log('good:'+ response.responseText.match("You have been successfully logged in") +"\n\n"+ response.responseText)
			}	
			Y.on('io:success', onSuccess, Y, true);		
				
			function sendFeedback(){

				Y.one("#divFeedback").transition({
				    duration: 0.75, // seconds
				    opacity: '0'
				},function() {
				   Y.one("#divFeedbackThanks").setStyles({'position':'absolute','display':'block','opacity':'0'}).transition({
				   		duration:0.3,
						opacity:1
				   })
				})
				
				var uri = "http://www.stickythang.com/contact";
			    var cfg = {
			        method: 'POST',
					sync: false,
			        form: {
						id : Y.one("#formSettings")
			        }
			    };
				Y.io(uri, cfg);
			}
			Y.one('#buttonFeedback').on('click',sendFeedback);
			
			
			
			
			var updateShare = function(){
				var dataverson = localStorage.dataversion;
				var uri = "",
					cfg = {
				        sync: true
				    };
				//var request = Y.io(uri, cfg);
				var obj = {
					"1":{
						"label":"all1"
						,"url":"http://something.php?id=1"
					},
					"2":{
						"label":"all2"
						,"url":"http://something.php?id=2"
					},
					"3":{
						"label":"all3",
						"url":"http://something.php?id=3"
					},
					"4":{
						"label":"all4"
						,"url":"http://something.php?id=4"
					}
				};
				
				var temp = '{"1":{"id":"1","label":"all1","url":"http://something.php?id=1"},"2":{"id":"2","label":"all2","url":"http://something.php?id=2"},"3":{"id":"3","label":"all3","url":"http://something.php?id=3"},"4":{"id":"4","label":"all4","url":"http://something.php?id=4"}}';
				
				var shareRS = Y.JSON.parse(temp);
				var rs = "",
					temp1;
					
				rs = shareRS[name];
				trans.executeSql("delete * from "+ stickythang.db.tableName +"_share");
	            trans.executeSql("INSERT INTO "+ stickythang.db.tableName +"_share (id, label, url) VALUES (?, ?, ?)", 
					[rs.id, rs.label, rs.url]);
				
				for (name in shareRS){
					temp1 = shareRS[name]
					rs+= name+":"+ temp1.label +"-" + temp1.url
				}
				alert(rs);
			}
			
			
			/* buddies bit */
			function BuildBuddyList(ops){
				// background.stickythang.db.getBuddies();
				if (ops && ops.message){
					console.log('build buddy list:'+ ops.message)
				}
				window.listBuddies = background.stickythang.db.listBuddies;
				if (!Y.one("#ulBuddiesList li")){
					stickythang.buildHTMLList(background.stickythang.db.listBuddies);
				}
			}
			stickythang.buildHTMLList = function(friends){
				Y.one("#ulBuddiesList").empty()
				var f = _.sortBy(friends, function(item){return item.name.toLowerCase()})
				for (var i = 0; i<f.length; i++){
					var o = f[i];
					if (o.name && o.id && o.name.indexOf("<") !== 0){
						if (background.stickythang.isBuddy(o.id)){
							Y.one("#ulBuddiesList").append('<li id="li-'+ o.id+'" class="isBuddy"><span class="toggle"></span>'+ o.name.replace("<","&lt;") +'</li>')
						} else {
							Y.one("#ulBuddiesList").append('<li id="li-'+ o.id+'"><span class="toggle"></span>'+ o.name +'</li>')
						}
					}
				}
			}
			function UpdateBuddyList(buddy){
					//var buddy = Y.one("#inputAddBuddy").get('value');
					// console.log('buddy:'+ buddy)
					//alert('trying to remove')
					//if (true){return}
					Y.one("#inputFriendsOnly").set('checked',false)
					if (background.stickythang.isBuddy( buddy )){
						Y.one("#li-"+ buddy.id).transition({height:0},function(){this.remove()});
						background.stickythang.db.removeBuddy( buddy , BuildBuddyList )
					}else{
						console.log('is NOT buddy:'+ buddy)
						background.stickythang.db.saveNewBuddy( buddy , BuildBuddyList )
					}
					
				
			}
			function RemoveBuddy(e){
				var target = e.target,
					id = target.get("id").substring(3);
				alert('depricated')
				return;
				background.stickythang.db.removeBuddy( buddy , BuildBuddyList );
			}
			function ToggleBuddy(e){
				var target = e.target,
					id = target.get("id").substring(3),
					buddy = _.find(window.friends, function(item){return item.id == id})
				if (!buddy){
					buddy = _.find(window.listBuddies, function(item){return item.id == id})
				}
				if (!buddy){
					console.log("No friend found with id: "+id)
					return;
				}
				target.toggleClass('isBuddy');
				UpdateBuddyList(buddy);

			}
			Y.one("#buttonUpdateBuddies").on('click',UpdateBuddyList);
			//Y.one("#ulBuddiesList").delegate("dblclick", RemoveBuddy, "li");
			Y.one("#ulBuddiesList").delegate("click", ToggleBuddy, "li");
			
			Y.one("#formSettings").on("submit",function(e){
				e.preventDefault();
				UpdateBuddyList();
			})
			Y.one("#inputFriendsOnly").on('click',function(e){
				Y.one("#ulBuddiesList").empty()
				BuildBuddyList();
			})
		})


function receiveMessage(message){
	if ( /^https?:\/\/www\.stickythang\.com/.test(message.origin)){
		if (message.data.action === "load-friends"){
			window.friends = message.data.friends;
			/*
			Y.one("#ulBuddiesList").empty()
			var f = _.sortBy(message.data.friends, function(item){return item.name.toLowerCase()})
			for (var i = 0; i<f.length; i++){
				var o = f[i];
				if (o.name && o.id && o.name.indexOf("<") !== 0){
					if (background.stickythang.isBuddy(o.id)){
						Y.one("#ulBuddiesList").append('<li id="li-'+ o.id+'" class="isBuddy"><span class="toggle"></span>'+ o.name.replace("<","&lt;") +'</li>')
					} else {
						Y.one("#ulBuddiesList").append('<li id="li-'+ o.id+'"><span class="toggle"></span>'+ o.name +'</li>')

				}
			}*/
			stickythang.buildHTMLList(window.friends);
		} else if (message.data.action === "login"){
			console.log(message.data.id +": "+ message.data.name);
		} else if (message.data.action === "loginout"){
			console.log('logged out');
		} else {
			console.log('unsupported request')
		}
	}else{
		console.log(message.origin)
		console.log('This domain is not permitted to post messages')
	}
}
window.addEventListener("message",receiveMessage,false);
		
		

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-33017882-1']);
_gaq.push(['_trackPageview']);


(function() {
	var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	ga.src = 'https://ssl.google-analytics.com/ga.js';
	var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();