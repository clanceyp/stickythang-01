
(function(){
	

		
	if (!YUI){
		console.log('ooch yui not loaded')
		return;
	}
	YUI().use('node', function(Y) {

	    function init() {
	        // The DOM is ready, lets say hello!
	        stickythang.init();
	    }
	 
	    Y.on("domready", init); 
	});
	

	
})()



