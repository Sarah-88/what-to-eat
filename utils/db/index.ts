import admin, { ServiceAccount } from 'firebase-admin';
// import { getFirestore } from 'firebase/firestore';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = {
    "type": "service_account",
    "project_id": "what-to-eat-bc4cf",
    "private_key_id": process.env.PRIVATE_KEY_ID,
    "private_key": process.env.PRIVATE_KEY,
    "client_email": "firebase-adminsdk-h8w9g@what-to-eat-bc4cf.iam.gserviceaccount.com",
    "client_id": "108956510172563763666",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-h8w9g%40what-to-eat-bc4cf.iam.gserviceaccount.com"
}

if (!admin.apps.length) {
    initializeApp({
        credential: cert(serviceAccount as ServiceAccount)
    });
}
const db = getFirestore();
// const app = initializeApp(firebaseConfig);
export default db;//getFirestore(app);