window.common = window.common || {};

// Helper function to decode JWT token
common.decodeJWT = function (token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.warn("JWT decode error:", error.message);
    return null;
  }
};

// Sanitize HTML input
common.sanitizeHTML = function (str) {
  if (typeof str !== "string") return "";
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
};

// Check input direction (RTL/LTR)
common.checkInputDirection = function (input) {
  const arabicRegex = /[\u0600-\u06FF]/;
  const value = input.value;
  if (value) {
    input.style.direction = arabicRegex.test(value) ? "rtl" : "ltr";
  } else {
    input.style.direction = "ltr";
  }
};

// Show alert with fallback
common.showAlert = function (title, text, icon) {
  if (window.Swal) {
    return window.Swal.fire({
      title,
      text,
      icon,
      confirmButtonText: "موافق",
    });
  } else {
    alert(`${title}: ${text}`);
    return Promise.resolve();
  }
};

// Clear error messages
common.clearError = function (errorSpan) {
  if (errorSpan) errorSpan.textContent = "";
};

// Show error messages
common.showError = function (errorSpan, message) {
  if (errorSpan) errorSpan.innerHTML = message;
};

// Scroll to first error
common.scrollToFirstError = function (form) {
  const firstError = form.querySelector(".error:not(:empty)");
  if (firstError) {
    firstError.scrollIntoView({ behavior: "smooth", block: "center" });
  }
};

// Validate email
common.validateEmail = function (email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Validate password
common.validatePassword = function (password) {
  return password.length >= 8;
};

// Validate LinkedIn URL
common.isValidLinkedInUrl = function (url) {
  try {
    const urlObj = new URL(url);
    return (
      urlObj.hostname === "www.linkedin.com" &&
      urlObj.pathname.startsWith("/in/")
    );
  } catch {
    return false;
  }
};