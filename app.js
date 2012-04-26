var wireless = require('wireless');

wireless.configure({
    scan: 'cat examples/iwlist-wlan0-scan.txt',
    status: 'cat examples/iwconfig-wlan0.txt',
});

wireless.on('appear', function(error, network) {
    if (error) {
        console.log("There was an error when a network appeared");
        throw error;
    }
    console.log("New Network: " + network.ssid);
}

wireless.on('disappear', function(error, network) {
    if (error) {
        console.log("There was an error when a network disappeared");
        throw error;
    }
    console.log("Bye Network: " + network.ssid);
}

wireless.start(function() {
    var ssid = wireless.list()[5];
    wireless.join(ssid, null, function() {
        console.log("I've connected to the fifth network!");
    });
});
