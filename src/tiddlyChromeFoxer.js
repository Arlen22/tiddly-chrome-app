/*
Parent: welcome-tiddly-chrome-file-saver
    Child: thankyou-tiddly-chrome-file-saver
    
Child: save-file-tiddly-chrome-file-saver
    Parent: file-saved-tiddly-chrome-file-saver
	
chrome.runtime.getURL('emergencySaver.js')
*/
(function(){
    document.body.style.overflow = 'auto';
    document.getElementsByTagName("html")[0].style.overflow = "auto";
    //TiddlyFox inject.js https://github.com/TiddlyWiki/TiddlyFox/blob/1.0alpha18/content/inject.js
    //var window = window;
    var injectedSaveFile = function(path,content) {
		return saver(content, "save", function(){
			(displayMessage || alert)(config.messages.mainSaved || "File saved");
		});
		
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
    //window.mozillaSaveFile = injectedSaveFile;
    //window.mozillaLoadFile = injectedLoadFile;
    //window.convertUriToUTF8 = injectedConvertUriToUTF8;
    //window.convertUnicodeToFileFormat = injectedConvertUnicodeToFileFormat;
	//Not for now. Paths aren't recognized, which could be bad.
    //End TiddlyFox inject.js ========================================================
    
	
	var isTW5 = false;
	var isTWC = false;
	var thankyouSent = false;
    var pendingSaves = {};
    var messageId = 1;
    window.addEventListener('message', function(event){
        console.log(event, this);
        if(event.data.message === "welcome-tiddly-chrome-file-saver"){ 
            window.postToParent = event.source.postMessage.bind(event.source);
            window.parentOrigin = event.origin;
            window.postToParent({ message: 'thankyou-tiddly-chrome-file-saver', isTWC: isTWC, isTW5: isTW5  }, event.origin);
			thankyouSent = true;
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
	var saverObj = {
		info: {
			name: "tiddly-chrome-saver",
			priority: 5000,
			capabilities: ["save", "autosave"]
		},
		save: saver
	};
	function addSaver(){
		if($tw.saverHandler && $tw.saverHandler.savers) {
			$tw.saverHandler.savers.push(saverObj);
			isTW5 = true;
			if(thankyouSent) 
				window.postToParent({message: 'update-tiddly-chrome-file-saver', TW5SaverAdded: true }, window.parentOrigin);
		} else {
			setTimeout(addSaver, 1000);
		}
	}
	if(typeof($tw) !== "undefined" && $tw)
		addSaver();
	
	//if(version.title === "TiddlyWiki" && version.major === 2){
	//	isTWC = true;
	//}
	
	console.log("send-welcome-tiddly-chrome-file-saver");
	
	

})();
