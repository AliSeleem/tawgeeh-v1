const API_BASE_URL = "https://tawgeeh-v1-production.up.railway.app";

function sanitizeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str || "";
  return div.innerHTML;
}

function formatDate(dateString) {
  if (!dateString) return "الحالي";
  const date = new Date(dateString);
  return date.toLocaleDateString("ar-EG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function renderItem(container, item, isList) {
  const div = document.createElement("div");
  div.className = "second_con";
  div.innerHTML = `
    <div class="veiw_con">
      <img src="${sanitizeHTML(
        item.image_url || "../mentor-images/default-achievement.jpg"
      )}" width="100px" alt="صورة الإنجاز">
      <div class="text">
        <h4>${sanitizeHTML(item.title || "غير محدد")}</h4>
        <p>${sanitizeHTML(item.description || "لا يوجد وصف")}</p>
        <p>${formatDate(item.date)}</p>
      </div>
    </div>
    <div class="education">
      <div class="edu_con">
        ${
          item.link
            ? `<a href="${sanitizeHTML(
                item.link
              )}" target="_blank">عرض التفاصيل</a>`
            : "<p>عرض التفاصيل</p>"
        }
        <img src="../mentor-images/export.svg" alt="عرض">
      </div>
      ${
        isList
          ? `
        <img src="../mentor-images/edit-2.svg" alt="تعديل" class="edit-btn" data-id="${item.id}">
        <img src="../mentor-images/trash.svg" alt="حذف" class="delete-btn" data-id="${item.id}">
      `
          : ""
      }
    </div>
  `;
  container.appendChild(div);
}

export async function loadSectionData(cache, containerId, renderFn, listId) {
  const container = document.querySelector(containerId);
  const listContainer = document.querySelector(listId);
  if (!container || !listContainer) return;

  try {
    const token = localStorage.getItem("authToken");
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get("id");
    if (!userId) throw new Error("User ID not found in URL");

    if (cache.achievements !== null) {
      const items = cache.achievements;
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

    const response = await fetch(`${API_BASE_URL}/achievements/${userId}`, {
      method: "GET",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
    });
    await window.auth.handleApiError(response);
    const data = await response.json();
    const items = data.achievements || [];

    cache.achievements = items;
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
    console.error("Failed to load achievements:", error.message);
    container.innerHTML = `<p class="no-data">لا توجد نتائج لعرضها</p>`;
    listContainer.innerHTML = `<p class="no-data">لا توجد نتائج لعرضها</p>`;
  }
}

function validateForm(form) {
  let isValid = true;
  form.querySelectorAll(".error").forEach((span) => (span.textContent = ""));

  const title = form.querySelector("#achievementTitle")?.value.trim();
  const description = form
    .querySelector("#achievementDescription")
    ?.value.trim();
  const date = form.querySelector("#achievementDate")?.value;

  if (!title) {
    form.querySelector("#achievementTitleError").textContent =
      "يرجى إدخال عنوان الإنجاز";
    isValid = false;
  }
  if (!description) {
    form.querySelector("#achievementDescriptionError").textContent =
      "يرجى إدخال الوصف";
    isValid = false;
  }
  if (!date) {
    form.querySelector("#achievementDateError").textContent =
      "يرجى إدخال تاريخ الإنجاز";
    isValid = false;
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

export function initializePopup(showPopup, hidePopup, cache) {
  const popup = document.getElementById("editProfileAchievement_add");
  const editListPopup = document.getElementById("editProfileAchievement_edit");
  const closeBtn = document.getElementById("closeBtn12");
  const closeListBtn = document.getElementById("closeBtn13");
  const overlay = popup?.parentElement;
  const listOverlay = editListPopup?.parentElement;

  if (closeBtn)
    closeBtn.addEventListener("click", () =>
      hidePopup("editProfileAchievement_add")
    );
  if (overlay) {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) hidePopup("editProfileAchievement_add");
    });
  }
  if (closeListBtn)
    closeListBtn.addEventListener("click", () =>
      hidePopup("editProfileAchievement_edit")
    );
  if (listOverlay) {
    listOverlay.addEventListener("click", (e) => {
      if (e.target === listOverlay) hidePopup("editProfileAchievement_edit");
    });
  }

  const form = document.getElementById("achievementForm");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!validateForm(form)) return;

      const data = {
        title: form.querySelector("#achievementTitle").value.trim(),
        description: form.querySelector("#achievementDescription").value.trim(),
        date: form.querySelector("#achievementDate").value,
        link: form.querySelector("#achievementLink").value.trim() || null,
        image_url:
          "https://i.pinimg.com/736x/18/c6/e0/18c6e05ccc51b8e8e8385d0b38105d83.jpg",
      };

      try {
        const token = localStorage.getItem("authToken");
        const method = form.dataset.id ? "PATCH" : "POST";
        const url = form.dataset.id
          ? `${API_BASE_URL}/achievements/${form.dataset.id}`
          : `${API_BASE_URL}/achievements`;

        const response = await fetch(url, {
          method,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        await window.auth.handleApiError(response);

        common.showAlert("تم", "تم حفظ الإنجاز بنجاح", "success");
        cache.achievements = null;
        hidePopup("editProfileAchievement_add");
        await loadSectionData(
          cache,
          "#achievementsContent",
          renderItem,
          "#achievementList"
        );
      } catch (error) {
        console.error("Achievement form submission error:", error.message);
        common.showAlert("خطأ", "فشل حفظ الإنجاز", "error");
      }
    });
  }
}

export function initializeEventListeners(cache, showPopup) {
  document
    .querySelector("#achievementList")
    ?.addEventListener("click", async (e) => {
      if (e.target.classList.contains("edit-btn")) {
        const id = e.target.dataset.id;
        try {
          const token = localStorage.getItem("authToken");
          const response = await fetch(`${API_BASE_URL}/achievements/${id}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          await window.auth.handleApiError(response);
          const data = await response.json();

          const form = document.getElementById("achievementForm");
          if (form) form.dataset.id = id;
          showPopup("editProfileAchievement_add", "achievementFormScreen", {
            achievementTitle: data.title,
            achievementDescription: data.description,
            achievementDate: data.date,
            achievementLink: data.link || "",
          });
        } catch (error) {
          console.error("Fetch achievement error:", error.message);
          common.showAlert("خطأ", "فشل جلب الإنجاز", "error");
        }
      } else if (e.target.classList.contains("delete-btn")) {
        if (confirm("هل أنت متأكد من حذف هذا الإنجاز؟")) {
          try {
            const token = localStorage.getItem("authToken");
            const response = await fetch(
              `${API_BASE_URL}/achievements/${e.target.dataset.id}`,
              {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            );
            await window.auth.handleApiError(response);

            common.showAlert("تم", "تم الحذف بنجاح", "success");
            cache.achievements = null;
            await loadSectionData(
              cache,
              "#achievementsContent",
              renderItem,
              "#achievementList"
            );
          } catch (error) {
            console.error("Delete achievement error:", error.message);
            common.showAlert("خطأ", "فشل حذف الإنجاز", "error");
          }
        }
      }
    });
}