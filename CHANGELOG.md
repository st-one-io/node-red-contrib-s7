Version: 3.0.0
------------
 - Migrate underlying library to @st-one-io/node-s7
 - Remove optional dependency on mpi-s7 (project is now split into this and `node-red-contrib-mpi-s7`)
 - Added tag validation on the editor

Version: 2.2.1
------------
 - Fixes and improve PLC discovery UI

Version: 2.2.0
------------
 - Adds support to `DT`, `DTZ`, `DTL` and `DTLZ` data types

Version: 2.1.1
------------
 - Updates dependency of nodes7 - fixes sequence collision bug

Version: 2.1.0
------------
 - Adds support for Node-RED 1.0 API
 - Changes node's category to "plc"
 - Implements discovery of ethernet PLCs

Version: 2.0.2
------------
 - Fixes #49 - fixes regression introduced in 2.0.1 that prevented writing to array of vars

Version: 2.0.1
------------
 - Fixes #48 - prevents exception being thrown when writing to unknown variables

Version: 2.0.0
------------
 - Adds support for MPI-USB adapters as transport for connecting to PLCs

Version: 1.6.3
------------
 - l10n - Fix translation code for German

Version: 1.6.2
------------
 - l10n - Add translations to German

Version: 1.6.1
------------
 - Bumps dependency of nodes7

Version: 1.6.0
------------
 - Implements "s7 control" node, currently for manual control of the cycle time

Version: 1.5.3
------------
 - Fixes #33: handle diff of array types, so they're emitted only when an item changes

Version: 1.5.2
------------
 - Skip cyclic reading of variables if there's none configured

Version: 1.5.1
------------
 - Avoids trying to connect again after closing the node

Version: 1.5.0
------------
 - Enables errors to be catch by the "catch" node (#17)
 - Implements "connecting" status - thanks @CarstenMaul (#19)
 - Fixes connection leak introduced on 1.3.1

Version: 1.4.1
------------
 - Fixes #11: Correctly parses tsap values and improve validation

Version: 1.4.0
------------
 - Implements configuration option to set library's debug independently from Node-RED
 - Sets timeout and TSAP defaults to old configs without them

Version: 1.3.1
------------
 - Force a connection restart if we receive no callback response within 10 tries
 - Retry to connect to PLC if failing to connect on flow deploy
 - Improve logging

Version: 1.3.0
------------
 - Implements ability to connect to PLC using local/remote TSAP instead of rack and slot only

Version: 1.2.0
------------
 - Implements buttons to import and export the variable list in the S7 Eenpoint node

Version: 1.1.2
------------
 - Fixes #4: Avoid EventEmitter warnings when lots of S7In nodes are used

Version: 1.1.1
------------
 - Fix default value of new timeout configuration

Version: 1.1.0
------------
 - Implement timeout parameter, as we may have higher delays than the default one in unstable networks

Version: 1.0.1
------------
 - Fixes alignment of s7 write node

Version: 1.0.0
------------
Major Release
 - Implements s7 write node

Version: 0.2.4
------------
 - Enable underlying nodes7's logging when NodeRED is run in verbose mode (either with -v or at settings.js)

Version: 0.2.3
------------
- [BUGFIX] - memory leak on __STATUS__ event that was registered on the endpoint node but never removed
- [BUGFIX] - show the endpoint label if mode:single but no variable configured, label was empty
- Defer the reading cycle if the previous reading hasn't returned yet. This prevents queuing a lot of read requests in the stack
- Displays the variable's address in the config of the S7 In node for information purposes only

Version: 0.2.2
------------
- Replace arrow founction with standard function, so we're backwards compatible with previous versions of Node.JS

Version: 0.2.1
------------
- Add repository/bugs information to package.json

Version: 0.2.0
------------
- Implements new reading mode "All variables, one per message"
- Help text of the in node rewritten
- s7 endpoint now stores the variable as an array, not as stringified JSON. Backwards compatible.

Version: 0.1.1
------------
- [BUGFIX] Fix require of EventEmitter (#1)

Version: 0.1.0
------------
- Initial release
