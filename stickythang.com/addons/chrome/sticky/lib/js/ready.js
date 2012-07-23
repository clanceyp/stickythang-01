
(function(){
	
YUI_config = {
   //  ignore : [ "querystring-stringify-simple" ]
};
		
	if (!YUI){
		// console.log('ooch yui not loaded')
		return;
	}else{
		// console.log('yui loaded')
		YUI().use('node','node-load','dd-plugin','resize','json','transition', function(Y) {
			stickythang.Y = Y;
			stickythang.init();
		});
	}
	

	
})()


var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-33017882-1']);
_gaq.push(['_trackPageview']);


(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();




