/**
 * Profile Edit Mode
 * Handles the edit functionality for the user's own profile
 * Enables adding and editing experiences, certificates, education, and photos
 */

// Import utility functions
import { isProfileOwner } from "./profileUtils.js";

// Initialize edit mode for profile owners
export function initializeEditMode() {
  const isOwner = isProfileOwner();

  if (isOwner) {
    // Enable all edit controls
    showAllEditControls();

    // Enable form submissions
    enableFormSubmissions();

    // Initialize section-specific edit functionality
    initializeExperienceEditing();
    initializeCertificateEditing();
    initializeEducationEditing();
    initializePhotoEditing();

    // Apply edit mode styling
    applyEditModeStyling();
  }

  return isOwner;
}

// Show all edit controls for profile owners
function showAllEditControls() {
  // Show all edit buttons
  const editElements = document.querySelectorAll(
    ".editIcons, #editBtn, #editBtnMain, .edit_bigimage, " +
      "#moreExBtn_EX, #moreExBtn_SP, #moreExBtn_Edu, #moreExBtn_Rating, #moreExBtn_Achievement"
  );

  editElements.forEach((element) => {
    if (element) element.style.display = "block";
  });

  // Show file upload elements
  const uploadElements = document.querySelectorAll(
    "#uploadImageProfile, #uploadImageBackground, #videoInput"
  );

  uploadElements.forEach((element) => {
    if (element && element.parentElement) {
      const uploadTrigger = element.parentElement.querySelector(
        '[aria-label*="تحميل"], [aria-label*="upload"]'
      );
      if (uploadTrigger) {
        uploadTrigger.style.display = "";
      }
    }
  });
}

// Enable form submissions for profile owners
function enableFormSubmissions() {
  // Enable all form inputs
  const formInputs = document.querySelectorAll(
    'input:not([type="hidden"]), textarea, select'
  );

  formInputs.forEach((input) => {
    input.disabled = false;
    input.classList.remove("read-only");
  });

  // Enable form submission buttons
  const submitButtons = document.querySelectorAll(
    'input[type="submit"], button[type="submit"]'
  );
  submitButtons.forEach((button) => {
    button.disabled = false;
  });
}

// Initialize experience section editing
function initializeExperienceEditing() {
  // Add experience button
  const addExpBtn = document.getElementById("edit_addExp");
  if (addExpBtn) {
    addExpBtn.addEventListener("click", () => {
      // Reset form for new entry
      const form = document.getElementById("experienceForm");
      if (form) {
        form.reset();
        delete form.dataset.id;
      }
      common.showPopup("editProfileEx_edit2", "experienceFormScreen");
    });
  }

  // Experience form submission
  const experienceForm = document.getElementById("experienceForm");
  if (experienceForm) {
    experienceForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Validate form
      const title = experienceForm.querySelector("#title").value.trim();
      const company = experienceForm.querySelector("#companyName").value.trim();
      const startDate = experienceForm.querySelector("#expStartDate").value;

      if (!title || !company || !startDate) {
        common.showAlert("خطأ", "يرجى ملء جميع الحقول الإلزامية", "error");
        return;
      }

      // Prepare data
      const data = {
        title: title,
        company: company,
        startDate: startDate,
        endDate: experienceForm.querySelector("#currentlyWorking").checked
          ? null
          : experienceForm.querySelector("#expEndDate").value,
        currentlyWorking:
          experienceForm.querySelector("#currentlyWorking").checked,
        description: experienceForm
          .querySelector("#expDescription")
          .value.trim(),
      };

      try {
        const token = localStorage.getItem("authToken");
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get("id");

        const method = experienceForm.dataset.id ? "PATCH" : "POST";
        const url = experienceForm.dataset.id
          ? `${API_BASE_URL}/experiences/${experienceForm.dataset.id}`
          : `${API_BASE_URL}/experiences`;

        const response = await fetch(url, {
          method,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...data, userId }),
        });

        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

        common.showAlert(
          "تم",
          `تم ${experienceForm.dataset.id ? "تحديث" : "إضافة"} الخبرة بنجاح`,
          "success"
        );
        common.hidePopup("editProfileEx_edit2");

        // Refresh experiences list
        if (window.experienceService) {
          const dataCache = { experiences: null };
          await experienceService.loadSectionData(
            dataCache,
            "#experiencesContainer",
            experienceService.renderItem,
            "#experienceList",
            true
          );
        }
      } catch (error) {
        console.error("Experience form submission error:", error.message);
        common.showAlert("خطأ", "فشل حفظ الخبرة", "error");
      }
    });
  }
}

