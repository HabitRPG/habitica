'use strict';

/**
 * Phonegap events
 *
 */

 if (typeof cordova != 'undefined') {
 	// the second parameter is the callback to be called
 	document.addEventListener("online",  yourCallbackFunction, false);
 	document.addEventListener("offline", yourCallbackFunction, false);
 	document.addEventListener("resume",  yourCallbackFunction, false);
 	document.addEventListener("pause",   yourCallbackFunction, false);
 }
