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
