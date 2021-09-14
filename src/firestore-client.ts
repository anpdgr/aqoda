import admin from 'firebase-admin';
admin.initializeApp();

export default function createClient(): FirebaseFirestore.Firestore {
  return admin.firestore()
}