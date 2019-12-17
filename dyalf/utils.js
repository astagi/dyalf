
/*
All packets have a two-byte ID code, separated into the “device ID” (DID) and “command ID” (CID). These bytes specify the command to execute. When sending a command, the sender uses the “sequence number” (SEQ) as a handle to link a particular command packet to its response. Responses echo the DID, CID, and SEQ to help the sender fully identify the corresponding command packet.
*/

// var writeAndWait = function(debug, characteristic, buff, waitFor='d8') {
//     return new Promise(function(resolve, reject) {
//         var listenerF = (data, isNotification) => {
//             console.log("DATA: " + data.toString('hex'));
//             //console.log("Arrived");
//             if (data.toString('hex').endsWith(waitFor)) {
//                 console.log("FINISH " + debug);
//                 //characteristic.removeAllListeners('data');
//                 //resolve(true);
//             }
//         };
//         characteristic.removeAllListeners('data');
//         characteristic.on('data', listenerF);
//         console.log("GO WRITE")
//         characteristic.write(buff, true, (error) => {
//             //console.log(error.toString('hex'));
//             console.log("DONE WRITE");
//             // characteristic.read((error, data) => {
//             //     console.log("DATAREAD: " + data.toString('hex'));
//             // });
//             setTimeout(() => {
//                 resolve(true);
//             }, 11000);
//         });

//     });
// }

var writeAndWait = function(debug, characteristic, buff, waitForNotification=false, timeout=0) {
    return new Promise(function(resolve, reject) {
        dataRead = [];
        var listenerF = (data, isNotification) => {
            //console.log("DATA: " + data.toString('hex'));
            //console.log("Arrived");
            dataRead.push(...data)
            if (data.toString('hex').endsWith('d8')) {
                console.log(dataRead);

                // Check Package and Wait
                if (waitForNotification) {
                    if (dataRead[1] % 2 == 0) {
                        setTimeout(() => {
                            resolve(true);
                        }, timeout);
                    }
                } else {
                    setTimeout(() => {
                        resolve(true);
                    }, timeout);
                }
                dataRead = [];
                console.log("FINISH " + debug);
                //characteristic.removeAllListeners('data');
                //resolve(true);
            }
        };
        characteristic.removeAllListeners('data');
        characteristic.on('data', listenerF);
        console.log("GO WRITE")
        characteristic.write(new Buffer(buff), true, (error) => {
            //console.log(error.toString('hex'));
            console.log("DONE WRITE");
            // characteristic.read((error, data) => {
            //     console.log("DATAREAD: " + data.toString('hex'));
            // });
            // setTimeout(() => {
            //     resolve(true);
            // }, 11000);
        });

    });
}



var calculateChk = function(buff) {
    var ret = 0x00;
    for (var i = 0 ; i < buff.length ; i++) {
		ret += buff[i];
    }
    ret = ret & 255;
    return (ret ^ 255);
}

module.exports = {
    writeAndWait: writeAndWait,
    calculateChk: calculateChk
};
