var util = require('util');
var events = require('events');
var exec = require('child_process').exec;
var _ = require('underscore');

// gonna require some sys or child_process stuff for executing nix commands
var Wireless = function() {
    events.EventEmitter.call(this);
    var self = this;

    // List of networks (key is address)
    self.networks = [];

    // ID for scanner interval
    self.scanner = null;

    // ID for connection checking interval
    self.connectionSpy = null;

    // True if we're shutting down
    self.killing = false;

    // True if we're connected to a network
    self.connected = false;

    // Configuration settings
    self.configuration = {
        // Interface to listen on (should one day handle multiple)
        iface: 'wlan0',

        // How often to poll the listing of networks (this should perhaps be recursive)
        updateFrequency: 10,

        // How often should we check if we're connected to a network? (this is a pretty fast operation)
        connectionSpyFrequency: 2,

        // How many scans should an AP not be in the results before we consider it vanished
        vanishThreshold: 2,

        // What commands to execute
        commands: {
            scan: 'sudo iwlist :INTERFACE scan',
            stat: 'sudo iwconfig :INTERFACE',
            disable: 'sudo ifconfig :INTERFACE down',
            enable: 'sudo ifconfig :INTERFACE up',
            interfaces: 'sudo iwconfig',
            dhcp: 'sudo dhcpcd :INTERFACE',
            dhcp_disable: 'sudo dhcpcd :INTERFACE -k',
            leave: 'sudo iwconfig :INTERFACE essid ""',

            metric: 'sudo ifconfig :INTERFACE metric :METRIC',
            connect_wep: 'sudo iwconfig :INTERFACE essid ":ESSID" key :PASSWORD',
            connect_wpa: 'sudo wpa_passphrase ":ESSID" :PASSWORD > wpa-temp.conf && sudo wpa_supplicant -D wext -i :INTERFACE -c wpa-temp.conf && rm wpa-temp.conf',
            connect_open: 'sudo iwconfig :INTERFACE essid ":ESSID"',
        },
        translated: {}
    };

    // Set the configuration settings
    self.configure = function(config) {
        // The next four lines are a sloppy attempt to merge configuration object. Should be prettier.
        var oldCommands = self.configuration.commands;
        _.extend(oldCommands, config.commands);
        _.extend(self.configuration, config);
        self.configuration.commands = oldCommands;

        var defaults = {
            'interface': self.configuration.iface,
        };

        // Translates each individual command
        for (var command in self.configuration.commands) {
            if (!self.configuration.commands.hasOwnProperty(command)) break;
            self.configuration.translated[command] = self.translate(self.configuration.commands[command], defaults);
        }
    };

    // Translates strings. Looks for :SOMETHING in string, and replaces is with data.something.
    self.translate = function(string, data) {
        for (var index in data) {
            if (!data.hasOwnProperty(index)) break;
            string = string.replace(':' + index.toUpperCase(), data[index]);
        }
        return string;
    };

    // Start listening, runs in a loop
    self.start = function(callback) {
        // Check for networks
        self._executeScan();
        self.scanner = setInterval(self._executeScan, self.configuration.updateFrequency * 1000);

        // Are we connected?
        self._executeTrackConnection();
        self.connectionSpy = setInterval(self._executeTrackConnection, self.configuration.connectionSpyFrequency * 1000);

        // Callback (not too useful really)
        if (callback) {
            callback();
        }
    };

    // everytime we find a network during a scan, we pass it through this function
    self._seeNetwork = function(network) {
        if (self.networks[network.address]) {
            var oldNetwork = self.networks[network.address];
            if (oldNetwork.ssid != network.ssid || oldNetwork.encryption_any != network.encryption_any) {
                self.emit('change', false, network);
            } else if (oldNetwork.strength != network.strength || oldNetwork.quality != network.quality) {
                self.emit('change-levels', false, network);
            }
            self.networks[network.address] = network;
        } else {
            self.networks[network.address] = network;
            self.emit('appear', false, network);
        }
    };

    // Stop listening
    self.stop = function(callback) {
        self.killing = true;
        clearInterval(self.scanner);
        self.emit('stop', false);
        if (callback) {
            callback();
        }
    };

    // Returns a listing of networks from the last scan
    // Doesn't need a callback, just getting the last list, not doing a new scan
    self.list = function() {
        return self.networks;
    };

    // Attempts to run dhcpcd on the interface to get us an IP address
    self.dhcp = function(network, callback) {
        self.emit('debug', false, self.configuration.translated.dhcp);
        exec(self.configuration.translated.dhcp, function(err, stdout, stderr) {
            if (err) {
                self.emit('fatal', false, "There was an unknown error enabling dhcp" + err);
                throw err;
            }

            // Command output is over stderr :'(
            var lines = stderr.split(/\r\n|\r|\n/);
            var ip_address = null;
            var temp = null;

            _.each(lines, function(line) {
                temp = line.match(/leased (\b(?:\d{1,3}\.){3}\d{1,3}\b) for [0-9]+ seconds/);
                if (temp) {
                    ip_address = temp[1];
                }
            });

            if (ip_address) {
                self.emit('dhcp-acquired-ip', false, ip_address);
            }

            if (callback) {
                callback(ip_address);
            }
        });
    };

    // Disables DHCPCD
    self.dhcpStop = function(callback) {
        self.emit('debug', false, self.configuration.translated.dhcp_disable);
        exec(self.configuration.translated.dhcp_disable, function(err, stdout, stderr) {
            if (err) {
                self.emit('fatal', false, "There was an unknown error disabling dhcp" + err);
                throw err;
            }

            if (callback) {
                callback();
            }
        });
    };

    // Enables the interface (ifconfig UP)
    self.enable = function(callback) {
        self.emit('debug', false, self.configuration.translated.enable);
        exec(self.configuration.translated.enable, function(err, stdout, stderr) {
            if (err) {
                if (err.message.indexOf("No such device")) {
                    self.emit('fatal', false, "The interface " + self.configuration.iface + " does not exist.");
                    process.exit(1);
                }

                self.emit('fatal', false, "There was an unknown error enabling the interface" + err);
                throw err;
            }

            if (stdout || stderr) {
                self.emit('error', false, "There was an error enabling the interface" + stdout + stderr);
            }

            if (callback) {
                callback();
            }
        });
    };

    // Disables the interface (ifconfig DOWN)
    self.disable = function(callback) {
        self.emit('debug', false, self.configuration.translated.disable);
        exec(self.configuration.translated.disable, function(err, stdout, stderr) {
            if (err) {
                self.emit('fatal', false, "There was an unknown error disabling the interface" + err);
                throw err;
            }

            if (stdout || stderr) {
                self.emit('error', false, "There was an error disabling the interface" + stdout + stderr);
            }

            if (callback) {
                callback();
            }
        });
    };

    // Attempts to connect to the specified network
    self.join = function(network, password, callback_success, callback_failure) {
        if (network.encryption_wep) {
            self._executeConnectWEP(network.ssid, password, callback_success, callback_failure);
        } else if (network.encryption_wpa || network.encryption_wpa2) {
            self._executeConnectWPA(network.ssid, password, callback_success, callback_failure);
        } else {
            self._executeConnectOPEN(network.ssid, callback_success, callback_failure);
        }

    };

    // Attempts to disconnect from the specified network
    self.leave = function(callback) {
        self.emit('debug', false, self.configuration.translated.leave);
        exec(self.configuration.translated.leave, function(err, stdout, stderr) {
            if (err) {
                self.emit('fatal', false, "There was an error when we tried to disconnect from the network");
                throw err;
            }
            if (callback) {
                callback();
            }
        });
    };

    // Parses the output from `iwlist IFACE scan` and returns a pretty formattted object
    self._parseScan = function(scanResults) {
        var lines = scanResults.split(/\r\n|\r|\n/);
        var networks = [];
        var network = {};
        var networkCount = 0;
        _.each(lines, function(line) {
            line = line.replace(/^\s+|\s+$/g,"");
            // a "Cell" line means that we've found a start of a new network
            if (line.indexOf('Cell') === 0) {
                networkCount++;
                if (!_.isEmpty(network)) {
                    networks.push(network);
                }
                network = {
                    //speeds: []
                    last_tick: 0,
                    encryption_any: false,
                    encryption_wep: false,
                    encryption_wpa: false,
                    encryption_wpa2: false,
                };
                network.address = line.match(/([0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}/)[0];
            } else if (line.indexOf('Channel') === 0) {
                network.channel = line.match(/Channel:([0-9]{1,2})/)[1];
            } else if (line.indexOf('Quality') === 0) {
                network.quality = line.match(/Quality=([0-9]{1,2})\/70/)[1];
                network.strength = line.match(/Signal level=(-?[0-9]{1,3}) dBm/)[1];
            } else if (line.indexOf('Encryption key') === 0) {
                var enc = line.match(/Encryption key:(on|off)/)[1];
                if (enc === 'on') {
                    network.encryption_any = true;
                    network.encryption_wep = true;
                }
            } else if (line.indexOf('ESSID') === 0) {
                network.ssid = line.match(/ESSID:"(.*)"/)[1];
            } else if (line.indexOf('Mode') === 0) {
                network.mode = line.match(/Mode:(.*)/)[1];
            } else if (line.indexOf('IE: IEEE 802.11i/WPA2 Version 1') === 0) {
                network.encryption_wep = false;
                network.encryption_wpa2 = true;
            } else if (line.indexOf('IE: WPA Version 1') === 0) {
                network.encryption_wep = false;
                network.encryption_wpa = true;
            }
        });
        if (!_.isEmpty(network)) {
            networks.push(network);
        }

        if (networkCount === 0) {
            self.emit('empty-scan', null);
        }
        return networks;
    };

    // Executes a scan, reporting each network we see
    self._executeScan = function() {
        // Make this a non annonymous function, run immediately, then run interval which runs function
        self.emit('debug', false, self.configuration.translated.scan);
        exec(self.configuration.translated.scan, function(err, stdout, stderr) {
            if (err) {
                if (self.killing) {
                    // Of course we got an error the main app is being killed, taking iwlist down with it
                    return;
                }
                self.emit('fatal', false, "Got some major errors from our scan command:" + err);
                throw err;
            }

            if (stderr) {
                if (stderr.match(/Device or resource busy/)) {
                    self.emit('warning', false, "Scans are overlapping; slow down update frequency");
                    return;
                } else if (stderr.match(/Allocation failed/)) {
                    self.emit('warning', false, "Too many networks for iwlist to handle");
                    return;
                } else {
                    self.emit('warning', false, "Got some errors from our scan command: ", stderr);
                }
            }

            if (!stdout) {
                return;
            }

            var content = stdout.toString();
            var networks = self._parseScan(content);

            // emit the raw data
            self.emit('batch-scan', null, networks);

            _.each(networks, function(network) {
                self._seeNetwork(network);
            });

            self._decay();
        });
    };

    // Checks to see if we are connected to a wireless network and have an IP address
    self._executeTrackConnection = function() {
        self.emit('debug', false, self.configuration.translated.stat);
        exec(self.configuration.translated.stat, function(err, stdout, stderr) {
            if (err) {
                self.emit('fatal', false, "Error getting wireless devices information");
                throw err;
            }
            var content = stdout.toString();
            var lines = content.split(/\r\n|\r|\n/);
            var foundOutWereConnected = false;
            var networkAddress = null;

            _.each(lines, function(line) {
                //if (line.match(/inet (\b(?:\d{1,3}\.){3}\d{1,3}\b)/) || line.match(/inet6 ([a-f0-9:]*)/)) {
                    //// looks like we're connected
                    //foundOutWereConnected = true;
                //}
                if (line.indexOf('Access Point') !== -1) {
                    networkAddress = line.match(/Access Point: ([a-fA-F0-9:]*)/)[1] || null;
                    if (networkAddress) {
                        foundOutWereConnected = true;
                    }
                }
            });
            // guess we're not connected after all
            if (!foundOutWereConnected && self.connected) {
                self.connected = false;
                self.emit('leave', false);
            } else if (foundOutWereConnected && !self.connected) {
                self.connected = true;
                self.emit('join', false, self.networks[networkAddress]);
            }
        });
    };

    // Connects to a WEP encrypted network
    self._executeConnectWEP = function(essid, password, callback_success, callback_failure) {
        var command = self.translate(self.configuration.translated.connect_wep, {'essid': essid, 'password': password});
        self.emit('debug', false, command);
        exec(command, function(err, stdout, stderr) {
            if (err || stderr) {
                self.emit('error', false, "Shit is broken TODO");
                console.log(err);
                console.log(stderr);
                if (callback_failure) {
                    callback_failure();
                }
            } else {
                if (callback_success) {
                    callback_success();
                }
            }
        });
    };

    // Connects to a WPA or WPA2 encrypted network
    self._executeConnectWPA = function(essid, password, callback_success, callback_failure) {
        var command = self.translate(self.configuration.translated.connect_wpa, {'essid': essid, 'password': password});
        self.emit('debug', false, command);
        exec(command, function(err, stdout, stderr) {
             if (err || stderr) {
                self.emit('error', false, "Shit is broken TODO");
                console.log(err);
                console.log(stderr);
                if (callback_failure) {
                    callback_failure();
                }
            } else {
                if (callback_success) {
                    callback_success();
                }
            }
        });
    };

    // Connects to an unencrypted network
    self._executeConnectOPEN = function(essid, callback_success, callback_failure) {
        var command = self.translate(self.configuration.translated.connect_open, {'essid': essid});
        self.emit('debug', false, command);
        exec(command, function(err, stdout, stderr) {
            if (err || stderr) {
                self.emit('error', false, "There was an error joining an open network");
                console.log(err, stderr);
                if (callback_failure) {
                    callback_failure();
                }
            } else {
                if (callback_success) {
                    callback_success();
                }
            }
        });
    };

    // Go over each network, increment last_tick, if it equals the threshold, send an event
    self._decay = function() {
        // _.each can't iterate self.networks for some reason
        for (var address in self.networks) {
            if (!self.networks.hasOwnProperty(address)) break;
            var this_network = self.networks[address];
            this_network.last_tick++;
            if (this_network.last_tick == self.configuration.vanishThreshold+1) {
                self.emit('vanish', false, this_network);
            }
        }
    };
};

util.inherits(Wireless, events.EventEmitter);
module.exports = new Wireless();