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

Currently, enabling/disabling adapter works, finding new networks will trigger events:

    $ node app.js
    Enabling wireless card...
    Wireless card enabled.
    Starting wireless scan...
    [  APPEAR] 2WIRE448 [98:2C:BE:69:8D:39] 82%
    [  APPEAR] Brueggers_Free_WiFi [00:24:6C:A4:0E:30] 92%
    [  APPEAR] EspressoRoyale [20:4E:7F:C3:64:D2] 100%
    [  APPEAR] biwako [3C:EA:4F:38:13:29] 94%
    [  APPEAR] fortinet [00:0E:8E:29:CF:B7] 88%
    [  APPEAR]  [00:19:A9:CF:F3:00] 75%
    [  APPEAR]  [00:19:A9:FC:05:10] 68%
    ^C
    Gracefully shutting down from SIGINT (Ctrl+C)
    Disabling Adapter...
    Stopping Wireless App...
    Exiting...
