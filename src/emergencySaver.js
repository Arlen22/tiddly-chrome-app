(function(){

    
    var postToParent = null;
    var postToOrigin = null;
    
    window.addEventListener('tiddly-chrome-file-saver', function(event){
        console.log(event);
        //var post = { message: event.detail.message };
        
        if(postToParent) postToParent( event.detail, postOrigin);
    });
    window.addEventListener('message', function(event){
        console.log(event);
        if(event.data.message === 'welcome-tiddly-chrome-file-saver'){
            postToParent = event.source.postMessage.bind(event.source);
            postOrigin = event.origin;
            console.log('saving in emergency');
            
        }
        else if (event.data.message === "onbeforeunload-tiddly-chrome-file-saver"){
            window.
            event.source.postMessage({message: 'onbeforeunload-tiddly-chrome-file-saver', data: window.onbeforeunload ? window.onbeforeunload(null) : null }, event.origin);
        }
    });
    var el = document.createElement('script');
    el.innerHTML = "if(typeof($tw) !== 'undefined') $tw.wiki.addEventListener('change', function(data){ " +
"var event = new CustomEvent('tiddly-chrome-file-saver', { detail: { message: 'temp-save-file-tiddly-chrome-file-saver', data: $tw.macros.jsontiddlers.run.call($tw, '[haschanged[]]') }}); " +
"window.dispatchEvent(event); }); else console.log('no $tw');";
    document.body.appendChild(el);
})();
