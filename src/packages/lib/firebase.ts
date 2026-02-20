import admin from "firebase-admin";

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

let messaging: admin.messaging.Messaging | null = null;

if (projectId && clientEmail && privateKey) {
    try {
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId,
                    clientEmail,
                    privateKey,
                }),
            });
        }
        messaging = admin.messaging();
    } catch (err) {
        console.warn("Firebase init skipped:", (err as Error).message);
    }
}

export { messaging };
