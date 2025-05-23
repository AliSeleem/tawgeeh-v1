document.addEventListener("DOMContentLoaded", function () {
  const API_BASE_URL = "https://tawgeeh-v1-production.up.railway.app";

  const notificationsData = [
    {
      title: "تنبيه!",
      text: "يمكنك إضافة جلسة جديدة مع الموجه عمر أحمد فتحي.",
      avatar: "./mentor-images/omar.jpg",
      actions: [
        { label: "الإجراء الأول", primary: true },
        { label: "الإجراء الثاني", primary: false },
      ],
      variant: "icon-variant",
    },
    {
      title: "تنبيه!",
      text: "سارة علي حسن قامت بتحديث ملفها الشخصي.",
      avatar:
        "https://codia-f2c.s3.us-west-1.amazonaws.com/image/2025-04-20/5BupekvnRw.png",
      actions: [{ label: "الإجراء", primary: true }],
      compact: true,
      variant: "icon-variant",
    },
    {
      title: "تنبيه!",
      text: "موعد جلسة مع خالد عبدالله محمد يقترب.",
      avatar: "../mentor-images/khaled.jpg",
    },
    {
      title: "تنبيه!",
      text: "يمكنك إضافة جلسة جديدة مع منى إبراهيم سالم.",
      avatar: "https://via.placeholder.com/36",
      actions: [
        { label: "الإجراء الأول", primary: true },
        { label: "الإجراء الثاني", primary: false },
      ],
    },
    {
      title: "تنبيه!",
      avatar: "https://via.placeholder.com/36",
      actions: [{ label: "الإجراء", primary: true }],
      compact: true,
      variant: "icon-variant",
    },
  ];

  let currentMentors = [];
  let currentNotifications = [...notificationsData];
  currentNotifications = window.auth.fetchNotifications();

  let selectedCategory = "الكل";
  let searchQuery = "";
  let isAscending = true;

  initializePage();

  async function fetchMentors() {
    try {
      const accessToken = localStorage.getItem("authToken");
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };
      if (accessToken) {
        headers.Authorization = `Bearer ${accessToken}`;
      }

      const response = await fetch(`${API_BASE_URL}/users`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      if (!responseData.success || !Array.isArray(responseData.data)) {
        throw new Error("Invalid API response");
      }

      // Log fetched users
      console.log("Fetched users:", responseData.data);

      // Filter users with role "MENTOR" and map to mentorData structure
      return responseData.data
        .filter((user) => user.role === "MENTOR")
        .map((user) => ({
          id: user.id, // Include user ID
          name: user.name || "غير محدد",
          title: user.specialization || "موجه",
          experience: mapExperienceLevel(user.experienceLevel),
          category: mapCategory(user.specialization),
          description: user.bio || "لا توجد نبذة متاحة",
          avatar: user.image_url || "https://via.placeholder.com/150",
          social: ["social-icon-1", "social-icon-2", "social-icon-3"],
        }));
    } catch (error) {
      console.error("Fetch mentors failed:", error.message);
      common.showAlert(
        "خطأ",
        "فشل تحميل بيانات الموجهين. حاول مرة أخرى.",
        "error"
      );
      return [];
    }
  }

  function mapExperienceLevel(level) {
    switch (level) {
      case "JUNIOR":
        return "+1 سنة خبرة";
      case "INTERMEDIATE":
        return "+3 سنوات خبرة";
      case "SENIOR":
        return "+5 سنوات خبرة";
      case "EXPERT":
        return "+7 سنوات خبرة";
      default:
        return "غير محدد";
    }
  }

  function mapCategory(specialization) {
    const categoryMap = {
      "Software Engineering": "البرمجة",
      BackEnd: "البرمجة",
      CS: "البرمجة",
      "Data Science": "علوم البيانات",
      "Cyber Security": "الأمن السيبراني",
      "AI & Machine Learning": "علوم البيانات",
    };
    return categoryMap[specialization] || "غير محدد";
  }

  async function initializePage() {
    const authSection = document.querySelector(".auth-section");
    common.initializeAuth(
      authSection,
      currentNotifications,
      common.showLoginPopup,
      common.showSignupPopup,
      common.toggleNotifications,
      () => common.updateNotificationCount(currentNotifications)
    );
    common.initializeLoginPopup(common.showSignupPopup);
    common.initializeMentorApplicationPopup();
    initializeSearchBar();
    initializeFilterCategories();
    common.renderNotifications(currentNotifications, () =>
      common.updateNotificationCount(currentNotifications)
    );

    // Fetch mentors and render them
    currentMentors = await fetchMentors();
    renderMentors();
    common.initializeSignupPopup();
  }

  function initializeSearchBar() {
    const searchBar = document.querySelector(".search-bar");
    const searchPlaceholder = document.querySelector(".search-placeholder");

    const searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.className = "search-input";
    searchInput.style.cssText = `
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      right: 0;
      padding: 0 40px 0 0;
      background: transparent;
      color: #333333;
      font-size: 20px;
      font-weight: 400;
      line-height: 34px;
      text-align: right;
      opacity: 0;
    `;

    searchPlaceholder.parentNode.insertBefore(searchInput, searchPlaceholder);

    searchInput.addEventListener("focus", function () {
      searchPlaceholder.style.opacity = "0";
      this.style.opacity = "1";
    });

    searchInput.addEventListener("blur", function () {
      if (!this.value) {
        searchPlaceholder.style.opacity = "1";
        this.style.opacity = "0";
      }
    });

    searchInput.addEventListener("input", function () {
      searchQuery = this.value.trim().toLowerCase();
      searchPlaceholder.style.opacity = this.value ? "0" : "1";
      updateMentors();
    });

    searchPlaceholder.addEventListener("click", () => searchInput.focus());
    const searchIcon = document.querySelector(".search-icon");
    searchIcon.addEventListener("click", () => searchInput.focus());
  }

  function initializeFilterCategories() {
    const filterCategories = document.querySelectorAll(".filter-category");
    const filterContainer = document.querySelector(".filter-container");
    let isFilterVisible = true;

    filterCategories.forEach((category) => {
      category.addEventListener("click", function () {
        filterCategories.forEach((cat) => cat.classList.remove("active"));
        this.classList.add("active");
        selectedCategory = this.textContent.trim();
        updateMentors();
      });
    });

    const filterToggle = document.querySelector(".filter-toggle");
    filterToggle.addEventListener("click", () => {
      isFilterVisible = !isFilterVisible;
      filterContainer.style.display = isFilterVisible ? "flex" : "none";
    });

    const sortToggle = document.querySelector(".sort-toggle");
    sortToggle.addEventListener("click", () => {
      isAscending = !isAscending;
      currentMentors.sort((a, b) => {
        const comparison = a.name.localeCompare(b.name, "ar");
        return isAscending ? comparison : -comparison;
      });
      renderMentors();
    });
  }

  function showMentorPopup(mentor) {
    const popupContainer = document.querySelector(".mentor-popup-container");
    const popupOverlay = document.querySelector(".mentor-popup-overlay");
    if (!popupContainer || !popupOverlay) {
      console.warn("Popup elements not found");
      return;
    }

    popupContainer.querySelector(".profile-name").textContent = mentor.name;
    popupContainer.querySelector(".profile-title").textContent = mentor.title;
    popupContainer.querySelector(".profile-bio").textContent =
      mentor.description;
    popupContainer.querySelector(".profile-image").src = mentor.avatar;

    popupContainer.classList.add("show");
    popupContainer.style.display = "flex";
    popupOverlay.classList.add("show");
    popupOverlay.style.display = "block";

    const closeBtn = popupContainer.querySelector(".mentor-popup-close");
    closeBtn.addEventListener("click", () => {
      popupContainer.classList.remove("show");
      popupContainer.style.display = "none";
      popupOverlay.classList.remove("show");
      popupOverlay.style.display = "none";
    });

    const bookBtn = popupContainer.querySelector(".button-filled");
    const profileBtn = popupContainer.querySelector(".button-outline");
    bookBtn.addEventListener("click", () => {
      console.log(`Booking session with ${mentor.name}`);
    });
    profileBtn.addEventListener("click", () => {
      if (mentor.id) {
        window.location.href = `../pages/mentor-veiw.html?id=${mentor.id}`;
      } else {
        console.warn(`Mentor ID not found for ${mentor.name}`);
        common.showAlert(
          "خطأ",
          "تعذر تحميل الملف الشخصي. حاول مرة أخرى.",
          "error"
        );
      }
    });
  }

  function renderMentors() {
    const mentorsContainer = document.querySelector(".mentors-container");
    if (!mentorsContainer) {
      console.warn("Mentors container not found");
      return;
    }
    mentorsContainer.innerHTML = "";

    const mentorsToShow = currentMentors.length ? currentMentors : [];

    if (mentorsToShow.length === 0) {
      mentorsContainer.innerHTML = `<p style="text-align: center; color: #333;">لا يوجد موجهين متاحين حاليًا.</p>`;
      return;
    }

    for (let i = 0; i < mentorsToShow.length; i += 4) {
      const row = document.createElement("div");
      row.className = "mentors-row";

      for (let j = i; j < i + 4 && j < mentorsToShow.length; j++) {
        const mentor = mentorsToShow[j];
        const card = document.createElement("article");
        card.className = "mentor-card";
        card.innerHTML = `
          <div class="mentor-header" style="background-image: url(${
            mentor.avatar
          })"></div>
          <div class="mentor-content">
            <div class="mentor-name">${mentor.name}</div>
            <div class="mentor-title">${mentor.title}</div>
            <div class="mentor-experience">${mentor.experience}</div>
            <div class="mentor-social">
              ${mentor.social
                .map(
                  (icon) =>
                    `<div class="social-icon"><div class="social-icon-img ${icon}"></div></div>`
                )
                .join("")}
            </div>
          </div>
          <div class="mentor-actions">
            <button class="action-btn book-btn">احجز الآن</button>
            <button class="action-btn details-btn">تفاصيل</button>
          </div>
        `;

        initializeMentorCard(card, mentor);
        row.appendChild(card);
      }

      mentorsContainer.appendChild(row);
    }
  }

  function initializeMentorCard(card, mentor) {
    const bookBtn = card.querySelector(".book-btn");
    bookBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      console.log(`Booking session with ${mentor.name}`);
    });

    const detailsBtn = card.querySelector(".details-btn");
    detailsBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      showMentorPopup(mentor);
    });

    card.addEventListener("click", (e) => {
      if (e.target.closest(".action-btn") || e.target.closest(".social-icon"))
        return;
      showMentorPopup(mentor);
    });

    const socialIcons = card.querySelectorAll(".social-icon");
    socialIcons.forEach((icon) => {
      icon.addEventListener("click", (e) => {
        e.stopPropagation();
        console.log("Social icon clicked");
      });
    });
  }

  function updateMentors() {
    currentMentors = currentMentors.filter((mentor) => {
      const matchesCategory =
        selectedCategory === "الكل" || mentor.category === selectedCategory;
      const matchesSearch =
        !searchQuery ||
        mentor.name.toLowerCase().includes(searchQuery) ||
        mentor.title.toLowerCase().includes(searchQuery) ||
        mentor.category.toLowerCase().includes(searchQuery) ||
        mentor.description.toLowerCase().includes(searchQuery);
      return matchesCategory && matchesSearch;
    });

    renderMentors();
  }
});
