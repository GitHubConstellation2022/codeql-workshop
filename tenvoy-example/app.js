const { tEnvoy, tEnvoyNaClKey, tEnvoyNaClSigningKey } = require("./lib/tenvoy/node/tenvoy.js");
const envoy = new tEnvoy();

function out(s){
  process.stdout.write(s + '\n')
}

function hashFunc(m){
  return envoy.util.bytesToHex(envoy.core.nacl.hash(envoy.util.pack(m)))
}

const { privateKey, publicKey } = new tEnvoyNaClKey(
  Buffer.from('seeeeeeeeeeeeeeeeeeeeeeeeeeecret'),
  'private'
).genSigningKeys()

out('\n------------------')
out('ALICE - SENDING...')
out('------------------\n')
let message = Buffer.from('The CodeQL workshop starts tomorrow at 2pm IST. Regards, Alice')
out('message: ' + message.toString())

let signature = privateKey.sign(message).signature

let hash = signature.split('::')[0]
out('hash: ' + hash)

let encryptedHash = signature.split('::')[1]
out('encrypted hash: ' + encryptedHash)

let verifyVerified = publicKey.verify(signature).verified
out('verify().verified: ' + verifyVerified.toString())

let verifiedWithMessage = publicKey.verifyWithMessage(signature, message)
out('verifyWithMessage(): ' + verifiedWithMessage.toString())

out('\n------------------')
out('EVE - MAN IN THE MIDDLE...')
out('------------------\n')

process.stdin.on('data', data => {
  out('\n------------------')
  out('Bob - RECEIVING...')
  out('------------------\n')

  message = Buffer.from(data)
  out('message: ' + message.toString().trim())

  signature =
    hashFunc(message) +
    '::' +
    signature.split('::')[1]

  hash = signature.split('::')[0]
  out('hash: ' + hash)

  encryptedHash = signature.split('::')[1]
  out('encrypted hash: ' + encryptedHash)

  verify = publicKey.verify(signature)
  out('verify().verified: ' + verify.verified.toString())

  if (!verify){
    out('Invalid Signature!')
  }

  verifiedWithMessage = publicKey.verifyWithMessage(signature, message)
  out('verifyWithMessage(): ' + verifiedWithMessage.toString())
});


