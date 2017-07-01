/* global toastr:false, moment:false */
(function() {
    'use strict';

    var __env = {};

	// Import variables if present (from env.js)
	if (window) {  
        __env = window.__env;
	   //Object.assign(__env, window.__env);
	}

    angular
        .module('app.core')
	    .constant("LANGUAGES",["en","de","fr","es","ru","bg","zh","hr","cs","da","nl","et","fi","el","he","hu","it","ja","ko","lv","lt","no","pl","pt","ro","sl","sv","tw","tr"])
        .constant("TIMEZONES", ["US/Hawaii","America/Los_Angeles","America/Denver","America/Chicago","America/New_York","America/Sao_Paulo","Europe/Lisbon","Europe/London","Europe/Berlin","Europe/Madrid","Europe/Paris","Africa/Johannesburg","Europe/Moscow","Asia/Taipei","Asia/Seoul","Australia/Melbourne"])
        .constant("__env", __env)
   	;
})();