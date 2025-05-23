// main.js
import {
  createCertification,
  getCertifications,
  getCertification,
  updateCertification,
  deleteCertification,
  createExperience,
  getExperiences,
  getExperience,
  updateExperience,
  deleteExperience,
  createEducation,
  getEducation,
  getEducationItem,
  updateEducation,
  deleteEducation,
  createRating,
  getRatings,
  getRating,
  updateRating,
  deleteRating,
  likeRating,
  createAchievement,
  getAchievements,
  getAchievement,
  updateAchievement,
  deleteAchievement,
  createService,
  getServices,
  getService,
  updateService,
  deleteService,
} from "./api.js";

// Cache for storing fetched data to reduce API calls
const dataCache = {
  experiences: null,
  certifications: null,
  education: null,
  ratings: null,
  achievements: null,
  services: null,
};

// Utility Functions
const utils = {
  sanitizeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str || "";
    return div.innerHTML;
  },

  checkInputDirection(input) {
    const value = input.value || "";
    input.style.direction = /[\u0600-\u06FF]/.test(value) ? "rtl" : "ltr";
    input.style.textAlign = /[\u0600-\u06FF]/.test(value) ? "right" : "left";
  },

  formatDate(dateString) {
    if (!dateString) return "الحالي";
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-EG", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  },
};

// Authentication Module
const authModule = {
  async initialize() {
    const authSection = document.querySelector(".left_Sec");
    if (!authSection) return;

    let notificationsData = [];
    try {
      notificationsData = window.auth.fetchNotifications();
      console.log("Notifications loaded:", notificationsData);
    } catch (error) {
      console.error("Failed to fetch notifications:", error.message);
    }

    common.initializeAuth(
      authSection,
      notificationsData,
      common.showLoginPopup,
      common.showSignupPopup,
      common.toggleNotifications,
      () => common.updateNotificationCount(notificationsData)
    );
    common.renderNotifications(notificationsData, () =>
      common.updateNotificationCount(notificationsData)
    );
  },
};

// Profile Module
const profileModule = {
  async loadUserProfile() {
    const profileContainer = document.querySelector("#profile-hero");
    if (!profileContainer) return;

    const token = localStorage.getItem("authToken");
    if (!token) {
      common.showLoginPopup();
      return;
    }

    try {
      const userData = await common.fetchUserData(token);
      const elements = {
        image1: profileContainer.querySelector("#image1"),
        image2: profileContainer.querySelector("#image2"),
        profileImagePreview: document.getElementById("profileImagePreview"),
        mentorName: profileContainer.querySelector(".mentor_name"),
        mentorJob: profileContainer.querySelector("#mentor_jop"),
        mentorBio: document.querySelector("#mentorBio"),
        linkedinLink: profileContainer.querySelector("#linkedinLink"),
        behanceLink: profileContainer.querySelector("#behanceLink"),
        githubLink: profileContainer.querySelector("#githubLink"),
        instagramLink: document.querySelector("#instagramLink"),
        totalMinutes: document.getElementById("totalMinutes"),
        totalSessions: document.getElementById("totalSessions"),
        backgroundImage: document.getElementById("background_image"),
      };

      if (elements.image1)
        elements.image1.src =
          userData.image_url || "../mentor-images/NoProfilePhoto.svg";
      if (elements.image2)
        elements.image2.src =
          userData.image_url || "../mentor-images/NoProfilePhoto.svg";
      if (elements.profileImagePreview)
        elements.profileImagePreview.src =
          userData.image_url || "../mentor-images/NoProfilePhoto.svg";
      if (elements.mentorName)
        elements.mentorName.textContent = userData.name || "المرشد الأول";
      if (elements.mentorJob)
        elements.mentorJob.textContent = userData.specialization || "غير محدد";
      if (elements.mentorBio)
        elements.mentorBio.textContent = userData.bio || "لا توجد نبذة";
      if (elements.linkedinLink)
        elements.linkedinLink.href = userData.linkedin || "#";
      if (elements.behanceLink)
        elements.behanceLink.href = userData.behance || "#";
      if (elements.githubLink)
        elements.githubLink.href = userData.github || "#";
      if (elements.instagramLink)
        elements.instagramLink.href = userData.instagram || "#";
      if (elements.totalMinutes)
        elements.totalMinutes.textContent = `${
          userData.totalMinutes || 0
        } دقيقة`;
      if (elements.totalSessions)
        elements.totalSessions.textContent = userData.totalSessions || 0;
      if (elements.backgroundImage)
        elements.backgroundImage.src =
          userData.background_image_url ||
          "../mentor-images/dummyBackground.png";

      // Populate edit forms
      const formFields = [
        "mentor_name",
        "about_me",
        "gender",
        "country",
        "linkedin",
        "behance",
        "github",
        "instagram",
      ];
      formFields.forEach((field) => {
        const input = document.getElementById(field);
        if (input) input.value = userData[field.replace("_", "")] || "";
      });
    } catch (error) {
      console.error("Failed to load user profile:", error.message);
    }
  },
};

