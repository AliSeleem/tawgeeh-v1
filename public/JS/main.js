document.addEventListener("DOMContentLoaded", function () {
  window.common = window.common || {};

  // Initialize all modules
  common.initializeSignupPopup();
  common.initializeLoginPopup(common.showSignupPopup);
  common.initializeMentorApplicationPopup();
  common.initializePasswordResetPopup(common.showSignupPopup);

  const authSection = document.querySelector(".auth-section");
  const currentNotifications = [];
  const updateNotificationCount = () =>
    common.updateNotificationCount(currentNotifications);

  common.initializeAuth(
    authSection,
    currentNotifications,
    common.showLoginPopup,
    common.showSignupPopup,
    common.toggleNotifications,
    updateNotificationCount
  );

  common.renderNotifications(currentNotifications, updateNotificationCount);
});