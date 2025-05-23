window.common = window.common || {};

// Render notifications with flexibility
common.renderNotifications = function (
  currentNotifications,
  updateNotificationCount
) {
  const notificationsContainer = document.querySelector(
    ".notifications-container"
  );
  if (!notificationsContainer) {
    console.warn("Notifications container not found");
    return;
  }
  notificationsContainer.innerHTML = "";

  currentNotifications.forEach((notification, index) => {
    const notificationEl = document.createElement("div");
    notificationEl.className = `notification ${
      notification.compact ? "compact" : ""
    } ${notification.variant || ""}`;
    notificationEl.innerHTML = `
      <div class="notification-left">
        <button class="close-button">×</button>
        ${
          notification.actions && notification.actions.length === 1
            ? `<button class="action-button">${
                notification.actions[0].label || "عمل"
              }</button>`
            : ""
        }
      </div>
      <div class="notification-content">
        <h3 class="notification-title">${
          common.sanitizeHTML(notification.title) || "إشعار"
        }</h3>
        ${
          notification.text
            ? `<p class="notification-text">${common.sanitizeHTML(
                notification.text
              )}</p>`
            : ""
        }
        ${
          notification.actions && notification.actions.length > 1
            ? `<div class="notification-actions">
                ${notification.actions
                  .map(
                    (action) =>
                      `<button class="action-button ${
                        action.primary ? "" : "secondary"
                      }">${
                        common.sanitizeHTML(action.label) || "عمل"
                      }</button>`
                  )
                  .join("")}
              </div>`
            : ""
        }
      </div>
      ${
        notification.avatar
          ? `<div class="notification-right">
              <div class="avatar">
                <img src="${common.sanitizeHTML(
                  notification.avatar
                )}" alt="Avatar" class="avatar-image" />
              </div>
            </div>`
          : ""
      }
    `;

    const closeBtn = notificationEl.querySelector(".close-button");
    closeBtn.addEventListener("click", () => {
      currentNotifications.splice(index, 1);
      common.renderNotifications(
        currentNotifications,
        updateNotificationCount
      );
      updateNotificationCount();
    });

    const actionButtons = notificationEl.querySelectorAll(".action-button");
    actionButtons.forEach((btn, btnIndex) => {
      btn.addEventListener("click", () => {
        console.log(
          `Action clicked: ${
            notification.actions[btnIndex]?.label || "Unknown"
          }`
        );
      });
    });

    notificationsContainer.appendChild(notificationEl);
  });

  const showMoreLink = document.createElement("a");
  showMoreLink.className = "show-more-link arabic";
  showMoreLink.textContent = "عرض المزيد";
  showMoreLink.href = "#";
  notificationsContainer.appendChild(showMoreLink);
};

// Update notification count
common.updateNotificationCount = function (currentNotifications) {
  const notificationCountEl = document.querySelector(".notification-count");
  if (notificationCountEl) {
    notificationCountEl.textContent = currentNotifications.length;
    notificationCountEl.style.display =
      currentNotifications.length > 0 ? "block" : "none";
  }
};

// Toggle notifications
common.toggleNotifications = function () {
  common.restrictAccess(() => {
    const notificationsContainer = document.querySelector(
      ".notifications-container"
    );
    if (!notificationsContainer) return;
    const isVisible = notificationsContainer.style.display === "block";
    notificationsContainer.style.display = isVisible ? "none" : "block";
  });
};