// Popup Module
const popupModule = {
  initializeFlatpickr() {
    const dateInputs = document.querySelectorAll(".date-start, .date-end");
    dateInputs.forEach((input) => {
      flatpickr(input, {
        locale: "ar",
        dateFormat: "Y-m-d",
        allowInput: true,
        altInput: true,
        altFormat: "d/m/Y",
        onChange: (selectedDates, dateStr) => {
          const pairId = input.dataset.pair;
          if (pairId && input.classList.contains("date-start")) {
            const pairInput = document.getElementById(pairId);
            if (pairInput) pairInput._flatpickr.set("minDate", dateStr);
          }
        },
      });
    });
  },

  showPopup(popupId, screenId, data = {}) {
    const popupContainer = document.getElementById(popupId);
    const popupOverlay = popupContainer?.parentElement;
    if (!popupContainer || !popupOverlay) {
      console.error(`Popup container or overlay not found for ID: ${popupId}`);
      return;
    }

    document.querySelectorAll(".overlay.show").forEach((modal) => {
      if (modal !== popupOverlay)
        this.hidePopup(modal.querySelector(".popup-container")?.id);
    });

    popupOverlay.classList.add("show");
    popupOverlay.style.display = "block";
    popupContainer.classList.add("show");
    popupContainer.style.display = "block";

    const screens = popupContainer.querySelectorAll(".popup-screen");
    screens.forEach((screen) => {
      screen.style.display = screen.id === screenId ? "block" : "none";
    });

    const form = popupContainer.querySelector("form");
    if (form) {
      form.reset();
      delete form.dataset.id;
      Object.entries(data).forEach(([key, value]) => {
        const input = form.querySelector(`#${key}`);
        if (input) {
          input[input.type === "checkbox" ? "checked" : "value"] = value || "";
        }
      });
      if (data.id) form.dataset.id = data.id;
      if (data.currentlyWorking !== undefined) {
        const currentlyWorking = form.querySelector("#currentlyWorking");
        if (currentlyWorking) currentlyWorking.checked = data.currentlyWorking;
      }
      form
        .querySelectorAll(".error")
        .forEach((span) => (span.textContent = ""));
      form.querySelectorAll("input, textarea, select").forEach((input) => {
        utils.checkInputDirection(input);
        input.addEventListener("input", () => utils.checkInputDirection(input));
      });
    }

    [
      "hideSignupPopup",
      "hideLoginPopup",
      "hideMentorApplicationPopup",
      "hidePasswordResetPopup",
    ].forEach((fn) => {
      if (typeof common[fn] === "function") common[fn]();
      else console.warn(`Common function ${fn} is not defined`);
    });

    this.initializeFlatpickr();
  },

  hidePopup(popupId) {
    const popupContainer = document.getElementById(popupId);
    const popupOverlay = popupContainer?.parentElement;
    if (!popupContainer || !popupOverlay) {
      console.error(`Popup container or overlay not found for ID: ${popupId}`);
      return;
    }

    if (!popupOverlay.classList.contains("show")) return;

    popupContainer.classList.remove("show");
    popupOverlay.classList.remove("show");

    setTimeout(() => {
      popupContainer.style.display = "none";
      // popupOverlay.style.display = "none";
    }, 300);

    const form = popupContainer.querySelector("form");
    if (form) {
      form.reset();
      delete form.dataset.id;
      form
        .querySelectorAll(".error")
        .forEach((span) => (span.textContent = ""));
      form.querySelectorAll("input, textarea, select").forEach((input) => {
        const clone = input.cloneNode(true);
        input.parentNode.replaceChild(clone, input);
      });
    }
  },
};

// Form Validation Module
const formValidation = {
  validateForm(form, type) {
    let isValid = true;
    form.querySelectorAll(".error").forEach((span) => (span.textContent = ""));

    const validations = {
      professional: [
        {
          id: "mentor_name",
          error: "يرجى إدخال الاسم الكامل",
          check: (v) => v.trim(),
        },
        { id: "gender", error: "يرجى اختيار الجنس", check: (v) => v },
        { id: "country", error: "يرجى اختيار البلد", check: (v) => v },
        {
          id: "about_me",
          error: "النبذة يجب أن تكون 20 حرفًا على الأقل",
          check: (v) => v.trim().length >= 20,
        },
      ],
      social: [
        {
          id: "linkedin",
          error: "يرجى إدخال رابط LinkedIn صالح",
          check: (v) => !v || v.match(/https?:\/\/(www\.)?linkedin\.com\/.+/),
        },
        {
          id: "behance",
          error: "يرجى إدخال رابط Behance/Dribbble صالح",
          check: (v) =>
            !v ||
            v.match(/https?:\/\/(www\.)?(behance\.net|dribbble\.com)\/.+/),
        },
        {
          id: "github",
          error: "يرجى إدخال رابط GitHub صالح",
          check: (v) => !v || v.match(/https?:\/\/(www\.)?github\.com\/.+/),
        },
        {
          id: "instagram",
          error: "يرجى إدخال رابط Instagram صالح",
          check: (v) => !v || v.match(/https?:\/\/(www\.)?instagram\.com\/.+/),
        },
      ],
      experience: [
        {
          id: "title",
          error: "يرجى إدخال المسمى الوظيفي",
          check: (v) => v.trim(),
        },
        {
          id: "companyName",
          error: "يرجى إدخال اسم الشركة",
          check: (v) => v.trim(),
        },
        {
          id: "expStartDate",
          error: "يرجى إدخال تاريخ البدء",
          check: (v) => v,
        },
        {
          id: "expDescription",
          error: "يرجى إدخال الوصف",
          check: (v) => v.trim(),
        },
      ],
      certificate: [
        {
          id: "certificateName",
          error: "يرجى إدخال اسم الشهادة",
          check: (v) => v.trim(),
        },
        {
          id: "issuingAuthority",
          error: "يرجى إدخال الجهة المصدرة",
          check: (v) => v.trim(),
        },
        {
          id: "certStartDate",
          error: "يرجى إدخال تاريخ الإصدار",
          check: (v) => v,
        },
        {
          id: "certificateNumber",
          error: "يرجى إدخال رقم الشهادة",
          check: (v) => v.trim(),
        },
      ],
      education: [
        {
          id: "degree",
          error: "يرجى إدخال الدرجة العلمية",
          check: (v) => v.trim(),
        },
        {
          id: "institution",
          error: "يرجى إدخال المؤسسة",
          check: (v) => v.trim(),
        },
        { id: "field", error: "يرجى إدخال التخصص", check: (v) => v.trim() },
        {
          id: "eduStartDate",
          error: "يرجى إدخال تاريخ البدء",
          check: (v) => v,
        },
      ],
      rating: [
        {
          id: "reviewerName",
          error: "يرجى إدخال اسم المراجع",
          check: (v) => v.trim(),
        },
        {
          id: "comment",
          error: "يرجى إدخال التعليق",
          check: (v) => v.trim(),
        },
        {
          id: "ratingScore",
          error: "يرجى إدخال تقييم بين 1 و5",
          check: (v) => v && v >= 1 && v <= 5,
        },
      ],
      achievement: [
        {
          id: "achievementTitle",
          error: "يرجى إدخال عنوان الإنجاز",
          check: (v) => v.trim(),
        },
        {
          id: "achievementDescription",
          error: "يرجى إدخال الوصف",
          check: (v) => v.trim(),
        },
        {
          id: "achievedAt",
          error: "يرجى إدخال تاريخ الإنجاز",
          check: (v) => v,
        },
      ],
      service: [
        {
          id: "serviceTitle",
          error: "يرجى إدخال عنوان الخدمة",
          check: (v) => v.trim(),
        },
        {
          id: "serviceDescription",
          error: "يرجى إدخال الوصف",
          check: (v) => v.trim(),
        },
      ],
    };

    (validations[type] || []).forEach(({ id, error, check }) => {
      const input = form.querySelector(`#${id}`);
      if (input && !check(input.value)) {
        form.querySelector(`#${id}Error`).textContent = error;
        isValid = false;
      }
    });

    if (!isValid) {
      const firstError = form.querySelector(".error:not(:empty)");
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
        firstError.parentElement.querySelector("input,textarea")?.focus();
      }
    }

    return isValid;
  },
};

