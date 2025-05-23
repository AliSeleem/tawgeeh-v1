document.addEventListener("DOMContentLoaded", function () {
  // Redirect to index.html if no authToken
  const accessToken = localStorage.getItem("authToken");
  if (!accessToken) {
    window.location.href = "../index.html";
    return;
  }

  // Initial notification data (same as in sessions.js for consistency)
  let currentNotifications = [
    {
      title: "تنبيه!",
      text: "يمكنك إضافة جلسة جديدة مع الموجه عمر أحمد فتحي.",
      avatar: "../assets/omar.jpg",
      actions: [
        { label: "الإجراء الأول", primary: true },
        { label: "الإجراء الثاني", primary: false },
      ],
      variant: "icon-variant",
    },
    {
      title: "تنبيه!",
      text: "سارة علي حسن قامت بتحديث ملفها الشخصي.",
      avatar: "../mentor-images/mentor2.jpg",
      actions: [{ label: "الإجراء", primary: true }],
      compact: true,
      variant: "icon-variant",
    },
  ];

  // Initialize page components
  async function initializePage() {
    const authSection = document.querySelector(".auth-section");
    if (!authSection) {
      console.warn("Auth section not found");
      return;
    }

    // Initialize auth section using common.js
    window.common.initializeAuth(
      authSection,
      currentNotifications,
      window.common.showLoginPopup,
      window.common.showSignupPopup,
      window.common.toggleNotifications,
      () => window.common.updateNotificationCount(currentNotifications)
    );

    // Initialize popups
    window.common.initializeLoginPopup(window.common.showSignupPopup);
    window.common.initializeMentorApplicationPopup();
    window.common.initializeSignupPopup();
    window.common.initializePasswordResetPopup(window.common.showSignupPopup);

    // Render notifications
    window.common.renderNotifications(currentNotifications, () =>
      window.common.updateNotificationCount(currentNotifications)
    );
  }

  // Initialize the page
  initializePage();
});
