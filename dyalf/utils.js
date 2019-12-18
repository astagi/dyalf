
/*
All packets have a two-byte ID code, separated into the “device ID” (DID) and “command ID” (CID). These bytes specify the command to execute. When sending a command, the sender uses the “sequence number” (SEQ) as a handle to link a particular command packet to its response. Responses echo the DID, CID, and SEQ to help the sender fully identify the corresponding command packet.
*/



let calculateChk = function(buff) {
    let ret = 0x00;
    for (let i = 0 ; i < buff.length ; i++) {
		ret += buff[i];
    }
    ret = ret & 255;
    return (ret ^ 255);
}

module.exports = {
    calculateChk: calculateChk
};
