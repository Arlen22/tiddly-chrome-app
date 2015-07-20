chrome.app.runtime.onLaunched.addListener(function(launch) {
    console.log(launch);
    chrome.app.window.create('window.html', {
        'outerBounds': {
            'width': 400,
            'height': 500
        }
    }, function(window){
        console.log(window);
        if(launch && launch.items){
            window.contentWindow.tiddlyChromeAutoOpen = launch.items[0].entry;
        }
    });
});
