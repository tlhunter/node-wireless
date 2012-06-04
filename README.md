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
    [  APPEAR] Home-Data [30:46:9A:96:6F:BA] 74% -58 dBm WPA2
    [  APPEAR] corporate [5C:D9:98:68:66:48] 100% -22 dBm OPEN
    [  APPEAR] xfinityC2 [00:26:F3:66:F7:28] 100% -34 dBm WPA2
    [  APPEAR]  [00:26:F3:66:F7:29] 74% -58 dBm WPA2
    [  APPEAR]  [00:26:F3:66:F7:2A] 98% -41 dBm WPA2
    [  APPEAR]  [00:26:F3:66:F7:2B] 100% -36 dBm WPA2
    [  APPEAR] Bonnie [00:1E:E5:32:5B:FD] 80% -54 dBm WPA
    [  APPEAR] Santh [00:22:75:CA:D6:45] 74% -58 dBm WEP
    [  APPEAR]  [00:02:A8:D2:07:8C] 81% -53 dBm WPA
    [  APPEAR] PXLink [1C:AF:F7:D8:0C:6B] 94% -44 dBm WPA
    [  APPEAR] HOME-0238 [00:26:F3:CD:02:38] 82% -52 dBm WPA
    [  APPEAR] Holonet [00:19:5B:4F:2C:B3] 100% -25 dBm WPA2
    [  APPEAR] myLGNet078f [00:02:A8:D2:07:8D] 81% -53 dBm WEP
    [  APPEAR] 2WIRE926 [B0:E7:54:EA:3C:99] 71% -60 dBm WPA
    [  APPEAR] Cisco07590 [20:AA:4B:53:9C:E4] 65% -64 dBm OPEN
    [  APPEAR]  [00:26:F3:CD:02:3B] 75% -57 dBm WPA2
    [  APPEAR]  [00:26:F3:CD:02:39] 82% -52 dBm WPA2
    [  APPEAR] TRENDnet [00:14:D1:39:20:F2] 68% -62 dBm WPA
    [  APPEAR]  [00:26:F3:CD:02:3A] 70% -61 dBm WPA2
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
