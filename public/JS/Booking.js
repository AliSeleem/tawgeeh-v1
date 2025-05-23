document.addEventListener("DOMContentLoaded", function () {
  const notificationsData = [
    {
      title: "تنبيه!",
      text: "تم حجز جلسة جديدة مع معتصم شعبان.",
      avatar: "/api/placeholder/36/36",
      actions: [{ label: "عرض التفاصيل", primary: true }],
      variant: "icon-variant",
    },
  ];

  let currentNotifications = [...notificationsData];
  let currentDate = new Date(2025, 3, 28); // April 28, 2025
  let selectedDate = new Date(currentDate);
  let selectedTimeSlot = null;

  // Retrieve mentor data from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const mentorData = urlParams.get("mentor");
  const coach = mentorData
    ? JSON.parse(decodeURIComponent(mentorData))
    : {
        name: "معتصم شعبان",
        title: "Product Designer, Campus",
        avatar: "/api/placeholder/70/70",
        mentorId: "mentor5",
      };

  initializePage();

  function initializePage() {
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
    common.initializeSignupPopup();
    common.initializeMentorApplicationPopup();
    common.renderNotifications(currentNotifications, () =>
      common.updateNotificationCount(currentNotifications)
    );
    initializeCalendars();
    initializeBookingConfirmation();

    // Update coach profile
    const coachImage = document.querySelector(".coach-image img");
    const coachName = document.querySelector(".coach-info h2");
    const coachTitle = document.querySelector(".coach-info p");
    if (coachImage && coachName && coachTitle) {
      coachImage.src = coach.avatar;
      coachName.textContent = coach.name;
      coachTitle.textContent = coach.title;
    }
  }

  function initializeCalendars() {
    populateDayCalendar(selectedDate);
    populateMonthCalendar(selectedDate);

    // Navigation for month calendar
    document.getElementById("prev-month").addEventListener("click", () => {
      selectedDate.setMonth(selectedDate.getMonth() - 1);
      populateMonthCalendar(selectedDate);
      populateDayCalendar(selectedDate);
    });

    document.getElementById("next-month").addEventListener("click", () => {
      selectedDate.setMonth(selectedDate.getMonth() + 1);
      populateMonthCalendar(selectedDate);
      populateDayCalendar(selectedDate);
    });

    // Navigation for day calendar
    document
      .querySelector(".calendar-arrows .arrow:first-child")
      .addEventListener("click", () => {
        selectedDate.setDate(selectedDate.getDate() - 7);
        populateDayCalendar(selectedDate);
      });

    document
      .querySelector(".calendar-arrows .arrow:last-child")
      .addEventListener("click", () => {
        selectedDate.setDate(selectedDate.getDate() + 7);
        populateDayCalendar(selectedDate);
      });
  }

  function populateDayCalendar(date) {
    const calendarColumns = document.getElementById("calendar-columns");
    if (!calendarColumns) return;
    calendarColumns.innerHTML = "";

    const daysOfWeek = [
      "السبت",
      "الأحد",
      "الإثنين",
      "الثلاثاء",
      "الأربعاء",
      "الخميس",
      "الجمعة",
    ];
    const startDate = new Date(date);
    startDate.setDate(date.getDate() - 3); // Start 3 days before the selected date

    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(startDate);
      dayDate.setDate(startDate.getDate() + i);
      const dayName = daysOfWeek[dayDate.getDay()];
      const dayNumber = dayDate.getDate();

      const column = document.createElement("div");
      column.classList.add("weekday-column");

      const header = document.createElement("div");
      header.classList.add("day-header");
      header.innerHTML = `<span>${dayName}</span><span>${dayNumber}</span>`;
      column.appendChild(header);

      const timeSlots = document.createElement("div");
      timeSlots.classList.add("time-slots");

      // Get available time slots
      const slots = getAvailableTimeSlots(dayDate);
      slots.forEach((slot) => {
        const timeSlot = document.createElement("div");
        timeSlot.classList.add("time-slot");
        timeSlot.classList.add(slot === "—" ? "unavailable" : "available");
        timeSlot.textContent = slot === "—" ? "—" : formatTime(slot);
        timeSlots.appendChild(timeSlot);
      });

      column.appendChild(timeSlots);
      calendarColumns.appendChild(column);
    }

    // Add event listeners to available time slots
    const timeSlotsElements = document.querySelectorAll(".time-slot.available");
    timeSlotsElements.forEach((slot) => {
      slot.addEventListener("click", function () {
        // Validation checks
        if (!localStorage.getItem("authToken")) {
          Swal.fire({
            icon: "error",
            title: "خطأ",
            text: "يرجى تسجيل الدخول لحجز الجلسة.",
            confirmButtonText: "حسناً",
          }).then(() => {
            common.showLoginPopup();
          });
          return;
        }

        // Highlight selected time slot
        timeSlotsElements.forEach((s) => s.classList.remove("selected"));
        this.classList.add("selected");
        selectedTimeSlot = this.textContent;

        // Validate selected date is not in the past
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selectedDateOnly = new Date(selectedDate);
        selectedDateOnly.setHours(0, 0, 0, 0);
        if (selectedDateOnly < today) {
          Swal.fire({
            icon: "error",
            title: "خطأ",
            text: "لا يمكن حجز الجلسة في الماضي. يرجى اختيار تاريخ مستقبلي.",
            confirmButtonText: "حسناً",
          });
          return;
        }

        // Check for duplicate bookings
        const sessionExists = common.sessionsData.some(
          (session) =>
            session.mentorId === coach.mentorId &&
            session.date === selectedDate.toISOString().split("T")[0] &&
            session.time.split("-")[0] === selectedTimeSlot
        );
        if (sessionExists) {
          Swal.fire({
            icon: "error",
            title: "خطأ",
            text: "هذا الموعد محجوز بالفعل. يرجى اختيار موعد آخر.",
            confirmButtonText: "حسناً",
          });
          return;
        }

        // Create new session
        const newSession = {
          id: common.sessionsData.length + 1,
          mentorName: coach.name,
          mentorId: coach.mentorId,
          title: "Career Coaching",
          date: selectedDate.toISOString().split("T")[0],
          time: `${selectedTimeSlot}-${add30Minutes(selectedTimeSlot)}`,
          status: "pending",
          meetingLink: null,
        };

        // Simulate API call to save session
        setTimeout(() => {
          try {
            common.sessionsData.push(newSession);
            currentNotifications.push({
              title: "تنبيه!",
              text: `تم حجز جلسة جديدة مع ${coach.name} بتاريخ ${newSession.date} الساعة ${selectedTimeSlot}.`,
              avatar: coach.avatar,
              actions: [{ label: "عرض التفاصيل", primary: true }],
              variant: "icon-variant",
            });
            common.renderNotifications(currentNotifications, () =>
              common.updateNotificationCount(currentNotifications)
            );
            Swal.fire({
              icon: "success",
              title: "تم الحجز",
              text: `تم حجز الجلسة بنجاح مع ${coach.name} بتاريخ ${newSession.date} الساعة ${selectedTimeSlot}.`,
              confirmButtonText: "حسناً",
            }).then(() => {
              window.location.href = "./Sessions.html";
            });
          } catch (error) {
            Swal.fire({
              icon: "error",
              title: "خطأ",
              text: "حدث خطأ أثناء حجز الجلسة. يرجى المحاولة مرة أخرى.",
              confirmButtonText: "حسناً",
            });
          }
        }, 1000);
      });
    });
  }

  function getAvailableTimeSlots(dayDate) {
    // Simulate API call for available time slots
    const today = new Date(currentDate);
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(dayDate);
    targetDate.setHours(0, 0, 0, 0);

    const diffDays = (targetDate - today) / (1000 * 60 * 60 * 24);
    if (diffDays >= 0 && diffDays <= 2) {
      return ["18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00"];
    }
    return ["—", "—", "—", "—", "—", "—", "—"];
  }

  function populateMonthCalendar(date) {
    const monthGrid = document.getElementById("month-grid");
    const monthYear = document.getElementById("month-year");
    if (!monthGrid || !monthYear) return;
    monthGrid.innerHTML = "";

    const monthNames = [
      "يناير",
      "فبراير",
      "مارس",
      "أبريل",
      "مايو",
      "يونيو",
      "يوليو",
      "أغسطس",
      "سبتمبر",
      "أكتوبر",
      "نوفمبر",
      "ديسمبر",
    ];
    const daysOfWeek = [
      "السبت",
      "الأحد",
      "الإثنين",
      "الثلاثاء",
      "الأربعاء",
      "الخميس",
      "الجمعة",
    ];

    const year = date.getFullYear();
    const month = date.getMonth();
    monthYear.textContent = `${monthNames[month]} ${year}`;

    // Add day headers
    daysOfWeek.forEach((day) => {
      const dayCell = document.createElement("div");
      dayCell.classList.add("day-cell", "header");
      dayCell.textContent = day;
      monthGrid.appendChild(dayCell);
    });

    // Get the first day of the month
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    // Add previous month's days
    for (let i = firstDay - 1; i >= 0; i--) {
      const dayCell = document.createElement("div");
      dayCell.classList.add("day-cell", "other-month");
      dayCell.textContent = prevMonthDays - i;
      monthGrid.appendChild(dayCell);
    }

    // Add current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      const dayCell = document.createElement("div");
      dayCell.classList.add("day-cell");
      if (
        i === currentDate.getDate() &&
        month === currentDate.getMonth() &&
        year === currentDate.getFullYear()
      ) {
        dayCell.classList.add("today");
      }
      if (
        i === selectedDate.getDate() &&
        month === selectedDate.getMonth() &&
        year === selectedDate.getFullYear()
      ) {
        dayCell.classList.add("selected");
      }
      dayCell.textContent = i;
      monthGrid.appendChild(dayCell);
    }

    // Add next month's days
    const lastDay = new Date(year, month, daysInMonth).getDay();
    for (let i = 1; i <= 6 - lastDay; i++) {
      const dayCell = document.createElement("div");
      dayCell.classList.add("day-cell", "other-month");
      dayCell.textContent = i;
      monthGrid.appendChild(dayCell);
    }

    // Add event listeners to selectable days
    const dayCells = document.querySelectorAll(
      ".day-cell:not(.header):not(.other-month)"
    );
    dayCells.forEach((cell) => {
      cell.addEventListener("click", function () {
        dayCells.forEach((c) => c.classList.remove("selected"));
        this.classList.add("selected");
        selectedDate = new Date(year, month, parseInt(this.textContent));
        populateDayCalendar(selectedDate);
      });
    });
  }

  function initializeBookingConfirmation() {
    // No confirm button; booking is handled via time slot selection
  }

  function formatTime(time) {
    const [hour, minute] = time.split(":");
    const hourNum = parseInt(hour);
    const period = hourNum >= 12 ? "م" : "ص";
    const formattedHour = hourNum % 12 || 12;
    return `${formattedHour}:${minute} ${period}`;
  }

  function add30Minutes(time) {
    const [hour, minute] = time.split(":").map(Number);
    const newMinute = minute + 30;
    const newHour = hour + Math.floor(newMinute / 60);
    return `${newHour % 24}:${(newMinute % 60).toString().padStart(2, "0")}`;
  }
});