// Initialize certificate section editing
function initializeCertificateEditing() {
  // Add certificate button
  const addCertBtn = document.getElementById("edit_addCert");
  if (addCertBtn) {
    addCertBtn.addEventListener("click", () => {
      // Reset form for new entry
      const form = document.getElementById("certificateForm");
      if (form) {
        form.reset();
        delete form.dataset.id;
      }
      common.showPopup("editProfileSp_add", "certificateFormScreen");
    });
  }

  // Certificate form submission
  const certificateForm = document.getElementById("certificateForm");
  if (certificateForm) {
    certificateForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Validate form
      const name = certificateForm
        .querySelector("#certificateName")
        .value.trim();
      const issuer = certificateForm
        .querySelector("#issuingAuthority")
        .value.trim();
      const issueDate = certificateForm.querySelector("#certStartDate").value;

      if (!name || !issuer || !issueDate) {
        common.showAlert("خطأ", "يرجى ملء جميع الحقول الإلزامية", "error");
        return;
      }

      // Prepare data
      const data = {
        name: name,
        issuingAuthority: issuer,
        issueDate: issueDate,
        expiryDate: certificateForm.querySelector("#certEndDate").value || null,
        certificateLink:
          certificateForm.querySelector("#certificateLink")?.value.trim() ||
          null,
      };

      try {
        const token = localStorage.getItem("authToken");
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get("id");

        const method = certificateForm.dataset.id ? "PATCH" : "POST";
        const url = certificateForm.dataset.id
          ? `${API_BASE_URL}/certifications`
          : `${API_BASE_URL}/certifications`;

        const response = await fetch(url, {
          method,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...data, userId }),
        });

        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

        common.showAlert(
          "تم",
          `تم ${certificateForm.dataset.id ? "تحديث" : "إضافة"} الشهادة بنجاح`,
          "success"
        );
        common.hidePopup("editProfileSp_add");

        // Refresh certificates list
        if (window.certificateService) {
          const dataCache = { certifications: null };
          await certificateService.loadSectionData(
            dataCache,
            "#certificatesContainer",
            certificateService.renderItem,
            "#certificateList",
            true
          );
        }
      } catch (error) {
        console.error("Certificate form submission error:", error.message);
        common.showAlert("خطأ", "فشل حفظ الشهادة", "error");
      }
    });
  }
}

// Initialize education section editing
function initializeEducationEditing() {
  // Add education button
  const addEduBtn = document.getElementById("edit_addEdu");
  if (addEduBtn) {
    addEduBtn.addEventListener("click", () => {
      // Reset form for new entry
      const form = document.getElementById("educationForm");
      if (form) {
        form.reset();
        delete form.dataset.id;
      }
      common.showPopup("editProfileEdu_add", "educationFormScreen");
    });
  }

  // Education form submission
  const educationForm = document.getElementById("educationForm");
  if (educationForm) {
    educationForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Validate form
      const degree = educationForm.querySelector("#degree").value.trim();
      const institution = educationForm
        .querySelector("#institution")
        .value.trim();
      const field = educationForm.querySelector("#field").value.trim();
      const startDate = educationForm.querySelector("#eduStartDate").value;

      if (!degree || !institution || !field || !startDate) {
        common.showAlert("خطأ", "يرجى ملء جميع الحقول الإلزامية", "error");
        return;
      }

      // Prepare data
      const data = {
        degree: degree,
        school: institution,
        // field: field,
        from: startDate,
        to: educationForm.querySelector("#eduEndDate").value || null,
      };

      try {
        const token = localStorage.getItem("authToken");
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get("id");

        const method = educationForm.dataset.id ? "PATCH" : "POST";
        const url = educationForm.dataset.id
          ? `${API_BASE_URL}/education/${educationForm.dataset.id}`
          : `${API_BASE_URL}/education`;

        const response = await fetch(url, {
          method,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

        common.showAlert(
          "تم",
          `تم ${educationForm.dataset.id ? "تحديث" : "إضافة"} التعليم بنجاح`,
          "success"
        );
        common.hidePopup("editProfileEdu_add");

        // Refresh education list
        if (window.educationService) {
          const dataCache = { education: null };
          await educationService.loadSectionData(
            dataCache,
            "#educationContainer",
            educationService.renderItem,
            "#educationList",
            true
          );
        }
      } catch (error) {
        console.error("Education form submission error:", error.message);
        common.showAlert("خطأ", "فشل حفظ التعليم", "error");
      }
    });
  }
}

