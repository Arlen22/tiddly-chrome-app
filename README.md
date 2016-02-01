# TiddlyChrome
A Google Chrome App that saves TW changes back to File System. 

Feel free to give input or open pull requests.

##Todo
 - Have the saver send all changes as a temp-save message the parent window, which sends it to the background page (via a function call) to be saved in case the window closes. If and when the window closes and there are significant unsaved changes, another window should popup saying that there were unsaved changes and show the user the list of tiddlers which had unsaved changes. It should also let them download the JSON as a file, which can be dragged back into the TiddlyWiki if they still want some of the information.
 - Have background page add function to the `window.contentWindow` to be called when there are temp changes to be saved or cleared. Probably a zero length string to clear it.

Hat tip to TiddlyFox for the TWC code skelaton and other ideas.
