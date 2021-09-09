const admin = require('firebase-admin');
admin.initializeApp();

//FIXME: return type
function createClient() {
  return admin.firestore()
}

module.exports = createClient