// Initialize photo editing functionality
function initializePhotoEditing() {
  // Profile photo upload
  const uploadImageProfile = document.getElementById("uploadImageProfile");
  const editBtnMain = document.getElementById("editBtnMain");

  if (uploadImageProfile && editBtnMain) {
    editBtnMain.addEventListener("click", () => {
      uploadImageProfile.click();
    });

    uploadImageProfile.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Validate file size and type
      if (file.size > 2 * 1024 * 1024) {
        common.showAlert(
          "خطأ",
          "حجم الصورة يجب أن يكون أقل من 2 ميجابايت",
          "error"
        );
        uploadImageProfile.value = "";
        return;
      }

      if (!file.type.startsWith("image/")) {
        common.showAlert("خطأ", "يرجى تحميل ملف صورة صالح", "error");
        uploadImageProfile.value = "";
        return;
      }

      try {
        const formData = new FormData();
        formData.append("image", file);
        const token = localStorage.getItem("authToken");
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get("id");

        const response = await fetch(
          `${API_BASE_URL}/users/profileImg/${userId}`,
          {
            method: "PATCH",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          }
        );

        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();

        // Update profile images
        document
          .querySelectorAll("#image1, #image2, #profileImagePreview")
          .forEach((img) => {
            img.src = data.image_url;
          });

        common.showAlert("تم", "تم تحميل الصورة بنجاح", "success");
        uploadImageProfile.value = "";
      } catch (error) {
        console.error("Image upload error:", error.message);
        common.showAlert("خطأ", "فشل تحميل الصورة", "error");
        uploadImageProfile.value = "";
      }
    });
  }

  // Background photo upload
  const uploadImageBackground = document.getElementById(
    "uploadImageBackground"
  );
  const editBigImage = document.querySelector(".edit_bigimage");

  if (uploadImageBackground && editBigImage) {
    editBigImage.addEventListener("click", () => {
      uploadImageBackground.click();
    });

    uploadImageBackground.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Validate file size and type
      if (file.size > 2 * 1024 * 1024) {
        common.showAlert(
          "خطأ",
          "حجم الصورة يجب أن يكون أقل من 2 ميجابايت",
          "error"
        );
        uploadImageBackground.value = "";
        return;
      }

      if (!file.type.startsWith("image/")) {
        common.showAlert("خطأ", "يرجى تحميل ملف صورة صالح", "error");
        uploadImageBackground.value = "";
        return;
      }

      try {
        const formData = new FormData();
        formData.append("image", file);
        const token = localStorage.getItem("authToken");
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get("id");

        const response = await fetch(
          `${API_BASE_URL}/users/coverImg/${userId}`,
          {
            method: "PATCH",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          }
        );

        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();

        // Update background image
        document.getElementById("background_image").src =
          data.background_image_url;

        common.showAlert("تم", "تم تحميل صورة الخلفية بنجاح", "success");
        uploadImageBackground.value = "";
      } catch (error) {
        console.error("Background image upload error:", error.message);
        common.showAlert("خطأ", "فشل تحميل صورة الخلفية", "error");
        uploadImageBackground.value = "";
      }
    });
  }
}

// Apply edit mode styling
function applyEditModeStyling() {
  // Add edit mode class to profile container
  const profileContainer = document.querySelector("#profile-hero");
  if (profileContainer) {
    profileContainer.classList.add("edit-mode-profile");
  }

  // Style all section containers for edit mode
  const sectionContainers = document.querySelectorAll(
    ".veiw_mentorFormat, .mentor_veiw_con, .left_section"
  );

  sectionContainers.forEach((container) => {
    container.classList.add("edit-mode-section");
  });
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  try {
    initializeEditMode();
  } catch (error) {
    console.error("Failed to initialize edit mode:", error);
  }
});
