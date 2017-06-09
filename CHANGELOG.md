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
