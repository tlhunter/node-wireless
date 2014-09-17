#!/usr/bin/env node

var wireless = require('../index.js');
var fs = require('fs');

var connectedToMyHome = false;

var iface = process.argv[2];
// The SSID of an open wireless network you'd like to connect to
var SSID = 'Zen Buddhist Temple Public';

if (!iface) {
    console.log("Usage: " + process.argv[1] + " wlan0");
    process.exit();
}

wireless.configure({
    iface: iface,
    updateFrequency: 12,
    vanishThreshold: 7,
});

console.log("[PROGRESS] Enabling wireless card...");

wireless.enable(function() {
    console.log("[PROGRESS] Wireless card enabled.");
    console.log("[PROGRESS] Starting wireless scan...");

    wireless.start(function() {
        console.log("[PROGRESS] Wireless scanning has commenced.");
    });
});

// Found a new network
wireless.on('appear', function(error, network) {
    if (error) {
        console.log("[   ERROR] There was an error when a network appeared");
        throw error;
    }

    var quality = Math.floor(network.quality / 70 * 100);

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

    console.log("[  APPEAR] " + ssid + " [" + network.address + "] " + quality + "% " + network.strength + " dBm " + encryption_type);

    if (!connectedToMyHome && network.ssid === SSID) {
        connectedToMyHome = true;
        wireless.join(network, '', function() {
            console.log("Yay, we connected! I will try to get an IP.");
            wireless.dhcp(network, function(ip_address) {
                console.log("Yay, I got an IP address (" + ip_address + ")! I'm going to disconnect in 20 seconds.");
                setTimeout(function() {
                    console.log("20 seconds are up! Attempting to turn off DHCP...");
                    wireless.dhcpStop(function() {
                        console.log("DHCP has been turned off. Leaving the network...");
                        wireless.leave();
                    });
                }, 20 * 1000);
            });
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

wireless.on('change-levels', function(error, network) {
    if (error) {
        console.log("[   ERROR] There was an error when a network changed");
        throw error;
    }

    console.log("[  LEVELS] " + network.ssid);
});

// We've joined a network
wireless.on('join', function(error, network) {
    console.log("[    JOIN] " + network.ssid + " [" + network.address + "] ");
});

// We've left a network
wireless.on('leave', function(error) {
    console.log("[   LEAVE] Left the network");
});

// Just for debugging purposes
wireless.on('debug', function(error, command) {
    console.log("[ COMMAND] " + command);
});

wireless.on('dhcp-acquired-ip', function(error, ip_address) {
    console.log("[    DHCP] Leased IP " + ip_address);
});

//wireless.on('batch-scan', function(error, networks) {
    //console.log("[   BATCH] " + networks);
//});

wireless.on('empty-scan', function(error) {
    console.log("[   EMPTY] Found no networks this scan");
});

wireless.on('warning', function(error, message) {
    console.log("[ WARNING] " + message);
});

wireless.on('error', function(error, message) {
    console.log("[   ERROR] " + message);
});

wireless.on('fatal', function(error, message) {
    console.log("[   FATAL] " + message);
});

// User hit Ctrl + C
var killing_app = false;
process.on('SIGINT', function() {
    if (killing_app) {
        console.log("[PROGRESS] Double SIGINT, Killing without cleanup!");
        process.exit();
    }

    killing_app = true;
    console.log("[PROGRESS] Gracefully shutting down from SIGINT (Ctrl+C)");
    console.log("[PROGRESS] Disabling Adapter...");

    wireless.disable(function() {
        console.log("[PROGRESS] Stopping Wireless App...");

        wireless.stop(function() {
            console.log("[PROGRESS] Exiting...");

            process.exit();
        });
    });
});
