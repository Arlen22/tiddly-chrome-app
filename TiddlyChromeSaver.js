/*\
title: $:/plugins/Arlen22/tiddly-chrome/saver.js
type: application/javascript
module-type: saver

As always, remember to backup your data.

\*/

(function(){

/*jslint node: true, browser: true */
/*global $tw: false, netscape: false, Components: false */
"use strict";

var messageId = 1;

var TiddlyChromeSaver = function(wiki) {
    var self = this;
    window.addEventListener('message', function(event){
        if(event.data.message === "welcome-tiddly-chrome-file-saver"){ 
            self.postToParent = event.source.postMessage.bind(event.source);
            self.parentOrigin = event.origin;
            self.postToParent({ message: 'thankyou-tiddly-chrome-file-saver' }, event.origin);
        } else if (event.data.message === "file-saved-tiddly-chrome-file-saver"){
            self.pendingSaves[event.data.id](event.data.error);
            delete self.pendingSaves[event.data.id];
        }
        
    });
    this.pendingSaves = {};
};

TiddlyChromeSaver.prototype.save = function(text,method,callback) {
    if(this.postToParent){
        this.postToParent({ message: 'save-file-tiddly-chrome-file-saver', data: text, id: messageId }, this.parentOrigin);
        this.pendingSaves[messageId] = callback;
        messageId++;
        return true;
    } else {
        return false;
    }
    
};

/*
Information about this saver
*/
TiddlyChromeSaver.prototype.info = {
    name: "tiddlychrome",
    priority: 1500,
    capabilities: ["save", "autosave"]
};

/*
Static method that returns true if this saver is capable of working
*/
exports.canSave = function(wiki) {
    
    return (window.location.protocol === "blob:");
};

/*
Create an instance of this saver
*/
exports.create = function(wiki) {
    return new TiddlyChromeSaver(wiki);
};

})();