// Section Module
const sectionModule = {
  async loadSectionData(section, containerId, renderFn, listId) {
    console.log("List ID " + listId);
    const container = document.querySelector(containerId);

    const listContainer = document.getElementById(listId);
    console.log(listContainer);
    if (!container || !listContainer) return;

    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No auth token found");

      const decodedToken = common.decodeJWT(token);
      const userId = decodedToken?.sub || decodedToken?.id;
      if (!userId) throw new Error("Invalid token: User ID not found");

      let items = dataCache[section];
      if (items === null) {
        items =
          section === "certifications"
            ? await getCertifications(userId, token)
            : section === "experiences"
            ? await getExperiences(userId, token)
            : section === "education"
            ? await getEducation(userId, token)
            : section === "ratings"
            ? await getRatings(userId, token)
            : section === "achievements"
            ? await getAchievements(userId, token)
            : await getServices(userId, token);
        dataCache[section] = items;
      }
      container.innerHTML = "";
      listContainer.innerHTML = "";
      if (items.length === 0) {
        container.innerHTML = `<p class="no-data">لا توجد نتائج لعرضها</p>`;
        listContainer.innerHTML = `<p class="no-data">لا توجد نتائج لعرضها</p>`;
        return;
      }

      console.log("Items loaded for" + section + ":", items);

      items.forEach((item, index) => {
        renderFn(container, item, false);
        renderFn(listContainer, item, true);
        // if (
        //   section === "certifications" &&
        //   index >= 3 &&
        //   containerId === "#certificatesContainer"
        // ) {
        //   const hiddenContainer =
        //     document.getElementById("hiddenCertificates") ||
        //     document.createElement("div");
        //   hiddenContainer.id = "hiddenCertificates";
        //   hiddenContainer.style.display = "none";
        //   container.appendChild(hiddenContainer);
        //   hiddenContainer.appendChild(container.lastChild);
        // }
      });

      if (section === "certifications") {
        const moreBtn = document.getElementById("moreBtnCert");
        if (moreBtn && items.length > 3) {
          moreBtn.style.display = "block";
          const btnText = moreBtn.querySelector(".btn-text");
          btnText.textContent = `عرض المزيد +${items.length - 3}`;
          let isExpanded = false;
          moreBtn.onclick = () => {
            isExpanded = !isExpanded;
            const hiddenContainer =
              document.getElementById("hiddenCertificates");
            hiddenContainer.style.display = isExpanded ? "block" : "none";
            btnText.textContent = isExpanded
              ? "عرض أقل"
              : `عرض المزيد +${items.length - 3}`;
            moreBtn.querySelector(".more-icon").style.transform = isExpanded
              ? "rotate(180deg)"
              : "rotate(0deg)";
          };
        } else if (moreBtn) {
          moreBtn.style.display = "none";
        }
      }
    } catch (error) {
      console.error(`Failed to load ${section}:`, error.message);
      container.innerHTML = `<p class="no-data">لا توجد نتائج لعرضها</p>`;
      listContainer.innerHTML = `<p class="no-data">لا توجد نتائج لعرضها</p>`;
    }
  },

  renderExperience(container, item, isList) {
    const div = document.createElement("div");
    div.className = "second_con";
    div.innerHTML = `
      <div class="veiw_con">
        <img src="../mentor-images/briefcase.svg" alt="أيقونة عمل">
        <div class="text">
          <h4>${utils.sanitizeHTML(
            item.jobTitle || item.title || "غير محدد"
          )}</h4>
          <p>${utils.sanitizeHTML(
            item.companyName || item.company || "غير محدد"
          )}</p>
          ${
            isList
              ? ""
              : `<p>${utils.sanitizeHTML(
                  item.description || "لا يوجد وصف"
                )}</p>`
          }
        </div>
      </div>
      <div class="${isList ? "date2_con" : "date2"}">
        <p>${utils.formatDate(item.startDate)} - ${
      item.endDate ? utils.formatDate(item.endDate) : "الحالي"
    }</p>
        ${
          isList
            ? `
          <img src="../mentor-images/edit-2.svg" alt="تعديل" class="edit-exp" data-id="${item.id}">
          <img src="../mentor-images/trash.svg" alt="حذف" class="delete-exp" data-id="${item.id}">
        `
            : ""
        }
      </div>
    `;
    container.appendChild(div);
  },

  renderCertificate(container, item, isList) {
    const div = document.createElement("div");
    div.className = "second_con";
    div.innerHTML = `
      <div class="veiw_con">
        <img src="${utils.sanitizeHTML(
          item.image_url || "../mentor-images/default-cert.jpg"
        )}" width="100px" alt="صورة الشهادة">
        <div class="text">
          <h4>${utils.sanitizeHTML(item.name || "غير محدد")}</h4>
          <p>${utils.sanitizeHTML(
            item.donor || item.issuingAuthority || "غير محدد"
          )}</p>
          <p>${utils.formatDate(item.date)}</p>
        </div>
      </div>
      <div class="education">
        <div class="edu_con">
          ${
            item.link
              ? `<a href="${utils.sanitizeHTML(
                  item.link
                )}" target="_blank">عرض الشهادة</a>`
              : "<p>عرض الشهادة</p>"
          }
          <img src="../mentor-images/export.svg" alt="عرض">
        </div>
        ${
          isList
            ? `
          <img src="../mentor-images/edit-2.svg" alt="تعديل" class="edit-cert" data-id="${item.id}">
          <img src="../mentor-images/trash.svg" alt="حذف" class="delete-cert" data-id="${item.id}">
        `
            : ""
        }
      </div>
    `;
    container.appendChild(div);
  },

  renderEducation(container, item, isList) {
    const div = document.createElement("div");
    div.className = "second_con";
    div.innerHTML = `
      <div class="veiw_con">
        <img src="../mentor-images/education.svg" alt="أيقونة تعليم">
        <div class="text">
          <h4>${utils.sanitizeHTML(item.degree || "غير محدد")}</h4>
          <p>${utils.sanitizeHTML(item.institution || "غير محدد")}</p>
        </div>
      </div>
      <div class="${isList ? "date2_con" : "date2"}">
        <p>${utils.formatDate(item.startDate)} - ${utils.formatDate(
      item.endDate
    )}</p>
        ${
          isList
            ? `
          <img src="../mentor-images/edit-2.svg" alt="تعديل" class="edit-edu" data-id="${item.id}">
          <img src="../mentor-images/trash.svg" alt="حذف" class="delete-edu" data-id="${item.id}">
        `
            : ""
        }
      </div>
    `;
    container.appendChild(div);
  },

  renderRating(container, item, isList) {
    const div = document.createElement("div");
    div.className = "session1 sessionsFormat";
    const starsHtml = "";
    const formattedDate = new Date(
      item.createdAt || item.date
    ).toLocaleDateString("ar-EG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    div.innerHTML = `
      <div class="session_con">
        <img class="menteePhoto" src="${utils.sanitizeHTML(
          item.menteeImage || "../mentor-images/default-user.jpg"
        )}" alt="مجهول" />
        <div class="time timeR">
          <h4>${utils.sanitizeHTML(
            item.reviewerName || item.menteeName || "مجهول"
          )}</h4>
          <p>${utils.sanitizeHTML(item.comment || "لا يوجد تعليق")}</p>
          <div class="stars_con">
            <p>${item.stars.toFixed(1)}</p>
            <div class="stars">${starsHtml}</div>
          </div>
        </div>
        <div class="rette-con">
          <div class="ratte">
            <span><p>${(Math.random() * 10).toFixed(
              1
            )}</p><img src="../mentor-images/hand-thumb-up.svg" alt="Likes" /></span>
            <span><p>رد</p><img src="../mentor-images/chat-bubble-oval-left-ellipsis.svg" alt="Reply" /></span>
          </div>
          <div class="date dateR"><p>${formattedDate}</p></div>
        </div>
      </div>
      ${
        isList
          ? `
        <div class="edit-actions">
          <button class="edit-btn" data-id="${item.id}">تعديل</button>
          <button class="delete-btn" data-id="${item.id}">حذف</button>
          <button class="like-btn" data-id="${item.id}">${
              item.liked ? "إلغاء الإعجاب" : "إعجاب"
            }</button>
        </div>
      `
          : ""
      }
    `;
    console.log(div);
    container.appendChild(div);
  },

  generateStars(rating) {
    const filledStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - filledStars - halfStar;
    return `
      ${'<img src="../mentor-images/ic_baseline-star.svg" alt="Filled Star" />'.repeat(
        filledStars
      )}
      ${
        halfStar
          ? '<img src="../mentor-images/IcBaselineStarHalf.svg" alt="Half Star" />'
          : ""
      }
      ${'<img src="../mentor-images/ic_baseline-star (1).svg" alt="Empty Star" />'.repeat(
        emptyStars
      )}
    `;
  },

  renderAchievement(container, item, isList) {
    const div = document.createElement("div");
    div.className = "session1 sessionsFormat";
    const progress = item.unlocked ? 100 : item.progress || 0;
    div.innerHTML = `
      <div class="session_con">
        <img class="AchievementPhoto" src="${utils.sanitizeHTML(
          item.icon || "../mentor-images/default-achievement.svg"
        )}" alt="إنجاز" />
        <div class="time">
          <h4>${utils.sanitizeHTML(item.title || "بدون عنوان")}</h4>
          <p>${utils.sanitizeHTML(item.description || "بدون وصف")}</p>
        </div>
      </div>
      ${
        item.unlocked
          ? `<div class="date"><p>${utils.formatDate(
              item.achievedAt || item.date
            )}</p></div>`
          : `<div class="progress"><progress value="${progress}" max="100"></progress><span>${progress}%</span></div>`
      }
      ${
        isList
          ? `
        <div class="edit-actions">
          <button class="edit-btn" data-id="${item.id}">تعديل</button>
          <button class="delete-btn" data-id="${item.id}">حذف</button>
        </div>
      `
          : ""
      }
    `;
    container.appendChild(div);
  },

  renderService(container, item, isList) {
    console.log(item)
    const div = document.createElement("div");
    div.className = "session1 sessionsFormat";
    div.innerHTML = `
    <div class="service-card">
      <div class="service-content">
        <div class="service-header">
          <div class="edit-dropdown">
            <div class="gear-icon">
              <i
                class="fas fa-cog"
                style="color: #555; font-size: 14px"
              ></i>
            </div>
            <div class="edit-actions" style="display: none">
              <div class="edit-action">
                <i class="fas fa-pen edit-icon"></i>
                <span>تعديل</span>
              </div>
              <div class="edit-action delete-action">
                <i class="fas fa-trash-alt delete-icon"></i>
                <span>حذف</span>
              </div>
            </div>
          </div>
          <div class="service-title">${item.name}</div>
        </div>

        <div class="service-details">
          <div class="service-type">عامة</div>
          <div class="service-duration">${item.duration} minutes</div>
        </div>

        <div class="service-platform">
          <span>Google Meet</span>
          <span class="question-icon"
            ><img src="../mentor-images/meet.svg" alt=""
          /></span>
        </div>

        <div class="service-actions">
          <div class="action-button">
            <span>مشاركة</span>
            <span class="question-icon"
              ><img src="../mentor-images/uil_share.svg" alt=""
            /></span>
          </div>
          <div class="action-button copy-link">
            <span>نسخ الرابط</span>
            <i class="fas fa-link copy-icon"></i>
          </div>
        </div>
      </div>
    </div>
    `;
    container.appendChild(div);
  },

  async deleteItem(section, id, containerId, listId, renderFn) {
    try {
      const token = localStorage.getItem("authToken");
      await (section === "certifications"
        ? deleteCertification(id, token)
        : section === "experiences"
        ? deleteExperience(id, token)
        : section === "education"
        ? deleteEducation(id, token)
        : section === "ratings"
        ? deleteRating(id, token)
        : section === "achievements"
        ? deleteAchievement(id, token)
        : deleteService(id, token));
      common.showAlert("تم", "تم الحذف بنجاح", "success");
      dataCache[section] = null;
      await this.loadSectionData(section, containerId, renderFn, listId);
    } catch (error) {
      console.error(`Delete ${section} error:`, error.message);
    }
  },

  async likeRating(id) {
    try {
      const token = localStorage.getItem("authToken");
      await likeRating(id, token);
      common.showAlert("تم", "تم الإعجاب بالتقييم", "success");
      dataCache.ratings = null;
      await this.loadSectionData(
        "ratings",
        "#ratingContent",
        this.renderRating,
        "ratingList"
      );
    } catch (error) {
      console.error("Like rating error:", error.message);
    }
  },
};

// Form Handler Module
const formHandler = {
  initializeForm(
    formId,
    type,
    endpoint,
    successMessage,
    section,
    containerId,
    listId,
    renderFn,
    popupId
  ) {
    const form = document.getElementById(formId);
    if (!form) return;

    if (type === "experience") {
      const currentlyWorking = form.querySelector("#currentlyWorking");
      const endDateInput = form.querySelector("#expEndDate");
      if (currentlyWorking) {
        currentlyWorking.addEventListener("change", (e) => {
          endDateInput.disabled = e.target.checked;
          if (e.target.checked) endDateInput.value = "";
        });
      }
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!formValidation.validateForm(form, type)) return;

      const data = {};
      form.querySelectorAll("input, textarea, select").forEach((input) => {
        if (input.type === "checkbox") {
          data[input.id] = input.checked || false;
        } else if (input.value) {
          data[input.id] = input.value.trim();
        }
      });

      try {
        const token = localStorage.getItem("authToken");
        const decodedToken = common.decodeJWT(token);
        const userId = decodedToken?.sub || decodedToken?.id;

        let apiData;
        if (type === "certificate") {
          apiData = {
            name: data.certificateName,
            link: data.certificateLink,
            donor: data.issuingAuthority,
            date: data.certStartDate,
            expireAt: data.certEndDate,
            number: data.certificateNumber,
          };
        } else if (type === "experience") {
          apiData = {
            title: data.title,
            company: data.companyName,
            from: data.expStartDate,
            to: data.currentlyWorking ? null : data.expEndDate,
            summary: data.expDescription,
            stillThere: data.currentlyWorking ?? false,
          };
        } else if (type === "education") {
          apiData = {
            school: data.degree,
            degree: data.institution,
            from: data.eduStartDate,
            to: data.eduEndDate,
          };
        } else if (type === "rating") {
          apiData = {
            reviewerName: data.reviewerName,
            comment: data.comment,
            rating: parseInt(data.ratingScore),
          };
        } else if (type === "achievement") {
          apiData = {
            title: data.achievementTitle,
            description: data.achievementDescription,
            date: data.achievedAt,
          };
        } else if (type === "service") {
          apiData = {
            title: data.serviceTitle,
            description: data.serviceDescription,
          };
        } else {
          apiData = data;
        }

        if (form.dataset.id) {
          // Update existing item
          await (type === "certificate"
            ? updateCertification(form.dataset.id, apiData, token)
            : type === "experience"
            ? updateExperience(form.dataset.id, apiData, token)
            : type === "education"
            ? updateEducation(form.dataset.id, apiData, token)
            : type === "rating"
            ? updateRating(form.dataset.id, apiData, token)
            : type === "achievement"
            ? updateAchievement(form.dataset.id, apiData, token)
            : type === "service"
            ? updateService(form.dataset.id, apiData, token)
            : common.updateUser(apiData, token));
        } else {
          // Create new item
          console.log("apiData");
          await (type === "certificate"
            ? createCertification(apiData, token)
            : type === "experience"
            ? createExperience(apiData, token, userId)
            : type === "education"
            ? createEducation(apiData, token, userId)
            : type === "rating"
            ? createRating(apiData, token, userId)
            : type === "achievement"
            ? createAchievement(apiData, token, userId)
            : type === "service"
            ? createService(apiData, token, userId)
            : common.updateUser(apiData, token));
        }
        console.log("llllllllllllllllllllllllll");

        common.showAlert("تم", successMessage, "success");
        if (section) {
          dataCache[section] = null;
          await sectionModule.loadSectionData(
            section,
            containerId,
            renderFn,
            listId
          );
        }
        popupModule.hidePopup(popupId);
      } catch (error) {
        console.error(`${type} form submission error:`, error.message);
      }
    });
  },

  initializeProfileForms() {
    this.initializeForm(
      "professionalForm",
      "professional",
      "users",
      "تم تحديث المعلومات الأساسية بنجاح",
      null,
      null,
      null,
      null,
      "editProfileInfo"
    );
    this.initializeForm(
      "socialForm",
      "social",
      "users",
      "تم تحديث الروابط الاجتماعية بنجاح",
      null,
      null,
      null,
      null,
      "editProfileInfo"
    );
    this.initializeForm(
      "experienceForm",
      "experience",
      "experiences",
      "تم حفظ الخبرة بنجاح",
      "experiences",
      "#experiencesContainer",
      "experienceList",
      sectionModule.renderExperience,
      "editProfileEx_edit2"
    );
    this.initializeForm(
      "certificateForm",
      "certificate",
      "certifications",
      "تم حفظ الشهادة بنجاح",
      "certifications",
      "#certificatesContainer",
      "certificateList",
      sectionModule.renderCertificate,
      "editProfileSp_add"
    );
    this.initializeForm(
      "educationForm",
      "education",
      "education",
      "تم حفظ التعليم بنجاح",
      "education",
      "#educationContainer",
      "educationList",
      sectionModule.renderEducation,
      "editProfileEdu_add"
    );
    this.initializeForm(
      "ratingForm",
      "rating",
      "ratings",
      "تم حفظ التقييم بنجاح",
      "ratings",
      "#ratingContent",
      "ratingList",
      sectionModule.renderRating,
      "editProfileRating_add"
    );
    this.initializeForm(
      "achievementForm",
      "achievement",
      "achievements",
      "تم حفظ الإنجاز بنجاح",
      "achievements",
      "#achievementsContent",
      "achievementList",
      sectionModule.renderAchievement,
      "editProfileAchievement_add"
    );
    this.initializeForm(
      "serviceForm",
      "service",
      "services",
      "تم حفظ الخدمة بنجاح",
      "services",
      "#servicesContent",
      "servicesList",
      sectionModule.renderService,
      "editProfileService_add"
    );
  },
};

// Image Upload Module
const imageUpload = {
  initialize() {
    const uploadImage = document.getElementById("uploadImage");
    const uploadImageBackground = document.getElementById(
      "uploadImageBackground"
    );
    const profileImagePreview = document.getElementById("profileImagePreview");
    const editBtnMain = document.getElementById("editBtnMain");
    const removeProfileImage = document.getElementById("removeProfileImage");
    const videoInput = document.getElementById("videoInput");

    if (uploadImage && profileImagePreview) {
      uploadImage.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (file && file.size > 2 * 1024 * 1024) {
          common.showAlert(
            "خطأ",
            "حجم الصورة يجب أن يكون أقل من 2 ميجا بايت",
            "error"
          );
          return;
        }

        try {
          const formData = new FormData();
          formData.append("image", file);
          const token = localStorage.getItem("authToken");
          const decodedToken = common.decodeJWT(token);
          const userId = decodedToken?.sub || decodedToken?.id;
          const data = await apiRequest(
            `/users/profileImg/${userId}`,
            "PATCH",
            formData,
            token,
            true
          );
          profileImagePreview.src = data.image_url;
          await profileModule.loadUserProfile();
        } catch (error) {
          console.error("Image upload error:", error.message);
        }
      });
    }

    if (uploadImageBackground) {
      uploadImageBackground.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
          const formData = new FormData();
          formData.append("image", file);
          const token = localStorage.getItem("authToken");
          const decodedToken = common.decodeJWT(token);
          const userId = decodedToken?.sub || decodedToken?.id;
          const data = await apiRequest(
            `/users/coverImg/${userId}`,
            "POST",
            formData,
            token,
            true
          );
          document.getElementById("background_image").src =
            data.background_image_url;
          await profileModule.loadUserProfile();
        } catch (error) {
          console.error("Background image upload error:", error.message);
        }
      });
    }

    if (videoInput) {
      videoInput.addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (
          file &&
          file.type.includes("mp4") &&
          file.size <= 25 * 1024 * 1024
        ) {
          try {
            const formData = new FormData();
            formData.append("video", file);
            const token = localStorage.getItem("authToken");
            const decodedToken = common.decodeJWT(token);
            const userId = decodedToken?.sub || decodedToken?.id;
            const data = await apiRequest(
              `/users/${userId}/upload-video`,
              "POST",
              formData,
              token,
              true
            );
            const videoPlayer = document.getElementById("videoPlayer");
            videoPlayer.src = data.video_url;
            videoPlayer.style.display = "block";
            document.getElementById("uplodimage").style.display = "none";
            document.getElementById("uplodeBtn").style.display = "none";
            document.getElementById("size").style.display = "none";
            await profileModule.loadUserProfile();
          } catch (error) {
            console.error("Video upload error:", error.message);
          }
        } else {
          common.showAlert(
            "خطأ",
            "يجب أن يكون الفيديو بصيغة MP4 وحجمه أقل من 25 ميجابايت",
            "error"
          );
        }
      });
    }

    if (editBtnMain)
      editBtnMain.addEventListener("click", () => uploadImage.click());

    if (removeProfileImage) {
      removeProfileImage.addEventListener("click", async () => {
        try {
          const token = localStorage.getItem("authToken");
          const decodedToken = common.decodeJWT(token);
          const userId = decodedToken?.sub || decodedToken?.id;
          await apiRequest(
            `/users/${userId}/remove-image`,
            "DELETE",
            null,
            token
          );
          profileImagePreview.src = "../mentor-images/personal_image.png";
          await profileModule.loadUserProfile();
        } catch (error) {
          console.error("Image removal error:", error.message);
        }
      });
    }
  },
};

// Tab Module
const tabModule = {
  switchTab(tabName) {
    const tabs = {
      overview: {
        content: "overviewContent",
        tab: "overviewTab",
        section: null,
      },
      services: {
        content: "servicesContent",
        tab: "servicesTab",
        section: "services",
      },
      rating: {
        content: "ratingContent",
        tab: "ratingTab",
        section: "ratings",
      },
      achievements: {
        content: "achievementsContent",
        tab: "achievementsTab",
        section: "achievements",
      },
    };

    Object.values(tabs).forEach(({ content, tab }) => {
      const contentElement = document.getElementById(content);
      if (contentElement) contentElement.style.display = "none";
      const tabElement = document.getElementById(tab);
      if (tabElement) tabElement.classList.remove("checked");
    });

    const selectedContent = document.getElementById(tabs[tabName].content);
    console.log("selectedConten a7aaaaaaaaaa", selectedContent);
    const selectedTab = document.getElementById(tabs[tabName].tab);
    if (selectedContent) selectedContent.style.display = "block";
    if (selectedTab) selectedTab.classList.add("checked");
    if (tabs[tabName].section === 'services') document.getElementById("addNewService").style.display = "block";

    if (tabs[tabName].section) {
      sectionModule.loadSectionData(
        tabs[tabName].section,
        `#${tabs[tabName].content}`,
        tabs[tabName].section === "ratings"
          ? sectionModule.renderRating
          : tabs[tabName].section === "achievements"
          ? sectionModule.renderAchievement
          : sectionModule.renderService,
        `${tabs[tabName].section}List`
      );
    }
  },

  initializeProfileTabs() {
    const tabs = {
      BasicInfoTab: ["professionalForm", "socialForm"],
      ExperienceTab: ["experienceList"],
      CertificatesTab: ["certificateList"],
      EducationTab: ["educationList"],
      RatingsTab: ["ratingList"],
      AchievementsTab: ["achievementList"],
      ServicesTab: ["servicesList"],
    };

    Object.entries(tabs).forEach(([tabId, sections]) => {
      const tab = document.getElementById(tabId);
      if (tab) {
        tab.addEventListener("click", async () => {
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
            RatingsTab: "moreExBtn_Rating",
            AchievementsTab: "moreExBtn_Achievement",
            ServicesTab: "moreExBtn_Service",
          };
          Object.values(addButtons).forEach((btnId) => {
            const btn = document.getElementById(btnId);
            if (btn) btn.style.display = "none";
          });
          if (addButtons[tabId])
            document.getElementById(addButtons[tabId]).style.display = "block";

          const sectionMap = {
            ExperienceTab: "experiences",
            CertificatesTab: "certifications",
            EducationTab: "education",
            RatingsTab: "ratings",
            AchievementsTab: "achievements",
            ServicesTab: "services",
          };
          if (sectionMap[tabId]) {

            console.log(sectionMap[tabId]);
            await sectionModule.loadSectionData(
              sectionMap[tabId],
              `#${sectionMap[tabId]}Container`,
              sectionMap[tabId] === "ratings"
                ? sectionModule.renderRating
                : sectionMap[tabId] === "achievements"
                ? sectionModule.renderAchievement
                : sectionMap[tabId] === "experiences"
                ? sectionModule.renderExperience
                : sectionMap[tabId] === "certifications"
                ? sectionModule.renderCertificate
                : sectionMap[tabId] === "education"
                ? sectionModule.renderEducation
                : sectionModule.renderService,
              `${sectionMap[tabId]}List`
            );
          }
        });
      }
    });
  },
};

