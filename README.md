# node-red-contrib-s7
A Node-RED node to interact with Siemens S7 PLCs.
Based on the awesome work of [plcpeople/nodes7](https://github.com/plcpeople/nodeS7).

This node was created by [Smart-Tech](https://netsmarttech.com) as part of the [ST-One](https://netsmarttech.com/page/st-one) project.

## Install

You can install this node directly from the "Manage Palette" menu in the Node-RED interface. An optional compilation step is only necessary for supporting MPI-USB adapter.

Alternatively, run the following command in your Node-RED user directory - typically `~/.node-red` on Linux or `%HOMEPATH%\.nodered` on Windows

        npm install node-red-contrib-s7

## Usage

Each connection to a PLC is represented by the **S7 Endpoint** configuration node. You can configure the PLC's Address, the variables available and their addresses, and the cycle time for reading the variables.

The **S7 In** node makes the variable's values available in a flow in three different modes:

*   **Single variable:** A single variable can be selected from the configured variables, and a message is sent every cycle, or only when it changes if _diff_ is checked. `msg.payload` contains the variable's value and `msg.topic` has the variable's name.
*   **All variables, one per message:** Like the _Single variable_ mode, but for all variables configured. If _diff_ is checked, a message is sent everytime any variable changes. If _diff_ is unchecked, one message is sent for every variable, in every cycle. Care must be taken about the number of messages per second in this mode.
*   **All variables:** In this mode, `msg.payload` contains an object with all configured variables and their values. If _diff_ is checked, a message is sent if at least one of the variables changes its value.

### Variable addressing

The variables and their addresses configured on the **S7 Endpoint** follow a slightly different scheme than used on Step 7 or TIA Portal. Here are some examples that may guide you on addressing your variables:

| Address                       | Step7 equivalent      | JS Data type  | Description |
| ----------------------------- | --------------------- | ------------- | ----------- |
| `DB5,X0.1`                    | `DB5.DBX0.1`          | Boolean       | Bit 1 of byte 0 of DB 5 |
| `DB23,B1` or `DB23,BYTE1`     | `DB23.DBB1`           | Number        | Byte 1 (0-255) of DB 23 |
| `DB100,C2` or `DB100,CHAR2`   | `DB100.DBB2`          | String        | Byte 2 of DB 100 as a Char |
| `DB42,I3` or `DB42,INT3`      | `DB42.DBW3`           | Number        | Signed 16-bit number at byte 3 of DB 42 |
| `DB57,WORD4`                  | `DB57.DBW4`           | Number        | Unsigned 16-bit number at byte 4 of DB 57 |
| `DB13,DI5` or `DB13,DINT5`    | `DB13.DBD5`           | Number        | Signed 32-bit number at byte 5 of DB 13 |
| `DB19,DW6` or `DB19,DWORD6`   | `DB19.DBD6`           | Number        | Unsigned 32-bit number at byte 6 of DB 19 |
| `DB21,R7` or `DB21,REAL7`     | `DB21.DBD7`           | Number        | Floating point 32-bit number at byte 7 of DB 21 |
| `DB2,S7.10`*                  | -                     | String        | String of length 10 starting at byte 7 of DB 2 |
| `I1.0` or `E1.0`              | `I1.0` or `E1.0`      | Boolean       | Bit 0 of byte 1 of input area |
| `Q2.1` or `A2.1`              | `Q2.1` or `A2.1`      | Boolean       | Bit 1 of byte 2 of output area |
| `M3.2`                        | `QM3.2`               | Boolean       | Bit 2 of byte 3 of memory area |
| `IB4` or `EB4`                | `IB4` or `EB4`        | Number        | Byte 4 (0 -255) of input area |
| `QB5` or `AB5`                | `QB5` or `AB5`        | Number        | Byte 5 (0 -255) of output area |
| `MB6`                         | `MB6`                 | Number        | Byte 6 (0 -255) of memory area |
| `IC7` or `EC7`                | `IB7` or `EB7`        | String        | Byte 7 of input area as a Char |
| `QC8` or `AC8`                | `QB8` or `AB8`        | String        | Byte 8 of output area as a Char |
| `MC9`                         | `MB9`                 | String        | Byte 9 of memory area as a Char |
| `II10` or `EI10`              | `IW10` or `EW10`      | Number        | Signed 16-bit number at byte 10 of input area |
| `QI12` or `AI12`              | `QW12` or `AW12`      | Number        | Signed 16-bit number at byte 12 of output area |
| `MI14`                        | `MW14`                | Number        | Signed 16-bit number at byte 14 of memory area |
| `IW16` or `EW16`              | `IW16` or `EW16`      | Number        | Unsigned 16-bit number at byte 16 of input area |
| `QW18` or `AW18`              | `QW18` or `AW18`      | Number        | Unsigned 16-bit number at byte 18 of output area |
| `MW20`                        | `MW20`                | Number        | Unsigned 16-bit number at byte 20 of memory area |
| `IDI22` or `EDI22`            | `ID22` or `ED22`      | Number        | Signed 32-bit number at byte 22 of input area |
| `QDI24` or `ADI24`            | `QD24` or `AD24`      | Number        | Signed 32-bit number at byte 24 of output area |
| `MDI26`                       | `MD26`                | Number        | Signed 32-bit number at byte 26 of memory area |
| `ID28` or `ED28`              | `ID28` or `ED28`      | Number        | Unsigned 32-bit number at byte 28 of input area |
| `QD30` or `AD30`              | `QD30` or `AD30`      | Number        | Unsigned 32-bit number at byte 30 of output area |
| `MD32`                        | `MD32`                | Number        | Unsigned 32-bit number at byte 32 of memory area |
| `IR34` or `ER34`              | `IR34` or `ER34`      | Number        | Floating point 32-bit number at byte 34 of input area |
| `QR36` or `AR36`              | `QR36` or `AR36`      | Number        | Floating point 32-bit number at byte 36 of output area |
| `MR38`                        | `MR38`                | Number        | Floating point 32-bit number at byte 38 of memory area |


*) Note that strings on the PLC uses 2 extra bytes at start for size/length of the string


### Notes on S7-1200/1500

These newer PLCs offer an "extended" version of the S7 Protocol, while we have only a "basic" version of it.

Therefore, some additional configuration steps on the PLC are necessary:
 - "Optimized block access" must be disabled for the DBs we want to access ([image](http://snap7.sourceforge.net/snap7_client_file/db_1500.bmp))
 - In the "Protection" section of the CPU Properties, enable the "Permit access with PUT/GET" checkbox ([image](http://snap7.sourceforge.net/snap7_client_file/cpu_1500.bmp))

## Wishlist
- Perform data type validation on the variables list, preventing errors on the runtime

## Bugs and enhancements

Please share your ideas and experiences on the [Node-RED forum](https://discourse.nodered.org/), or open an issue on the [page of the project on GitHub](https://github.com/netsmarttech/node-red-contrib-s7)

## License
Copyright: (c) 2016-2019, Smart-Tech, Guilherme Francescon Cittolin <guilherme.francescon@netsmarttech.com>

GNU General Public License v3.0+ (see [LICENSE](LICENSE) or https://www.gnu.org/licenses/gpl-3.0.txt)
