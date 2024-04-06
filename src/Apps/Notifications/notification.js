function showNotification(
  subject,
  message,
  imageUrl,
  type,
  timeOnScreen,
  Alert
) {
  const notificationPath = "./Apps/Notifications/notification.html";

  const typeColors = {
    success: "#4CAF50",
    error: "#F44336",
    info: "#2196F3",
    warning: "#FFC107",
  };

  fetch(notificationPath)
    .then((response) => response.text())
    .then((html) => {
      let notificationHTML = html
        .replace("{{subject}}", subject)
        .replace("{{message}}", message)
        .replace("{{imageUrl}}", imageUrl)
        .replace("{{typeColor}}", typeColors[type] || "#2196F3"); // Default to info if no type is matched

      const container = document.getElementById("notification-container");
      if (!container) {
        console.error("Notification container not found");
        return;
      }

      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = notificationHTML;
      const notificationElement = tempDiv.firstChild;

      notificationElement.style.borderColor = typeColors[type] || "#2196F3";

      notificationElement.style.animation = `slideIn 0.5s ease`;

      container.appendChild(notificationElement);

      setTimeout(() => {
        notificationElement.style.animation = `slideOut 0.5s ease forwards`;
        setTimeout(() => {
          notificationElement.remove();
        }, 500);
      }, timeOnScreen);
    })
    .catch((error) => {
      console.error("Error fetching notification template:", error);
    });
}
