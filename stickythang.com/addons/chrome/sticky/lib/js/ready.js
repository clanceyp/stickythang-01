
(function(){
	
YUI_config = {
   //  ignore : [ "querystring-stringify-simple" ]
};
		
	if (!YUI){
		console.log('ooch yui not loaded')
		return;
	}else{
		console.log('yui loaded')
		YUI().use('node','node-load','dd-plugin','resize','json','transition', function(Y) {
	
			stickythang.Y = Y;
		    stickythang.init();
			
		});
	}
	

	
})()



