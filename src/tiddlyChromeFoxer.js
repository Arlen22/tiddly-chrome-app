/*
Parent: welcome-tiddly-chrome-file-saver
    Child: thankyou-tiddly-chrome-file-saver
    
Child: save-file-tiddly-chrome-file-saver
    Parent: file-saved-tiddly-chrome-file-saver

	
chrome.runtime.getURL('emergencySaver.js')
*/
(function(){

//TiddlyFox inject.js https://github.com/TiddlyWiki/TiddlyFox/blob/1.0alpha18/content/inject.js
	//var window = window;
    var injectedSaveFile = function(path,content) {
		return saver(content, "save", function(){
			(displayMessage || alert)(config.messages.mainSaved || "File saved");
		});
		
        // Find the message box element
        var messageBox = document.getElementById("tiddlyfox-message-box");
        if(messageBox) {
            // Create the message element and put it in the message box
            var message = document.createElement("div");
            message.setAttribute("data-tiddlyfox-path",path);
            message.setAttribute("data-tiddlyfox-content",content);
            messageBox.appendChild(message);
            // Create and dispatch the custom event to the extension
            var event = document.createEvent("Events");
            event.initEvent("tiddlyfox-save-file",true,false);
            message.dispatchEvent(event);
        }
        return true;
    };
    var injectedLoadFile = function(path) {
        try {
            // Just the read the file synchronously
            // Pretty sure this won't work in chrome
            var xhReq = new XMLHttpRequest();
            xhReq.open("GET", "file:///" + escape(path), false);
            xhReq.send(null);
            return xhReq.responseText;
        } catch(ex) {
            return false;
        }
    };
    var injectedConvertUriToUTF8 = function(path) {
        return path;
    }

    var injectedConvertUnicodeToFileFormat = function(s) {
        return s;
    }

    //TiddlyWiki Classic?
    window.mozillaSaveFile = injectedSaveFile;
    window.mozillaLoadFile = injectedLoadFile;
    window.convertUriToUTF8 = injectedConvertUriToUTF8;
    window.convertUnicodeToFileFormat = injectedConvertUnicodeToFileFormat;

    //End TiddlyFox inject.js ========================================================
    
	
	
    var pendingSaves = {};
    var messageId = 1;
    window.addEventListener('message', function(event){
        console.log(event, this);
        if(event.data.message === "welcome-tiddly-chrome-file-saver"){ 
            window.postToParent = event.source.postMessage.bind(event.source);
            window.parentOrigin = event.origin;
            window.postToParent({ message: 'thankyou-tiddly-chrome-file-saver' }, event.origin);
        } else if (event.data.message === "file-saved-tiddly-chrome-file-saver"){
            pendingSaves[event.data.id](event.data.error);
            delete pendingSaves[event.data.id];
        } else if (event.data.message === "onbeforeunload-tiddly-chrome-file-saver"){
            //I wish...
            //event.source.postMessage({message: 'onbeforeunload-tiddly-chrome-file-saver', data: window.onbeforeunload ? window.onbeforeunload(null) : null }, event.origin);
        }
    });
    

	var saver = function( text, method, callback, options ){
		console.log('saving', window.postToParent);
		if (window.postToParent){
			window.postToParent({ message: 'save-file-tiddly-chrome-file-saver', data: text, id: messageId }, window.parentOrigin);
			pendingSaves[messageId] = callback;
			messageId++;
			return true;
		} else {
			return false;
		}
	};
	
	$tw.saverHandler.savers.push({
		info: {
			name: "tiddly-chrome-saver",
			priority: 5000,
			capabilities: ["save", "autosave"]
		},
		save: saver
	});
	console.log("send-welcome-tiddly-chrome-file-saver");

})();
