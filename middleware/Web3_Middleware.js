const ethUtil = require('ethereumjs-util');

verifySignature = (message, signature, expectedAddress) => {
    try {
        // console.log("Receieved Address : ",expectedAddress)
        const prefixedMessage = ethUtil.hashPersonalMessage(Buffer.from(message));
        const { r, s, v } = ethUtil.fromRpcSig(signature);
        const publicKey = ethUtil.ecrecover(prefixedMessage, v, r, s);
        const recoveredAddress = ethUtil.bufferToHex(ethUtil.pubToAddress(publicKey));
        // console.log("Recovered Address : ",recoveredAddress)
        return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
    } catch (error) {
        console.error('Signature verification error:', error);
        return false;
    }
}

module.exports= {verifySignature}