// Ratings Tab
const ratingsModule = {};

// Event Listeners Module
const eventListeners = {
  initialize() {
    const openModalConfigs = [
      {
        btnId: "editBtn",
        modalId: "editProfileInfo",
        screenId: "professionalForm",
      },
      {
        btnId: "editBtnMain",
        modalId: "editProfileInfo",
        screenId: "professionalForm",
      },
      {
        btnId: "edit_2BtnExp",
        modalId: "editProfileEx_edit",
        screenId: "experienceList",
      },
      {
        btnId: "edit_addExp",
        modalId: "editProfileEx_edit2",
        screenId: "experienceFormScreen",
      },
      {
        btnId: "moreExBtn_EX",
        modalId: "editProfileEx_edit2",
        screenId: "experienceFormScreen",
      },
      {
        btnId: "edit_2BtnCert",
        modalId: "editProfileSp_edit",
        screenId: "certificateList",
      },
      {
        btnId: "edit_addCert",
        modalId: "editProfileSp_add",
        screenId: "certificateFormScreen",
      },
      {
        btnId: "moreExBtn_SP",
        modalId: "editProfileSp_add",
        screenId: "certificateFormScreen",
      },
      {
        btnId: "edit_2BtnEdu",
        modalId: "editProfileEdu_edit",
        screenId: "educationList",
      },
      {
        btnId: "edit_addEdu",
        modalId: "editProfileEdu_add",
        screenId: "educationFormScreen",
      },
      {
        btnId: "moreExBtn_Edu",
        modalId: "editProfileEdu_add",
        screenId: "educationFormScreen",
      },
      {
        btnId: "edit_2BtnRating",
        modalId: "editProfileRating_edit",
        screenId: "ratingList",
      },
      {
        btnId: "edit_addRating",
        modalId: "editProfileRating_add",
        screenId: "ratingFormScreen",
      },
      {
        btnId: "moreExBtn_Rating",
        modalId: "editProfileRating_add",
        screenId: "ratingFormScreen",
      },
      {
        btnId: "edit_2BtnAchievement",
        modalId: "editProfileAchievement_edit",
        screenId: "achievementList",
      },
      {
        btnId: "edit_addAchievement",
        modalId: "editProfileAchievement_add",
        screenId: "achievementFormScreen",
      },
      {
        btnId: "moreExBtn_Achievement",
        modalId: "editProfileAchievement_add",
        screenId: "achievementFormScreen",
      },
      {
        btnId: "edit_2BtnService",
        modalId: "editProfileService_edit",
        screenId: "servicesList",
      },
      {
        btnId: "edit_addService",
        modalId: "editProfileService_add",
        screenId: "serviceFormScreen",
      },
      {
        btnId: "moreExBtn_Service",
        modalId: "editProfileService_add",
        screenId: "serviceFormScreen",
      },
      {
        btnId: "edit_bigimage",
        action: () => document.getElementById("uploadImageBackground").click(),
      },
    ];

    openModalConfigs.forEach((config) => {
      const button = document.getElementById(config.btnId);
      if (button) {
        button.addEventListener("click", (e) => {
          e.preventDefault();
          if (config.modalId) {
            const form = document.getElementById(
              config.screenId.replace("Screen", "")
            );
            if (form) delete form.dataset.id;
            popupModule.showPopup(config.modalId, config.screenId);
          } else if (config.action) {
            config.action();
          }
        });
      }
    });

    const closeModalConfigs = [
      { btnId: "closeBtn1", modalId: "editProfileInfo" },
      { btnId: "closeBtn3", modalId: "editProfileEx_edit" },
      { btnId: "closeBtn4", modalId: "editProfileEx_edit2" },
      { btnId: "closeBtn5", modalId: "editProfileSp_add" },
      { btnId: "closeBtn6", modalId: "editProfileEdu_add" },
      { btnId: "closeBtn7", modalId: "editProfileEdu_edit" },
      { btnId: "closeBtn9", modalId: "editProfileSp_edit" },
      { btnId: "closeBtn10", modalId: "editProfileRating_add" },
      { btnId: "closeBtn11", modalId: "editProfileRating_edit" },
      { btnId: "closeBtn12", modalId: "editProfileAchievement_add" },
      { btnId: "closeBtn13", modalId: "editProfileAchievement_edit" },
      { btnId: "closeBtn14", modalId: "editProfileService_add" },
      { btnId: "closeBtn15", modalId: "editProfileService_edit" },
    ];

    closeModalConfigs.forEach((config) => {
      const button = document.getElementById(config.btnId);
      if (button)
        button.addEventListener("click", () =>
          popupModule.hidePopup(config.modalId)
        );
    });

    const editDeleteConfigs = [
      {
        listId: "experienceList",
        editClass: "edit-exp",
        deleteClass: "delete-exp",
        section: "experiences",
        containerId: "#experiencesContainer",
        listId: "experienceList",
        renderFn: sectionModule.renderExperience,
        popupId: "editProfileEx_edit2",
        screenId: "experienceFormScreen",
        endpoint: "experiences",
        formFields: [
          "title",
          "companyName",
          "expStartDate",
          "expEndDate",
          "expDescription",
          "currentlyWorking",
        ],
      },
      {
        listId: "certificateList",
        editClass: "edit-cert",
        deleteClass: "delete-cert",
        section: "certifications",
        containerId: "#certificatesContainer",
        listId: "certificateList",
        renderFn: sectionModule.renderCertificate,
        popupId: "editProfileSp_add",
        screenId: "certificateFormScreen",
        endpoint: "certifications",
        formFields: [
          "certificateName",
          "issuingAuthority",
          "certStartDate",
          "certEndDate",
          "certificateLink",
          "certificateNumber",
        ],
      },
      {
        listId: "educationList",
        editClass: "edit-edu",
        deleteClass: "delete-edu",
        section: "education",
        containerId: "#educationContainer",
        listId: "educationList",
        renderFn: sectionModule.renderEducation,
        popupId: "editProfileEdu_add",
        screenId: "educationFormScreen",
        endpoint: "education",
        formFields: [
          "degree",
          "institution",
          "field",
          "eduStartDate",
          "eduEndDate",
        ],
      },
      {
        listId: "ratingList",
        editClass: "edit-btn",
        deleteClass: "delete-btn",
        section: "ratings",
        containerId: "#ratingContent",
        listId: "ratingList",
        renderFn: sectionModule.renderRating,
        popupId: "editProfileRating_add",
        screenId: "ratingFormScreen",
        endpoint: "ratings",
        formFields: ["reviewerName", "comment", "ratingScore"],
      },
      {
        listId: "achievementList",
        editClass: "edit-btn",
        deleteClass: "delete-btn",
        section: "achievements",
        containerId: "#achievementsContent",
        listId: "achievementList",
        renderFn: sectionModule.renderAchievement,
        popupId: "editProfileAchievement_add",
        screenId: "achievementFormScreen",
        endpoint: "achievements",
        formFields: [
          "achievementTitle",
          "achievementDescription",
          "achievedAt",
        ],
      },
      {
        listId: "servicesList",
        editClass: "edit-btn",
        deleteClass: "delete-btn",
        section: "services",
        containerId: "#servicesContent",
        listId: "servicesList",
        renderFn: sectionModule.renderService,
        popupId: "editProfileService_add",
        screenId: "serviceFormScreen",
        endpoint: "services",
        formFields: ["serviceTitle", "serviceDescription"],
      },
    ];

    editDeleteConfigs.forEach((config) => {
      const list = document.querySelector(`#${config.listId}`);
      if (list) {
        list.addEventListener("click", async (e) => {
          if (e.target.classList.contains(config.editClass)) {
            const id = e.target.dataset.id;
            try {
              const token = localStorage.getItem("authToken");
              const decodedToken = common.decodeJWT(token);
              const userId = decodedToken?.sub || decodedToken?.id;
              const data =
                config.section === "certifications"
                  ? await getCertification(userId, id, token)
                  : config.section === "experiences"
                  ? await getExperience(userId, id, token)
                  : config.section === "education"
                  ? await getEducationItem(userId, id, token)
                  : config.section === "ratings"
                  ? await getRating(userId, id, token)
                  : config.section === "achievements"
                  ? await getAchievement(userId, id, token)
                  : await getService(userId, id, token);

              const formData = {};
              config.formFields.forEach((field) => {
                if (config.section === "certifications") {
                  const apiFieldMap = {
                    certificateName: "name",
                    issuingAuthority: "donor",
                    certStartDate: "date",
                    certEndDate: "expireAt",
                    certificateLink: "link",
                    certificateNumber: "number",
                  };
                  formData[field] = data[apiFieldMap[field]] || "";
                } else if (config.section === "experiences") {
                  const apiFieldMap = {
                    title: "title",
                    companyName: "company",
                    expStartDate: "from",
                    expEndDate: "to",
                    expDescription: "summary",
                  };
                  formData[field] = data[apiFieldMap[field]] || "";
                  if (field === "currentlyWorking") {
                    formData[field] = !data.endDate;
                  }
                } else if (config.section === "education") {
                  const apiFieldMap = {
                    degree: "degree",
                    institution: "institution",
                    field: "field",
                    eduStartDate: "startDate",
                    eduEndDate: "endDate",
                  };
                  formData[field] = data[apiFieldMap[field]] || "";
                } else if (config.section === "ratings") {
                  const apiFieldMap = {
                    reviewerName: "reviewerName",
                    comment: "comment",
                    ratingScore: "rating",
                  };
                  formData[field] = data[apiFieldMap[field]] || "";
                } else if (config.section === "achievements") {
                  const apiFieldMap = {
                    achievementTitle: "title",
                    achievementDescription: "description",
                    achievedAt: "date",
                  };
                  formData[field] = data[apiFieldMap[field]] || "";
                } else if (config.section === "services") {
                  const apiFieldMap = {
                    serviceTitle: "title",
                    serviceDescription: "description",
                  };
                  formData[field] = data[apiFieldMap[field]] || "";
                }
              });

              const form = document.getElementById(
                config.listId.replace("List", "Form")
              );
              if (form) form.dataset.id = id;
              popupModule.showPopup(config.popupId, config.screenId, formData);
            } catch (error) {
              console.error(`Fetch ${config.section} error:`, error.message);
            }
          } else if (e.target.classList.contains(config.deleteClass)) {
            if (confirm(`هل أنت متأكد من حذف هذا ${config.section}؟`)) {
              await sectionModule.deleteItem(
                config.section,
                e.target.dataset.id,
                config.containerId,
                config.listId,
                config.renderFn
              );
            }
          } else if (
            e.target.classList.contains("like-btn") &&
            config.section === "ratings"
          ) {
            await sectionModule.likeRating(e.target.dataset.id);
          }
        });
      }
    });

    document.querySelectorAll(".Tab").forEach((tab) => {
      tab.addEventListener("click", async () => {
        const tabName = tab.id.replace("Tab", "");
        tabModule.switchTab(tabName);
      });
    });
  },
};

