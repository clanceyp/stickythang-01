/**
 * @author patcla
 */

			var background = chrome.extension.getBackgroundPage(),
				//user = background.stickythang.getLoggedInUser(),
				debug = true;
				background.stickythang.db.getBuddies();
				//username = user.userName;

				//console.log(user)
				//console.log('current user:'+username);
				
			
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
                        if (debug)
    						console.log('ST!' + results.list.length)
						loader.populateList(results);
					},
					populateList:function(response){
                        if (debug){
                            console.log("populateList: "+ response.list.length);
                        }
						var rs = response.list,
							myStickies = "",
							buddiesStickies = "",
							mxlen = background.stickythang.getLocalStorage('popup-list-link-mxlen',50);
						for (var i = rs.length-1; i >= 0; i--) {
                            console.log("populateList loop a: "+ i);
							var sticky = rs[i],
								note="",
								url="",
								user;
							if (!sticky.note){
                                if (debug)
                                    console.log("populateList: no sticky.note "+ i);
                                continue;
                            }
                            console.log("populateList loop b: "+ i);
							note = sticky.note.replace(/<[^>]*>?/g," ");
							note = note.length > mxlen+3 ? note.substring(0,mxlen) + "..." : note;
							url = (sticky.url.indexOf("#") > 0) ? sticky.url : sticky.url + "#" + sticky.id;
							user = sticky.user || "me";
                            console.log("populateList loop c: "+ i);
                            if (!note){
                                if (debug)
                                    console.log("populateList: no note "+ i);
                                continue;
                            }
                            console.log("populateList loop d: "+ i);
                            if (user == 'me' || user == background.stickythang.getLocalStorage('userName')){
                                myStickies+= '<li><a target="_blank" class="strip" href="'+ url +'">'+ note  +'</a></li>';
                                if (debug)
                                    console.log("populateList: note is current user "+ user);
                            } else if (sticky.urlex){
								buddiesStickies+= '<li><a target="_blank" class="strip" href="'+ url +'"><span id="span'+rs[i].id+'" class="del"></span>'+ user +'; '+ note  +'</a></li>';
                                if (debug)
                                    console.log("populateList: shared note is "+ user);
							} else {
								myStickies+= '<li><a target="_blank" class="strip" href="'+ url +'">'+ note  +'</a></li>';
                                if (debug)
                                    console.log("populateList: note is "+ user);
							}
						}
						if (!myStickies){
                            myStickies = "<li>You have no saved stickies</li>";
                            if (debug)
                                console.log("populateList: no stickies ");
                        } else {
                            if (debug)
                                console.log("populateList: stickies ");
                        }
						if (!buddiesStickies){
                            buddiesStickies = "<li>It looks like no one has shared any stickies! : (</li>";
                            if (debug)
                                console.log("populateList: no buddiesStickies ");
                        } else {
                            if (debug)
                                console.log("populateList: buddiesStickies ");
                        }
						if (!background.stickythang.getBuddyList()){
                            buddiesStickies = '<li>You are not following anyone. <a target="_blank" href="options.html">Find friends</a></li>';
                            if (debug)
                                console.log("populateList: no buddies ");
                        } else {
                            if (debug)
                                console.log("populateList: buddies ");
                        }
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

	
				function CheckLoginStatus(){
					console.log('checking login status:')
					
					
					var html = "",
						u = background.stickythang.getLoggedInUser();
						
						if ( !u || !u.name | !u.id ){// it's a sticky thang response
							html = 'To share stickies you need to login.';
							// Y.one("#loginInputArea").setStyle('display','block');
							// Y.one('#ulAllList').setContent('<li>You need to login to see your friends stickies</li><li><a target="_blank" href="options.html">register</a></li>')
						} else {
							// html = 'Status, unknown';
							html = '<span>Logged in as, '+ u.name +'</span>';
							Y.one("#loginInputArea").setStyle('display','none');
						}
						if (u.img){
							var img = new Image();
							img.src = u.img;
							img.onerror = function(){this.parentNode.removeChild(this)}
							Y.one("#loginStatus").append(img)
						}
						Y.one("#loginStatus").append(html)
				}
				CheckLoginStatus()
			});




function receiveMessage(message){
	if ( /^https?:\/\/www\.stickythang\.com/.test(message.origin)){
		if (message.data.action === "login"){
			location.reload();
		} else if (message.data.action === "logout"){
			location.reload();
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