## 0.4
### Features added
* The TiddlyChromeSaver TW5 plugin is no longer required.
* UNTESTED TiddlyWiki classic support was added, but not tested in any way. It may not work correctly.
* TiddlyChrome inserts its own saver into the saverhandler list, with a priority of 5000, and so requires that the standard $tw global variable be available.
* The app displays an alert warning the user if the file cannot saved properly. Because of the internal code, this box may flash momentarily when opening a working TiddlyWiki file.

### Bugs fixed
* External links not opening in new tab - https://github.com/Arlen22/tiddly-chrome-app/pull/3
