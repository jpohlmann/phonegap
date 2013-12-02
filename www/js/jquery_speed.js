$(document).ready(function(){
	UtilDom = new Object();
	//Logging purposes
	UtilDom.TAG = "UtilDom.JS: ";
	//Cached references
	UtilDom.CACHED_REFERENCES = new Object()

	/**
	 * get returns the requested dom element or the one in cache if already known.
	 * @param jqueryId the jqueryId
	 */
	UtilDom.get = function(jqueryId) {		
		var cachedElement = UtilDom.CACHED_REFERENCES[jqueryId];
		if (cachedElement) {
			return cachedElement;
		} else
			UtilDom.CACHED_REFERENCES[jqueryId] = $(jqueryId);
			return UtilDom.CACHED_REFERENCES[jqueryId];
	}
});