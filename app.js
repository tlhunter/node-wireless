var wireless = require('wireless');
var fs = require('fs');
var _ = require('underscore');

wireless.configure({
    commands: {
        scan: 'sudo iwlist :INTERFACE scan',
        stat: 'sudo ifconfig :INTERFACE',
    },
    iface: 'wlan0',
    updateFrequency: 8,
});

wireless.on('appear', function(error, network) {
    if (error) {
        console.log("[   ERROR] There was an error when a network appeared");
        throw error;
    }
    var strength = Math.floor(network.quality / 70 * 100);
    console.log("[  APPEAR] " + network.ssid + " [" + network.address + "] " + strength + "%");
});

wireless.on('disappear', function(error, network) {
    if (error) {
        console.log("[   ERROR] There was an error when a network disappeared");
        throw error;
    }
    console.log("[    HIDE] Network: " + network.ssid);
});

wireless.on('change', function(error, network) {
    if (error) {
        console.log("[   ERROR] There was an error when a network changed");
        throw error;
    }
    console.log("[  CHANGE] " + network.ssid);
});

wireless.on('connect', function(error, network) {
    console.log("[ CONNECT] " + network.ssid);
});

wireless.on('disconnect', function(error, network) {
    console.log("[   DISCO] " + network.ssid);
    console.log("Don't be sad. There are still " + wireless.networks.length + " fish in the sea.");
});

wireless.start(function() {
    var ssid = wireless.list()[5];
    wireless.join(ssid, null, function(error, network) {
        if (error) {
            console.log("[   ERROR] There was an error connecting to the fifth network");
            throw error;
        }
        console.log("[    INFO] I've connected to the fifth network!");
    });
});

process.on('SIGINT', function() {
    console.log("\nGracefully shutting down from SIGINT (Ctrl+C)");
    // some other closing procedures go here
    wireless.stop(function() {
        process.exit();
    });
});
