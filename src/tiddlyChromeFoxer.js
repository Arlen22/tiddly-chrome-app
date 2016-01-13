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
function(path,content) {
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
