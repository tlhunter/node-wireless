Node.js WiFi Interface
===

This Node.js module will provide at least the following features:

* Get a list of visible networks
* Display info about connected network
* Display different information about other networks, e.g. strength
* Disconnect to network
* Connect to network, provide credentials or certificate
* Possibly handle multiple interfaces
* Trigger an event when a new network appears
* Trigger an event when a network changes
* Trigger an event when a network disappears or lose connection

Basically, this class should be able to do anything a user would be
able to do using their OS's network configuration tools.

Applications making use of this module should be able to build AI for
handling network connections, or web GUI's for connecting, etc.

This should be able to run on any Linux distro, BSD, OS X. I think there
will be a requirement for the wpa_supplicant and possibly wpa_cli packages
to be installed, which are binaries.

Installation
=

    npm install wireless

The module itself is (currently) located in this repo in the node_modules/wireless
directory. If you install the module using the command above, just that folder will
be added to your project. Everything above that directory is just some sample code
stuff; I'll make the repo map to the module directory better once it is fit for
public consumption.

Current Status
=

Currently, enabling/disabling adapter works, finding new networks will trigger events,
able to read encryption method and other data, and disappearing networks trigger events.

    $ node app.js
    Enabling wireless card...
    Wireless card enabled.
    Starting wireless scan...
    Wireless scanning has commenced.
    [  APPEAR] OldWireless [00:27:0D:07:76:32] 63% -59 dBm WEP
    [  APPEAR] x-wifi [00:27:0D:98:C2:52] 98% -41 dBm OPEN
    [  APPEAR] y-wifi [64:AE:0C:01:A4:31] 100% -34 dBm WPA&WPA2
    [  APPEAR] y-wifi [00:27:0D:98:C5:D1] 100% -21 dBm WPA&WPA2
    [  APPEAR] x-wifi [00:27:0D:98:C5:D2] 100% -21 dBm OPEN
    [  APPEAR] x-wifi [64:AE:0C:01:A4:32] 100% -34 dBm OPEN
    [  APPEAR] z-wifi [00:24:6C:BA:1E:C0] 74% -58 dBm WPA
    [  APPEAR] w-wifi [64:AE:0C:01:A4:33] 100% -34 dBm WPA2
    [    HIDE] OldWireless [00:27:0D:07:76:32] 
    ^C
    Gracefully shutting down from SIGINT (Ctrl+C)
    Disabling Adapter...
    Stopping Wireless App...
    Exiting...

Requirements
=

Needs wpa_supplicant, a wireless card which can see a list of available networks.

Assumptions
=

* We assume that dhcp isn't enabled on the wireless device by default.
* I've only tried this in Arch Linux.
* I've only tried this using a wireless card with the RTL8187 chipset.
* My user account has password-free sudo ability.
