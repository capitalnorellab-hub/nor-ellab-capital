importScripts(
    "https://www.gstatic.com/firebasejs/12.19.0/firebase-app-compat.js"
);

importScripts(
    "https://www.gstatic.com/firebasejs/12.19.0/firebase-messaging-compat.js"
);

firebase.initializeApp({
    apiKey: "AIzaSyDEfVh4NTouxaLH2Lgi-eT1wwky3fA0ATY",
    authDomain: "nor-ellab-capital-72e92.firebaseapp.com",
    projectId: "nor-ellab-capital-72e92",
    storageBucket: "nor-ellab-capital-72e92.firebasestorage.app",
    messagingSenderId: "901471621790",
    appId: "1:901471621790:web:e83ac520ae5c07cc00218f"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(
    function(payload) {

        const notificationTitle =
            payload.notification?.title ||
            "Nor Ellab Capital";

        const notificationOptions = {

            body:
                payload.notification?.body ||
                "You have a new notification.",

            icon:
                "/favicon.ico"

        };

        self.registration.showNotification(
            notificationTitle,
            notificationOptions
        );
    }
);