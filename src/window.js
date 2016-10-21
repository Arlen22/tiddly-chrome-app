//https://developer.chrome.com/extensions/manifest/sandbox
//https://developer.chrome.com/apps/app_external
//https://developer.chrome.com/apps/tags/webview
//$:/core/modules/browser-messaging.js
//chrome://inspect/#apps
//https://developer.chrome.com/apps/tags/webview#type-ContentWindow

//TODO: 
//

(function(){

    var currentFileEntry;
    var webview;
	var fileNotSavingWarning = null;
    window.onload = function(event){
		
		var post = function(){ webview.contentWindow.postMessage({ message: 'welcome-tiddly-chrome-file-saver' }, window.location.origin); };
		var postRecieved = false;
        chrome.runtime.getBackgroundPage(function(backgroundPage){

            console.log(event);
            document.getElementById('reload').onclick = loadWebview;
            document.getElementById('load').onclick = loadFile;

            webview = document.getElementById('webview');
            webview.addEventListener('contentload', function() {
                if(webview.src == "about:blank") return;

				var code2 = "var tag = document.createElement('script'); tag.src = '" + location.origin + "/tiddlyChromeFoxer.js';  document.body.appendChild(tag); ";
				webview.executeScript({code: code2 }, function (){
					console.log('contentload done, welcome coming');
				});
				
				postRecieved = false;
				
                //      show a popup warning that the saver isn't activated yet. If the TW doesn't have the saver,
                //      the user should not use this chrome app for editting TW, as it does not ask before closing.
                //      We could inject a script to listen to wiki messages, but that's better done from inside TW.
				
				

            });
            webview.addEventListener('newwindow', function(e) {
                e.preventDefault();
                window.open(e.targetUrl);
            });
            webview.addEventListener('consolemessage', function(e){
                switch(e.level){
                    case -1: backgroundPage.console.debug('Webview:', e.message); break;
                    case 0:  backgroundPage.console.log('Webview:', e.message); if(e.message === "send-welcome-tiddly-chrome-file-saver") post(); break;
                    case 1:  backgroundPage.console.warn('Webview:', e.message); break;
                    case 2:  backgroundPage.console.error('Webview:', e.message, e); break;
                    default: break;
                }
				backgroundPage.console.debug('Webview-', e.sourceId, e.line);
            });
            webview.addEventListener('dialog', showPopup);
            webview.addEventListener('exit', function(e) {
              
                webview.src = 'data:text/plain,Goodbye, world! reason:' + e.reason;
              
            });
            webview.addEventListener('close', function() {
               
                webview.src = 'about:blank';
                
                
            });
            webview.addEventListener('permissionrequest', function(e) {
              switch (e.permission) {
                case "download": e.request.allow(); break;
                case "fullscreen": e.request.allow(); break;
				case "filesystem": e.request.allow(); break;
              }
              console.log(e);
            });
            webview.style.webkitTransition = 'opacity 250ms';
            webview.addEventListener('unresponsive', function() {
                webview.style.opacity = '0.5';
            });
            webview.addEventListener('responsive', function() {
                webview.style.opacity = '1';
            });
            webview.addEventListener('loadcommit', function(e) {
                document.getElementById('hashQuery').value = webview.src.indexOf('#') > -1 ? webview.src.substr(webview.src.indexOf('#') + 1) : '';
            });
            if(window.tiddlyChromeAutoOpen) {
                currentFileEntry = window.tiddlyChromeAutoOpen;
                loadWebview();
            } else { 
                loadFile(); 
            }
			
            webview.canGoBack = false;
            webview.canGoForward = false;
        })
    };
	function blobToDataURL(blob, callback) {
		var a = new FileReader();
		a.onload = function(e) {callback(e.target.result);}
		a.readAsDataURL(blob);
	}
    function loadWebview(){
        var hashQuery = document.getElementById('hashQuery').value;
        currentFileEntry.file(function(file) {
            webview.src = URL.createObjectURL(file)+'#'+hashQuery;
			//This didn't work
			/*blobToDataURL(file, function(data){
				webview.loadDataWithBaseUrl(data, chrome.runtime.getURL('index'), 'file:///fakepath' + currentFileEntry.fullPath);
			})*/
			
        });
        
    }
    function loadFile(){
        chrome.fileSystem.chooseEntry(
            {
                type: 'openWritableFile', 
                accepts:[{
                    extensions: ['html']
                }] 
            }, 
            function(fileEntry) {
                
                if (!fileEntry) {
                    return;
                }
                
                currentFileEntry = fileEntry;
                console.log(fileEntry);
                loadWebview();
                
            }
        );  
    };
	
    function showPopup(e){
        console.log(e);
        e.preventDefault();
        
        var lightbox = document.getElementsByClassName('lightbox');
        for(var i = 0; i < lightbox.length; i++){ lightbox[i].style.display = "block"; }
        
        var items = {};
        function setDisplay(hides){
            ['popupYes', 'popupNo', 'popupOK', 'popupCancel'].forEach(function(e,i){
                if(hides.indexOf(e) > -1) items[e].style.display = "inline-block";
                else items[e].style.display = "none";
            });
        }
        function clicker(clickEvent){
            console.log(clickEvent);
            if(clickEvent.target.id == "popupCancel" || clickEvent.target.id == "popupNo"){
                e.dialog.cancel();
            } else if (clickEvent.target.id == "popupOK" || clickEvent.target.id == "popupYes"){
                e.dialog.ok(e.messageType == "prompt" ? document.getElementById('popupText').value : null);
            } 
			for(var i = 0; i < lightbox.length; i++){ lightbox[i].style.display = "none"; }
			chrome.app.window.current().clearAttention();
        };
        ['popupYes', 'popupNo', 'popupOK', 'popupCancel'].forEach(function(e,i){
            items[e] = document.getElementById(e);
            items[e].onclick = clicker;
        });
        
        if(e.messageType === 'alert'){
            setDisplay(['popupOK']);
        } else if(e.messageType === 'confirm'){
            setDisplay(['popupOK','popupCancel']);
            //setDisplay(['popupYes', 'popupNo']);
        } else if(e.messageType === 'prompt'){
            setDisplay(['popupOK','popupCancel']);
        }
        chrome.app.window.current().drawAttention();
        document.getElementById('popupText').value = e.defaultPromptText;
        document.getElementById('popupText').style.display = e.messageType === 'prompt' ? 'inline-block' : 'none';
        document.getElementById('popupLabel').innerText = e.messageText;
		
        if(typeof(e.cancelable) !== "undefined" && e.cancelable) 
			return { 
				cancel: function cancel(){
					if(e.dialog) e.dialog.cancel();
					for(var i = 0; i < lightbox.length; i++){ lightbox[i].style.display = "none"; }
					chrome.app.window.current().clearAttention();
				}
			}
    };
	function showPopupDialog(type, message, prompt, ok, cancel){
		if(['alert', 'confirm', 'prompt'].indexOf(type) === -1) throw "type must be one of alert, confirm, prompt";
		return showPopup({
			messageType: type,
			messageText: message,
			defaultPromptText: prompt || "",
			dialog: { 
				ok: ok || function(){},
				cancel: cancel || function(){}
			},
			preventDefault: function(){},
			cancelable: true
		});
	}
    window.addEventListener('message', function(event){
        console.log(event);
		console.log(event.data.message);
        if(event.data.message === 'save-file-tiddly-chrome-file-saver'){
            currentFileEntry.createWriter(function(writer) {
                writer.onerror = function(error){
                    event.source.postMessage({ message: 'file-saved-tiddly-chrome-file-saver', id: event.data.id, error: error }, window.location.origin);
                };
                writer.onwriteend = function(e){
                    if(writer.length === 0) writer.write(new Blob([event.data.data]));
                    else event.source.postMessage({ message: 'file-saved-tiddly-chrome-file-saver', id: event.data.id, error: null }, window.location.origin);
                };
                writer.truncate(0);
                
                
            });
        }
        else if(event.data.message === 'temp-save-file-tiddly-chrome-file-saver'){
            //do something with the temp save data
        }
        else if(event.data.message === 'thankyou-tiddly-chrome-file-saver'){
			postRecieved = true;

			if(!event.data.isTW5){
				alert("TiddlyChrome could not add the saver. " + 
					  "It cannot save any changes. Clicking the " + 
					  "save button should trigger a download with " + 
					  "a funny name in a regular chrome window. \r\n\r\n" +
					  "It is not recommended to use TiddlyChrome to " + 
					  "edit this file because it will not warn you " + 
					  "about unsaved changes before closing. If you " + 
					  "need to type in a password, go ahead and do that. \r\n\r\n" + 
					  "TiddlyChrome will keep trying to add the saver and will " + 
					  "notify you when it is successful");
			}
        }
		else if(event.data.message === 'update-tiddly-chrome-file-saver'){
			if(event.data.TW5SaverAdded){
				alert("The saver for TW5 has now been added. Changes in TW5 will now be saved as usual.");
			}
        }
        
    });
    
    window.alert = showPopupDialog.bind(this, 'alert');

})();
