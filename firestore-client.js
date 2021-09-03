const admin = require('firebase-admin');
admin.initializeApp();

function createClient() {
  return admin.firestore()
}

module.exports = createClient