var wireless = require('wireless');

wireless.configure({
    commands: {
        scan: 'cat examples/iwlist-wlan0-scan.txt',
        stat: 'cat examples/iwconfig-wlan0.txt',
    },
    iface: 'wlan0'
});

wireless.on('appear', function(error, network) {
    if (error) {
        console.log("There was an error when a network appeared");
        throw error;
    }
    console.log("New Network: " + network.ssid);
});

wireless.on('disappear', function(error, network) {
    if (error) {
        console.log("There was an error when a network disappeared");
        throw error;
    }
    console.log("Bye Network: " + network.ssid);
});

wireless.start(function() {
    var ssid = wireless.list()[5];
    wireless.join(ssid, null, function(error, network) {
        if (error) {
            console.log("There was an error connecting to the fifth network");
            throw error;
        }
        console.log("I've connected to the fifth network!");
    });
});
