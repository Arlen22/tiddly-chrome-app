//https://developer.chrome.com/extensions/manifest/sandbox
//https://developer.chrome.com/apps/app_external
//https://developer.chrome.com/apps/tags/webview
//$:/core/modules/browser-messaging.js
//chrome://inspect/#apps
//https://developer.chrome.com/apps/tags/webview#type-ContentWindow

//TODO:
//Investigate context menu
//Open inspector with button
//Show webview#src in hashQuery box when it get's changed
//

(function(){

    var currentFileEntry;
    var webview;
    window.onload = function(event){
        chrome.runtime.getBackgroundPage(function(backgroundPage){

            console.log(event);
            document.getElementById('reload').onclick = loadWebview;
            document.getElementById('load').onclick = loadFile;

            webview = document.getElementById('webview');
            webview.addEventListener('contentload', function() {
                if(webview.src == "about:blank") return;

                webview.contentWindow.postMessage({ message: 'welcome-tiddly-chrome-file-saver' }, window.location.origin);

                //TODO: show a popup warning that the saver isn't activated yet. If the TW doesn't have the saver,
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
                    case 0:  backgroundPage.console.log('Webview:', e.message); break;
                    case 1:  backgroundPage.console.warn('Webview:', e.message); break;
                    case 2:  backgroundPage.console.error('Webview:', e.message); break;
                    default: break;
                }
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
    function loadWebview(){
        var hashQuery = document.getElementById('hashQuery').value;
        currentFileEntry.file(function(file) {
            webview.src = URL.createObjectURL(file)+'#'+hashQuery;
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
            var endPopup = function(){
                for(var i = 0; i < lightbox.length; i++){ lightbox[i].style.display = "none"; }
                chrome.app.window.current().clearAttention();
            };
            if(clickEvent.target.id == "popupCancel" || clickEvent.target.id == "popupNo"){
                e.dialog.cancel();
                endPopup();
            } else if (clickEvent.target.id == "popupOK" || clickEvent.target.id == "popupYes"){
                e.dialog.ok(e.messageType == "prompt" ? document.getElementById('popupText').value : null);
                endPopup();
            }
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


    };
    window.addEventListener('message', function(event){
        console.log(event);
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
        else if(event.data.message === 'thankyou-file-tiddly-chrome-file-saver'){
            //remove the popup window here that is shown on load
        }

    });

    window.alert = function(text){
        showPopup({messageType: 'alert', messageText: text, dialog : { cancel : function(){}, ok: console.log.bind(console) }, preventDefault: function(){} });
    }

})();
