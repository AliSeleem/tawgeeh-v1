// JS/ProfileJS/ExperienceService.js
export async function initializeExperience(dataCache, profileId, isOwnProfile) {
  function sanitizeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str || "";
    return div.innerHTML;
  }

  function formatDate(dateString) {
    if (!dateString) return "الحالي";
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-EG", { day: "numeric", month: "long", year: "numeric" });
  }

  function renderExperience(container, item, isList) {
    const div = document.createElement("div");
    div.className = "second_con";
    div.innerHTML = `
      <div class="veiw_con">
        <img src="../mentor-images/briefcase.svg" alt="أيقونة عمل">
        <div class="text">
          <h4>${sanitizeHTML(item.jobTitle || item.title || "غير محدد")}</h4>
          <p>${sanitizeHTML(item.companyName || item.company || "غير محدد")}</p>
          ${isList ? "" : `<p>${sanitizeHTML(item.description || "لا يوجد وصف")}</p>`}
        </div>
      </div>
      <div class="${isList ? "date2_con" : "date2"}">
        <p>${formatDate(item.startDate)} - ${item.endDate ? formatDate(item.endDate) : "الحالي"}</p>
        ${isList && isOwnProfile ? `
          <img src="../mentor-images/edit-2.svg" alt="تعديل" class="edit-exp" data-id="${item.id}">
          <img src="../mentor-images/trash.svg" alt="حذف" class="delete-exp" data-id="${item.id}">
        ` : ""}
      </div>
    `;
    container.appendChild(div);
  }

  async function loadSectionData(section, containerId, renderFn, listId, cache, userId, isOwnProfile) {
    const container = document.querySelector(containerId);
    const listContainer = document.querySelector(listId);
    if (!container || !listContainer) return;

    try {
      const token = localStorage.getItem("authToken");
      if (!token && isOwnProfile) throw new Error("No auth token found");

      const targetUserId = userId || (token ? common.decodeJWT(token)?.sub || common.decodeJWT(token)?.id : null);
      if (!targetUserId) throw new Error("Invalid user ID");

      if (cache[section] !== null) {
        const items = cache[section];
        container.innerHTML = "";
        listContainer.innerHTML = "";
        if (items.length === 0) {
          container.innerHTML = `<p class="no-data">لا توجد نتائج لعرضها</p>`;
          listContainer.innerHTML = `<p class="no-data">لا توجد نتائج لعرضها</p>`;
          return;
        }
        items.forEach((item) => {
          renderFn(container, item, false);
          renderFn(listContainer, item, true);
        });
        return;
      }

      const endpoint = section === "education" ? `/education/${targetUserId}` : `/${section}/${targetUserId}`;
      const response = await fetch(`https://tawgeeh-v1-production.up.railway.app${endpoint}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      await window.auth.handleApiError(response);
      const data = await response.json();
      const items = data[section] || data || [];

      cache[section] = items;
      container.innerHTML = "";
      listContainer.innerHTML = "";
      if (items.length === 0) {
        container.innerHTML = `<p class="no-data">لا توجد نتائج لعرضها</p>`;
        listContainer.innerHTML = `<p class="no-data">لا توجد نتائج لعرضها</p>`;
        return;
      }

      items.forEach((item) => {
        renderFn(container, item, false);
        renderFn(listContainer, item, true);
      });
    } catch (error) {
      console.error(`Failed to load ${section}:`, error.message);
      container.innerHTML = `<p class="no-data">لا توجد نتائج لعرضها</p>`;
      listContainer.innerHTML = `<p class="no-data">لا توجد نتائج لعرضها</p>`;
    }
  }

  function initializeExperiencePopup() {
    if (!isOwnProfile) return;

    const popup = document.getElementById("editProfileEx_edit2");
    const editListPopup = document.getElementById("editProfileEx_edit");
    const closeBtn = document.getElementById("closeBtn4");
    const closeListBtn = document.getElementById("closeBtn3");
    const overlay = popup?.parentElement;
    const listOverlay = editListPopup?.parentElement;

    if (closeBtn) closeBtn.addEventListener("click", () => hidePopup("editProfileEx_edit2"));
    if (overlay) {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) hidePopup("editProfileEx_edit2");
      });
    }
    if (closeListBtn) closeListBtn.addEventListener("click", () => hidePopup("editProfileEx_edit"));
    if (listOverlay) {
      listOverlay.addEventListener("click", (e) => {
        if (e.target === listOverlay) hidePopup("editProfileEx_edit");
      });
    }

    const form = document.getElementById("experienceForm");
    if (form) {
      const currentlyWorking = form.querySelector("#currentlyWorking");
      const endDateInput = form.querySelector("#expEndDate");
      if (currentlyWorking) {
        currentlyWorking.addEventListener("change", (e) => {
          endDateInput.disabled = e.target.checked;
          if (e.target.checked) endDateInput.value = "";
        });
      }

      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!validateForm(form, "experience")) return;

        const data = {
          jobTitle: form.querySelector("#title").value.trim(),
          companyName: form.querySelector("#companyName").value.trim(),
          startDate: form.querySelector("#expStartDate").value,
          endDate: currentlyWorking.checked ? null : form.querySelector("#expEndDate").value || null,
          description: form.querySelector("#expDescription").value.trim(),
        };

        try {
          const token = localStorage.getItem("authToken");
          const method = form.dataset.id ? "PATCH" : "POST";
          const url = form.dataset.id
            ? `https://tawgeeh-v1-production.up.railway.app/experiences/${form.dataset.id}`
            : `https://tawgeeh-v1-production.up.railway.app/experiences`;

          const response = await fetch(url, {
            method,
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          });
          await window.auth.handleApiError(response);
          common.showAlert("تم", "تم حفظ الخبرة بنجاح", "success");
          dataCache.experiences = null;
          hidePopup("editProfileEx_edit2");
          await loadSectionData("experiences", "#experiencesContainer", renderExperience, "#experienceList", dataCache, profileId, isOwnProfile);
        } catch (error) {
          console.error("Experience form submission error:", error.message);
        }
      });
    }
  }

  async function deleteItem(id) {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`https://tawgeeh-v1-production.up.railway.app/experiences/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      await window.auth.handleApiError(response);
      common.showAlert("تم", "تم الحذف بنجاح", "success");
      dataCache.experiences = null;
      await loadSectionData("experiences", "#experiencesContainer", renderExperience, "#experienceList", dataCache, profileId, isOwnProfile);
    } catch (error) {
      console.error("Delete experience error:", error.message);
    }
  }

  function validateForm(form, type) {
    let isValid = true;
    form.querySelectorAll(".error").forEach((span) => (span.textContent = ""));

    if (type === "experience") {
      const title = form.querySelector("#title")?.value.trim();
      const company = form.querySelector("#companyName")?.value.trim();
      const startDate = form.querySelector("#expStartDate")?.value;
      const description = form.querySelector("#expDescription")?.value.trim();

      if (!title) {
        form.querySelector("#titleError").textContent = "يرجى إدخال المسمى الوظيفي";
        isValid = false;
      }
      if (!company) {
        form.querySelector("#companyNameError").textContent = "يرجى إدخال اسم الشركة";
        isValid = false;
      }
      if (!startDate) {
        form.querySelector("#expStartDateError").textContent = "يرجى إدخال تاريخ البدء";
        isValid = false;
      }
      if (!description) {
        form.querySelector("#expDescriptionError").textContent = "يرجى إدخال الوصف";
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

  function showPopup(popupId, screenId, data = {}) {
    if (!isOwnProfile) return;

    const popupContainer = document.getElementById(popupId);
    const popupOverlay = popupContainer?.parentElement;
    if (!popupContainer || !popupOverlay) return;

    document.querySelectorAll(".overlay.show").forEach((modal) => {
      if (modal !== popupOverlay) hidePopup(modal.querySelector(".popup-container")?.id);
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
          if (input.type === "checkbox") {
            input.checked = !!value;
          } else {
            input.value = value || "";
          }
        }
      });
      if (data.id) form.dataset.id = data.id;
      if (data.currentlyWorking !== undefined) {
        const currentlyWorking = form.querySelector("#currentlyWorking");
        if (currentlyWorking) currentlyWorking.checked = data.currentlyWorking;
      }
      form.querySelectorAll(".error").forEach((span) => (span.textContent = ""));
      form.querySelectorAll("input, textarea, select").forEach((input) => {
        const clone = input.cloneNode(true);
        input.parentNode.replaceChild(clone, input);
      });
    }
  }

  function hidePopup(popupId) {
    const popupContainer = document.getElementById(popupId);
    const popupOverlay = popupContainer?.parentElement;
    if (!popupContainer || !popupOverlay || !popupOverlay.classList.contains("show")) return;

    popupContainer.classList.remove("show");
    popupOverlay.classList.remove("show");
    setTimeout(() => {
      popupContainer.style.display = "none";
      popupOverlay.style.display = "none";
    }, 300);

    const form = popupContainer.querySelector("form");
    if (form) {
      form.reset();
      delete form.dataset.id;
      form.querySelectorAll(".error").forEach((span) => (span.textContent = ""));
      form.querySelectorAll("input, textarea, select").forEach((input) => {
        const clone = input.cloneNode(true);
        input.parentNode.replaceChild(clone, input);
      });
    }
  }

  // Event listeners for edit/delete
  if (isOwnProfile) {
    document.querySelector("#experienceList")?.addEventListener("click", async (e) => {
      if (e.target.classList.contains("edit-exp")) {
        const id = e.target.dataset.id;
        try {
          const token = localStorage.getItem("authToken");
          const response = await fetch(`https://tawgeeh-v1-production.up.railway.app/experiences/${id}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          await window.auth.handleApiError(response);
          const data = await response.json();
          const form = document.getElementById("experienceForm");
          if (form) form.dataset.id = id;
          showPopup("editProfileEx_edit2", "experienceFormScreen", {
            title: data.jobTitle || data.title,
            companyName: data.companyName || data.company,
            expStartDate: data.startDate,
            expEndDate: data.endDate || "",
            expDescription: data.description,
            currentlyWorking: !data.endDate,
          });
        } catch (error) {
          console.error("Fetch experience error:", error.message);
        }
      } else if (e.target.classList.contains("delete-exp")) {
        if (confirm("هل أنت متأكد من حذف هذه الخبرة؟")) {
          await deleteItem(e.target.dataset.id);
        }
      }
    });
  }

  // Initialize
  await loadSectionData("experiences", "#experiencesContainer", renderExperience, "#experienceList", dataCache, profileId, isOwnProfile);
  if (isOwnProfile) initializeExperiencePopup();
}