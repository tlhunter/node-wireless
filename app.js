var wireless = require('wireless');
var fs = require('fs');
var _ = require('underscore');

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

wireless.on('change', function(error, network) {
    if (error) {
        console.log("There was an error when a network changed");
        throw error;
    }
    console.log("Network Changed: " + network.ssid);
});

wireless.on('connect', function(error, network) {
    console.log("Connected to: " + network.ssid);
});

wireless.on('disconnect', function(error, network) {
    console.log("Disconnected from Network: " + network.ssid);
    console.log("Don't be sad. There are still " + wireless.networks.length + " fish in the sea.");
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

// Just testing the parser for now
fs.readFile('examples/downtown.txt', function(err, data) {
    if (err) throw err;
    var content = data.toString();
    var networks = wireless.parse(content);
    console.log(networks);
});
