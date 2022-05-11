const { tEnvoy, tEnvoyNaClKey, tEnvoyNaClSigningKey } = require("./lib/tenvoy/node/tenvoy.js");
const envoy = new tEnvoy();

function out(s){
  process.stdout.write(s + '\n')
}

const { privateKey, publicKey } = new tEnvoyNaClKey(
  Buffer.from('seeeeeeeeeeeeeeeeeeeeeeeeeeecret'),
  'private'
).genSigningKeys()

var message = Buffer.from('hello')
out('message: ' + message.toString())

var signature = privateKey.sign(message).signature
out('signature: ' + signature)

var verifyVerified = publicKey.verify(signature).verified
out('verify().verified: ' + verifyVerified.toString())

var verifiedWithMessage = publicKey.verifyWithMessage(signature, message)
out('verifyWithMessage(): ' + verifiedWithMessage.toString())

out('\n------------------')
out('Modifying message and spoofing signature...')
out('------------------\n')

message = Buffer.from('goodbye')
out('message: ' + message.toString())

signature =
  envoy.util.bytesToHex(envoy.core.nacl.hash(envoy.util.pack(message))) +
  '::' +
  signature.split('::')[1]
out('signature: ' + signature)

verify = publicKey.verify(signature)
out('verify().verified: ' + verify.verified.toString())


if (!verify){
  out('Invalid Signature!')
}

verifiedWithMessage = publicKey.verifyWithMessage(signature, message)
out('verifyWithMessage(): ' + verifiedWithMessage.toString())
