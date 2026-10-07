self.addEventListener("push", function (event) {
    let data = {
        title: "Nor Ellab Capital",
        message: "You have a new notification."
    };
    if (event.data) {
        try {
            data = event.data.json();
        } catch (error) {
            data.message = event.data.text();
        }
    }
    const options = {
        body: data.message,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        data: {
            url: data.url || "/dashboard.html"
        },
        vibrate: [200, 100, 200]
    };
    event.waitUntil(
        self.registration.showNotification(
            data.title,
            options
        )
    );
});
self.addEventListener("notificationclick", function (event) {
    event.notification.close();
    const url =
        event.notification.data &&
        event.notification.data.url
            ? event.notification.data.url
            : "/dashboard.html";
    event.waitUntil(
        clients.matchAll({
            type: "window",
            includeUncontrolled: true
        }).then(function (clientList) {
            for (const client of clientList) {
                if ("focus" in client) {
                    client.navigate(url);
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});
