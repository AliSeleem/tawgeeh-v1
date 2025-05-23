const userId = "1"; // Use a string to match backend expectation
const source = new EventSource(
  `https://tawgeeh-v1-production.up.railway.app/notifications/stream?userId=${userId}`
);
let notifications = JSON.parse(localStorage.getItem("notifications") || "[]");
console.log("Initial notifications from localStorage:", notifications);

source.onopen = () => {
  console.log("SSE connection opened");
};

source.onmessage = (event) => {
  console.log("Raw SSE event:", event);
};

source.addEventListener("notification", (event) => {
  const data = JSON.parse(event.data);
  notifications.push(data);
  localStorage.setItem("notifications", JSON.stringify(notifications));
  const li = document.createElement("li");
  li.textContent = `${data.subject}: ${data.content}`;
  document.querySelector("ul").appendChild(li);
  console.log("Received notification:", data);
  console.log("Updated notifications:", notifications);
  // alert(`New Notification: ${data.subject}\n${data.content}`);
});

source.onerror = (error) => {
  console.error("SSE error:", error);
  console.log("EventSource state:", source.readyState);
};

function clearNotifications() {
  notifications = [];
  localStorage.setItem("notifications", JSON.stringify(notifications));
  console.log("Notifications cleared");
}
