const API_BASE_URL = "https://tawgeeh-v1-production.up.railway.app";

export function sanitizeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str || "";
  return div.innerHTML;
}

export function checkInputDirection(input) {
  const value = input.value || "";
  input.style.direction = /[\u0600-\u06FF]/.test(value) ? "rtl" : "ltr";
  input.style.textAlign = /[\u0600-\u06FF]/.test(value) ? "right" : "left";
}

export async function loadUserProfile() {
  const profileContainer = document.querySelector("#profile-hero");
  if (!profileContainer) return { isProfileOwner: false };

  const token = localStorage.getItem("authToken");
  const urlParams = new URLSearchParams(window.location.search);
  const profileUserId = urlParams.get("id") || (token ? common.decodeJWT(token)?.sub : null);

  if (!profileUserId) {
    if (token) {
      window.location.href = `/profile?id=${common.decodeJWT(token).sub}`;
    } else {
      common.showLoginPopup();
    }
    return { isProfileOwner: false };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/users/${profileUserId}`, {
      method: "GET",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const { success, data: userData } = await response.json();
    if (!success || !userData) throw new Error("Invalid API response");

    const isProfileOwner = token
      ? common.decodeJWT(token)?.sub === userData.id.toString() ||
        common.decodeJWT(token)?.id === userData.id.toString()
      : false;

    // Render profile data
    const image1 = profileContainer.querySelector("#image1");
    const image2 = profileContainer.querySelector("#image2");
    const profileImagePreview = document.getElementById("profileImagePreview");
    const mentorName = profileContainer.querySelector(".mentor_name");
    const mentorJob = profileContainer.querySelector("#mentor_jop");
    const mentorBio = document.querySelector("#mentorBio");
    const linkedinLink = profileContainer.querySelector("#linkedinLink");
    const behanceLink = profileContainer.querySelector("#behanceLink");
    const githubLink = profileContainer.querySelector("#githubLink");
    const instagramLink = profileContainer.querySelector("#instagramLink");
    const totalMinutes = document.getElementById("totalMinutes");
    const totalSessions = document.getElementById("totalSessions");
    const backgroundImage = document.getElementById("background_image");
    const userNameElement = document.querySelector(".user-name");
    const userBioElement = document.querySelector(".user-bio");

    if (image1)
      image1.src = userData.image_url || "../mentor-images/NoProfilePhoto.svg";
    if (image2)
      image2.src = userData.image_url || "../mentor-images/NoProfilePhoto.svg";
    if (profileImagePreview)
      profileImagePreview.src =
        userData.image_url || "../mentor-images/NoProfilePhoto.svg";
    if (mentorName) mentorName.textContent = userData.name || "المرشد الأول";
    if (mentorJob)
      mentorJob.textContent = userData.specialization || "غير محدد";
    if (mentorBio) mentorBio.textContent = userData.bio || "لا توجد نبذة";
    if (linkedinLink) linkedinLink.href = userData.linkedin || "#";
    if (behanceLink) behanceLink.href = userData.behance || "#";
    if (githubLink) githubLink.href = userData.github || "#";
    if (instagramLink) instagramLink.href = userData.instagram || "#";
    if (totalMinutes)
      totalMinutes.textContent = `${userData.totalMinutes || 0} دقيقة`;
    if (totalSessions) totalSessions.textContent = userData.totalSessions || 0;
    if (backgroundImage)
      backgroundImage.src =
        userData.background_url || "../mentor-images/dummyBackground.png";
    if (userNameElement) userNameElement.textContent = userData.name || "";
    if (userBioElement) userBioElement.textContent = userData.bio || "";

    if (isProfileOwner) {
      document.getElementById("mentor_name").value = userData.name || "";
      document.getElementById("about_me").value = userData.bio || "";
      document.getElementById("gender").value =
        userData.gender === "MALE"
          ? "ذكر"
          : userData.gender === "FEMALE"
          ? "أنثى"
          : "غير محدد";
      document.getElementById("country").value = userData.country || "";
      document.getElementById("linkedin").value = userData.linkedin || "";
      document.getElementById("behance").value = userData.behance || "";
      document.getElementById("github").value = userData.github || "";
      document.getElementById("instagram").value = userData.instagram || "";
    }

    return { isProfileOwner, userData, name: userData.name, bio: userData.bio };
  } catch (error) {
    console.error("Failed to load user profile:", error.message);
    common.showAlert("خطأ", "فشل تحميل الملف الشخصي", "error");
    return { isProfileOwner: false };
  }
}

function validateForm(form, type) {
  let isValid = true;
  form.querySelectorAll(".error").forEach((span) => (span.textContent = ""));

  if (type === "professional") {
    const mentorName = form.querySelector("#mentor_name")?.value.trim();
    const gender = form.querySelector("#gender")?.value;
    const country = form.querySelector("#country")?.value;
    const aboutMe = form.querySelector("#about_me")?.value.trim();

    if (!mentorName) {
      form.querySelector("#mentor_nameError").textContent =
        "يرجى إدخال الاسم الكامل";
      isValid = false;
    }
    if (!gender) {
      form.querySelector("#genderError").textContent = "يرجى اختيار الجنس";
      isValid = false;
    }
    if (!country) {
      form.querySelector("#countryError").textContent = "يرجى اختيار البلد";
      isValid = false;
    }
    if (aboutMe.length < 20) {
      form.querySelector("#about_meError").textContent =
        "النبذة يجب أن تكون 20 حرفًا على الأقل";
      isValid = false;
    }
  } else if (type === "social") {
    const linkedin = form.querySelector("#linkedin")?.value.trim();
    const behance = form.querySelector("#behance")?.value.trim();
    const github = form.querySelector("#github")?.value.trim();
    const instagram = form.querySelector("#instagram")?.value.trim();

    if (linkedin && !linkedin.match(/https?:\/\/(www\.)?linkedin\.com\/.+/)) {
      form.querySelector("#linkedinError").textContent =
        "يرجى إدخال رابط LinkedIn صالح";
      isValid = false;
    }
    if (
      behance &&
      !behance.match(/https?:\/\/(www\.)?(behance\.net|dribbble\.com)\/.+/)
    ) {
      form.querySelector("#behanceError").textContent =
        "يرجى إدخال رابط Behance/Dribbble صالح";
      isValid = false;
    }
    if (github && !github.match(/https?:\/\/(www\.)?github\.com\/.+/)) {
      form.querySelector("#githubError").textContent =
        "يرجى إدخال رابط GitHub صالح";
      isValid = false;
    }
    if (
      instagram &&
      !instagram.match(/https?:\/\/(www\.)?instagram\.com\/.+/)
    ) {
      form.querySelector("#instagramError").textContent =
        "يرجى إدخال رابط Instagram صالح";
      isValid = false;
    }
  }

  if (!isValid) {
    const firstError = form.querySelector(".error:not(:empty)");
    if (firstError) {
      firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      firstError.parentElement.querySelector("input,textarea")?.focus();
    }
  }

  return isValid;
}

export function initializeProfilePopup(showPopup, hidePopup) {
  const popup = document.getElementById("editProfileInfo");
  const closeBtn = document.getElementById("closeBtn1");
  const overlay = popup?.parentElement;

  if (closeBtn)
    closeBtn.addEventListener("click", () => hidePopup("editProfileInfo"));
  if (overlay) {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) hidePopup("editProfileInfo");
    });
  }

  const tabs = {
    BasicInfoTab: ["professionalForm", "socialForm"],
    ExperienceTab: ["experienceList"],
    CertificatesTab: ["certificateList"],
    EducationTab: ["educationList"],
  };

  Object.entries(tabs).forEach(([tabId, sections]) => {
    const tab = document.getElementById(tabId);
    if (tab) {
      tab.addEventListener("click", () => {
        Object.keys(tabs).forEach((t) => {
          document.getElementById(t).classList.remove("checked");
          tabs[t].forEach((id) => {
            const el = document.getElementById(id);
            if (el) el.style.display = "none";
          });
        });
        tab.classList.add("checked");
        sections.forEach((id) => {
          const el = document.getElementById(id);
          if (el) el.style.display = "block";
        });

        const addButtons = {
          ExperienceTab: "moreExBtn_EX",
          CertificatesTab: "moreExBtn_SP",
          EducationTab: "moreExBtn_Edu",
        };
        Object.values(addButtons).forEach((btnId) => {
          const btn = document.getElementById(btnId);
          if (btn) btn.style.display = "none";
        });
        if (addButtons[tabId]) {
          document.getElementById(addButtons[tabId]).style.display = "block";
        }
      });
    }
  });

  const professionalForm = document.getElementById("professionalForm");
  if (professionalForm) {
    professionalForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!validateForm(professionalForm, "professional")) return;

      const data = {
        name: professionalForm.querySelector("#mentor_name").value.trim(),
        gender:
          professionalForm.querySelector("#gender").value === "ذكر"
            ? "MALE"
            : professionalForm.querySelector("#gender").value === "أنثى"
            ? "FEMALE"
            : "UNSPECIFIED",
        country: professionalForm.querySelector("#country").value,
        bio: professionalForm.querySelector("#about_me").value.trim(),
      };

      try {
        const token = localStorage.getItem("authToken");
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get("id");

        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        await window.auth.handleApiError(response);

        common.showAlert("تم", "تم تحديث المعلومات الأساسية بنجاح", "success");
        hidePopup("editProfileInfo");
        await loadUserProfile();
      } catch (error) {
        console.error("Professional form submission error:", error.message);
        common.showAlert("خطأ", "فشل تحديث المعلومات الأساسية", "error");
      }
    });
  }

  const socialForm = document.getElementById("socialForm");
  if (socialForm) {
    socialForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!validateForm(socialForm, "social")) return;

      const data = {
        linkedin: socialForm.querySelector("#linkedin").value.trim() || null,
        behance: socialForm.querySelector("#behance").value.trim() || null,
        github: socialForm.querySelector("#github").value.trim() || null,
        instagram: socialForm.querySelector("#instagram").value.trim() || null,
      };

      try {
        const token = localStorage.getItem("authToken");
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get("id");

        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        await window.auth.handleApiError(response);

        common.showAlert("تم", "تم تحديث الروابط الاجتماعية بنجاح", "success");
        hidePopup("editProfileInfo");
        await loadUserProfile();
      } catch (error) {
        console.error("Social form submission error:", error.message);
        common.showAlert("خطأ", "فشل تحديث الروابط الاجتماعية", "error");
      }
    });
  }
}