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
    [PROGRESS] Enabling wireless card...
    [PROGRESS] Wireless card enabled.
    [PROGRESS] Starting wireless scan...
    [PROGRESS] Wireless scanning has commenced.
    [  APPEAR] nucleocide [00:18:F8:75:60:80] 81% -53 dBm NONE
    [  APPEAR] dOpsInternal [00:0C:41:36:A3:F6] 100% -34 dBm WPA
    [  APPEAR] ArborMesh [62:3D:28:71:4F:79] 81% -53 dBm NONE
    [  APPEAR] Zen Buddhist Temple Public [F8:D1:11:47:EE:4A] 77% -56 dBm NONE
    [  APPEAR] Zen Buddhist Temple Private [FA:D1:11:47:EE:4B] 67% -63 dBm WPA2
    [  APPEAR] AHOPS [00:23:A2:DE:4A:B0] 57% -70 dBm WPA&WPA2
    [  APPEAR] ArborMesh [0A:B3:85:5F:45:99] 100% -5 dBm NONE
    [  APPEAR] Zen Buddhist Temple Public [00:27:22:14:DB:84] 82% -52 dBm NONE
    [  APPEAR] Zen Buddhist Temple Private [02:27:22:14:DB:85] 100% -5 dBm WPA2
    [  APPEAR] 2WIRE163 [00:1F:B3:6B:97:D9] 78% -55 dBm WEP
    Yay, we connected! I will try to disconnect in 20 seconds.
    [    JOIN] nucleocide [00:18:F8:75:60:80] 
    20 seconds are up, gonna try to disconnect now.
    [   LEAVE] Left the network
    [  APPEAR] ATT200 [CC:7D:37:81:0F:20] 68% -62 dBm WPA&WPA2
    ^C[PROGRESS] Gracefully shutting down from SIGINT (Ctrl+C)
    [PROGRESS] Disabling Adapter...
    [PROGRESS] Stopping Wireless App...
    [PROGRESS] Exiting...

Requirements
=

Needs wpa_supplicant, a wireless card which can see a list of available networks.

Assumptions
=

* We assume that dhcp isn't enabled on the wireless device by default.
* I've only tried this in Arch Linux.
* I've only tried this using a wireless card with the RTL8187 chipset.
* My user account has password-free sudo ability.
