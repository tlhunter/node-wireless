Node WiFi Controller
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

Current Status
=

Currently, finding new networks will trigger events:

    $ node app.js 
    [  APPEAR] Home-Data [30:46:9A:96:6F:BA] 100%
    [  APPEAR]  [00:02:A8:D2:07:8C] 77%
    [  APPEAR] myLGNet078f [00:02:A8:D2:07:8D] 77%
    [  APPEAR] 2WIRE210 [00:24:56:65:00:B1] 77%
    [  APPEAR] corporate [5C:D9:98:68:66:48] 100%
    [  APPEAR] xfinityC2 [00:26:F3:66:F7:28] 100%
    [  APPEAR] linksys [00:12:17:27:5E:AF] 74%
    [  APPEAR]  [00:26:F3:66:F7:29] 100%
    [  APPEAR]  [00:26:F3:66:F7:2A] 70%
