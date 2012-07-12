/**
 * @author patcla
 */

			var background = chrome.extension.getBackgroundPage().window,
				username = background.stickythang.getLoggedInUser(),
				buddies = background.stickythang.db.getBuddies(),
				debug = 0;
			
				console.log('current user:'+username);
				
			
			YUI().use('node','yql','io-form','json-parse','node-load','transition',function(Y){
				/*
				if ( 1 || !background.stickythang.getLocalStorage('user') ){
					
					Y.one("#divUpdateUserName").setStyle("display","block");
					Y.one("#setUserName").on("submit",function(e){
						e.preventDefault();
						var u = Y.one("#userNameInput").get('value');
						background.stickythang.updateUser(u);
						Y.one("#username").set('value',u);
						Y.one("#divUpdateUserName").transition({
							duration:0.5,
							opacity:0
						},function(){
							this.remove();
						})
					});
					
				} else {
					Y.one("#username").set('value',background.stickythang.getLocalStorage('user'));
				}
				*/
				if (window.username){
					Y.one("#username").set('value',username);
				}
				var loader = {
					LoadList:function(results){
						console.log('ST!' + results.list.length)
						loader.populateList(results);
					},
					populateList:function(response){
						var rs = response.list,
							myStickies = "",
							buddiesStickies = "",
							mxlen = 140;
						for (var i = rs.length-1; i >= 0; i--) {
							var sticky = rs[i],
								note="",
								url="",
								user;
							if (!sticky.note){continue}
							note = sticky.note.replace(/<[^>]*>?/g," ");
							note = note.length > mxlen ? note.substring(0,mxlen) + "..." : note;
							url = sticky.url;
							user = sticky.user || "";
							if (note && sticky.urlex){
								buddiesStickies+= '<li><a target="_blank" class="strip" href="'+ rs[i].url +'"><span id="span'+rs[i].id+'" class="del"></span>'+ user +'; '+ note  +'</a></li>';
							} else if (note){
								myStickies+= '<li><a target="_blank" class="strip" href="'+ rs[i].url +'">'+ note  +'</a></li>';
							}
						}
						if (!myStickies){myStickies = "<li>You have no saved stickies</li>"}
						if (!buddiesStickies){buddiesStickies = "<li>No stickies found</li>"}
						Y.one("#stickyList").setContent(myStickies);
						Y.one('#ulAllList').setContent(buddiesStickies);
						// Y.one("#domainLable").setContent(response.domain)
						Y.one('#ulAllList').delegate('click',function(e){
							e.preventDefault()
							var id = e.currentTarget.getAttribute('id').substring(4),
								li = e.currentTarget.ancestor('li');
								
							li.setStyle('overflow','hidden').transition({height:0,opacity:0},function(){this.remove()})
							console.log("deleting item with id:"+id)
							background.stickythang.db.remove(id,null);
						},"span.del");
					}	
				}

				background.stickythang.db.get(loader.LoadList);

				/*
				 * TODO, make friends db and getFriends method
				
				var friends = ['tester','patrick'];
				for (var i = 0; i<friends.length ; i++ ){
					// Y.one('#myList').setContent("<div class=centre><img src='lib/i/8-0.gif' /></div>").load("http://stickythang.com/phpBB3/search.php?author=tester")
				}
				*/
				
				Y.one('#ulAllList')
					.setContent("<li id=liAllListLoading class=centre><img src='lib/i/8-0.gif' /></li>")
				
				Y.one("#addNote").on('click',function(e){
					e.preventDefault();
					chrome.tabs.getSelected(null, function(tab) {
					  chrome.tabs.sendRequest(tab.id, {action: "create-note", tabid: tab.id}, function(response) {
					    console.log(response.data);
						window.close();
					  });
					});			
				});
				Y.all("ul.menu a").on("click",function(e){
					e.preventDefault();
					var target = e.currentTarget;
					
					Y.all("ul.menu li").removeClass("active");
					target.ancestor("li").addClass("active")
					
					Y.all("div.unit").addClass("off")
					Y.one("#"+ target.get("className") ).removeClass("off");
					
				});
				Y.one("#inputHideAll").on('click',function(){
					var hide = Y.one("#inputHideAll").get("checked");
					if(hide){
						background.stickythang.stickiesActive('hide');
					} else {
						background.stickythang.stickiesActive('show');
					}
				});
				console.log(background.stickythang.getLocalStorage('stickiesActive'))
				if (background.stickythang.getLocalStorage('stickiesActive') == 'hide'){
					Y.one("#inputHideAll").set("checked","true")
				}else {
					console.log(background.stickythang.getLocalStorage('stickiesActive'))
				}
				// Y.one("#name").set("value",background.stickythang.getLocalStorage('user'));
				Y.one("#feedback").on('submit',function(e){
					e.preventDefault();
					var uri = Y.one("#feedback").getAttribute("action");
				    var cfg = {
				        method: 'POST',
				        form: {
				            id: "feedback"
				        }
				    };
				    Y.io(uri, cfg);			
					Y.one("#feedback").transition({
						    easing: 'linear',
							height:{
						        delay: 0.5,
						        duration: 0.5,
						        value: 0
						    },
						    opacity: {
						        delay: 0.5,
						        duration: 0.5,
						        value: 0
						    }
						},function(){
							Y.one("#h2feedbackthanks").setStyle("display","block").transition({
						    easing: 'linear',
						    opacity: {
						        duration: 0.5,
						        value: 1
						    }
						})
					})		
				})
				function Login(e){
					e.preventDefault();
					
					// Y.one("#loginButton").set('value',typeof background.window)
					// return;
					try {
						var v = background.stickythang.login({
							user:Y.one("#username").get('value')
							,pass:Y.one("#password").get('value')
						})
						if ( v.responseText == 'ST!invalid'){
							Y.one("#loginButton").set('value','Incorrect username or password')
						} else if ( v.responseText.match("You have been successfully logged in") ){
							Y.one("#loginButton").set('value','Login successful')
						} else if ( v.responseText.indexOf('{"user":') == 0 ) {
							var obj = Y.JSON.parse(v.responseText)
							// user aleady had a logged in session, get logged in user name
							Y.one("#loginButton").set('value','Logged in as '+obj.user);
						} else {
							Y.one("#loginButton").set('value','Could not login : ( ');
							console.log(v.responseText)
						}
						
					}catch(e){
						Y.one("#loginButton").set('value','e:'+e.message)
					}				
				}
				Y.one("#login").on('submit',Login);
	
				function CheckLoginStatus(){
					console.log('checking login status:')
					
					
					var html = "",
						u = background.stickythang.getLoggedInUser();
						
						if ( !u ){// it's a sticky thang response
							html = 'To share stickies you need to login below or <a target="_blank" href="options.html">register</a>.';
							// Y.one("#loginInputArea").setStyle('display','block');
							// Y.one('#ulAllList').setContent('<li>You need to login to see your friends stickies</li><li><a target="_blank" href="options.html">register</a></li>')
						} else {
							// html = 'Status, unknown';
							html = 'Logged in as, '+ u;
							Y.one("#loginInputArea").setStyle('display','none');
						}
						Y.one("#loginStatus").setContent(html);
				}
				CheckLoginStatus()
			});
			
			
			
			
				
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-33017882-1']);
_gaq.push(['_trackPageview']);


(function() {
	var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	ga.src = 'https://ssl.google-analytics.com/ga.js';
	var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();