// Initialize Application
async function initialize() {
  try {
    await Promise.all([
      authModule.initialize(),
      profileModule.loadUserProfile(),
      tabModule.initializeProfileTabs(),
      formHandler.initializeProfileForms(),
      imageUpload.initialize(),
      eventListeners.initialize(),
      sectionModule.loadSectionData(
        "experiences",
        "#experiencesContainer",
        sectionModule.renderExperience,
        "experienceList"
      ),
      sectionModule.loadSectionData(
        "certifications",
        "#certificatesContainer",
        sectionModule.renderCertificate,
        "certificateList"
      ),
      sectionModule.loadSectionData(
        "education",
        "#educationContainer",
        sectionModule.renderEducation,
        "educationList"
      ),
      sectionModule.loadSectionData(
        "ratings",
        "#ratingContent",
        sectionModule.renderRating,
        "ratingList"
      ),
      sectionModule.loadSectionData(
        "achievements",
        "#achievementsContent",
        sectionModule.renderAchievement,
        "achievementList"
      ),
      sectionModule.loadSectionData(
        "services",
        "#servicesContent",
        sectionModule.renderService,
        "servicesList"
      ),
    ]);
    await tabModule.switchTab("overview");
  } catch (error) {
    console.error("Initialization error:", error.message);
  }
}

document.addEventListener("DOMContentLoaded", initialize);
// important
