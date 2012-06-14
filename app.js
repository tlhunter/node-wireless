var wireless = require('wireless');
var fs = require('fs');
var _ = require('underscore');

var connectedToMyHome = false;

wireless.configure({
    iface: 'wlan0',
    updateFrequency: 8,
    vanishThreshold: 7,
});

console.log("Enabling wireless card...");
wireless.enable(function() {
    console.log("Wireless card enabled.");
    console.log("Starting wireless scan...");

    wireless.start(function() {
        console.log("Wireless scanning has commenced.");
    });
});

// Found a new network
wireless.on('appear', function(error, network) {
    if (error) {
        console.log("[   ERROR] There was an error when a network appeared");
        throw error;
    }

    var strength = Math.floor(network.quality / 70 * 100);

    var ssid = network.ssid || '<HIDDEN>';

    var encryption_type = 'NONE';
    if (network.encryption_wep) {
        encryption_type = 'WEP';
    } else if (network.encryption_wpa && network.encryption_wpa2) {
        encryption_type = 'WPA&WPA2';
    } else if (network.encryption_wpa) {
        encryption_type = 'WPA';
    } else if (network.encryption_wpa2) {
        encryption_type = 'WPA2';
    }

    console.log("[  APPEAR] " + ssid + " [" + network.address + "] " + strength + "% " + network.strength + " dBm " + encryption_type);

    if (!connectedToMyHome && network.ssid == 'nucleocide') {
        connectedToMyHome = true;
        wireless.join(network, null, function() {
            console.log("Yay, we connected!");
        },
        function() {
            console.log("Unable to connect.");
        });
    }
});

// A network disappeared (after the specified threshold)
wireless.on('vanish', function(error, network) {
    if (error) {
        console.log("[   ERROR] There was an error when a network vanished");
        throw error;
    }
    console.log("[  VANISH] " + network.ssid + " [" + network.address + "] ");
});

// A wireless network changed something about itself
wireless.on('change', function(error, network) {
    if (error) {
        console.log("[   ERROR] There was an error when a network changed");
        throw error;
    }
    console.log("[  CHANGE] " + network.ssid);
});

// We've joined a network
wireless.on('join', function(error, network) {
    console.log("[    JOIN] " + network.ssid + " [" + network.address + "] ");
});

// We've left a network
wireless.on('leave', function(error, network) {
    console.log("[   LEAVE] " + network.ssid);
    console.log("Don't be sad. There are still " + wireless.networks.length + " fish in the sea.");
});

// Just for debugging purposes
wireless.on('command_debug', function(error, command) {
    console.log("[ COMMAND] " + command);
});

// User hit Ctrl + C
var killing_app = false;
process.on('SIGINT', function() {
    if (killing_app) {
        console.log("\nDouble SIGINT, Killing without cleanup!");
        process.exit();
    }
    killing_app = true;
    console.log("\nGracefully shutting down from SIGINT (Ctrl+C)");

    console.log("Disabling Adapter...");
    wireless.disable(function() {

        console.log("Stopping Wireless App...");
        wireless.stop(function() {

            console.log("Exiting...");
            process.exit();
        });
    });
});
