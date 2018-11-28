Note: Chrome developers have announced that Chrome Apps are being phased out. Apps are no longer available from the Chrome Web Store, but can still be installed using the method outlined below. Because of this I am not planning to continue maintaining this app other than fixing any breaking changes that may come along. They have not yet announced when they are removing support completely, so until then I will try to keep it usable. 

# TiddlyChrome
A Google Chrome App that saves TW changes back to File System. 

It might even work in Chrome OS, although I have not tested it. Any feedback is welcome.

Feel free to give input or open pull requests.

TWC is not supported currently. See https://github.com/Arlen22/tiddly-chrome-app/issues/12

## Installation
To install, go to https://github.com/Arlen22/tiddly-chrome-app/releases and download the crx file from the latest release. Then follow the instructions in the link below to install.

http://www.tech-recipes.com/rx/47717/chrome-apps-extensions-and-user-scripts-cannot-be-added-from-this-website/

Once you have it installed, go to chrome://apps to open it. It works different than TiddlyFox in this way.

## Todo
 - Have the saver send all changes as a temp-save message the parent window, which sends it to the background page (via a function call) to be saved in case the window closes. If and when the window closes and there are significant unsaved changes, another window should popup saying that there were unsaved changes and show the user the list of tiddlers which had unsaved changes. It should also let them download the JSON as a file, which can be dragged back into the TiddlyWiki if they still want some of the information.
 - Have background page add function to the `window.contentWindow` to be called when there are temp changes to be saved or cleared. Probably a zero length string to clear it.

Hat tip to TiddlyFox for the TWC code skelaton and other ideas.
