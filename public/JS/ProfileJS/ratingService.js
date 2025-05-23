const API_BASE_URL = "https://tawgeeh-v1-production.up.railway.app";

function sanitizeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str || "";
  return div.innerHTML;
}

function generateStars(rating) {
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
}

export function renderItem(container, item, isList) {
  const div = document.createElement("div");
  div.className = "session1 sessionsFormat";
  const starsHtml = generateStars(item.rating);
  const formattedDate = new Date(
    item.createdAt || item.date
  ).toLocaleDateString("ar-EG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  div.innerHTML = `
    <div class="session_con">
      <img class="menteePhoto" src="${sanitizeHTML(
        item.menteeImage || "../mentor-images/default-user.jpg"
      )}" alt="مجهول" />
      <div class="time timeR">
        <h4>${sanitizeHTML(
          item.reviewerName || item.menteeName || "مجهول"
        )}</h4>
        <p>${sanitizeHTML(item.comment || "لا يوجد تعليق")}</p>
        <div class="stars_con">
          <p>${item.rating.toFixed(1)}</p>
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

    if (cache.ratings !== null) {
      const items = cache.ratings;
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

    const response = await fetch(`${API_BASE_URL}/ratings/${userId}`, {
      method: "GET",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "application/json",
      },
    });
    await window.auth.handleApiError(response);
    const data = await response.json();
    const items = data.ratings || [];

    cache.ratings = items;
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
    console.error("Failed to load ratings:", error.message);
    container.innerHTML = `<p class="no-data">لا توجد نتائج لعرضها</p>`;
    listContainer.innerHTML = `<p class="no-data">لا توجد نتائج لعرضها</p>`;
  }
}

function validateForm(form) {
  let isValid = true;
  form.querySelectorAll(".error").forEach((span) => (span.textContent = ""));

  const reviewerName = form.querySelector("#reviewerName")?.value.trim();
  const comment = form.querySelector("#comment")?.value.trim();
  const rating = form.querySelector("#ratingScore")?.value;

  if (!reviewerName) {
    form.querySelector("#reviewerNameError").textContent =
      "يرجى إدخال اسم المراجع";
    isValid = false;
  }
  if (!comment) {
    form.querySelector("#commentError").textContent = "يرجى إدخال التعليق";
    isValid = false;
  }
  if (!rating || rating < 1 || rating > 5) {
    form.querySelector("#ratingScoreError").textContent =
      "يرجى إدخال تقييم بين 1 و5";
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
  const popup = document.getElementById("editProfileRating_add");
  const editListPopup = document.getElementById("editProfileRating_edit");
  const closeBtn = document.getElementById("closeBtn10");
  const closeListBtn = document.getElementById("closeBtn11");
  const overlay = popup?.parentElement;
  const listOverlay = editListPopup?.parentElement;

  if (closeBtn)
    closeBtn.addEventListener("click", () =>
      hidePopup("editProfileRating_add")
    );
  if (overlay) {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) hidePopup("editProfileRating_add");
    });
  }
  if (closeListBtn)
    closeListBtn.addEventListener("click", () =>
      hidePopup("editProfileRating_edit")
    );
  if (listOverlay) {
    listOverlay.addEventListener("click", (e) => {
      if (e.target === listOverlay) hidePopup("editProfileRating_edit");
    });
  }

  const form = document.getElementById("ratingForm");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!validateForm(form)) return;

      const data = {
        reviewerName: form.querySelector("#reviewerName").value.trim(),
        comment: form.querySelector("#comment").value.trim(),
        rating: parseInt(form.querySelector("#ratingScore").value),
      };

      try {
        const token = localStorage.getItem("authToken");
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get("id");
        const method = form.dataset.id ? "PATCH" : "POST";
        const url = form.dataset.id
          ? `${API_BASE_URL}/ratings/${form.dataset.id}`
          : `${API_BASE_URL}/ratings/${userId}`;

        const response = await fetch(url, {
          method,
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        await window.auth.handleApiError(response);

        common.showAlert("تم", "تم حفظ التقييم بنجاح", "success");
        cache.ratings = null;
        hidePopup("editProfileRating_add");
        await loadSectionData(
          cache,
          "#ratingContent",
          renderItem,
          "#ratingList"
        );
      } catch (error) {
        console.error("Rating form submission error:", error.message);
        common.showAlert("خطأ", "فشل حفظ التقييم", "error");
      }
    });
  }
}

export function initializeEventListeners(cache, showPopup) {
  document
    .querySelector("#ratingList")
    ?.addEventListener("click", async (e) => {
      if (e.target.classList.contains("edit-btn")) {
        const id = e.target.dataset.id;
        try {
          const token = localStorage.getItem("authToken");
          const response = await fetch(`${API_BASE_URL}/ratings/${id}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          await window.auth.handleApiError(response);
          const data = await response.json();

          const form = document.getElementById("ratingForm");
          if (form) form.dataset.id = id;
          showPopup("editProfileRating_add", "ratingFormScreen", {
            reviewerName: data.reviewerName || data.menteeName,
            comment: data.comment,
            ratingScore: data.rating,
          });
        } catch (error) {
          console.error("Fetch rating error:", error.message);
          common.showAlert("خطأ", "فشل جلب التقييم", "error");
        }
      } else if (e.target.classList.contains("delete-btn")) {
        if (confirm("هل أنت متأكد من حذف هذا التقييم؟")) {
          try {
            const token = localStorage.getItem("authToken");
            const response = await fetch(
              `${API_BASE_URL}/ratings/${e.target.dataset.id}`,
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
            cache.ratings = null;
            await loadSectionData(
              cache,
              "#ratingContent",
              renderItem,
              "#ratingList"
            );
          } catch (error) {
            console.error("Delete rating error:", error.message);
            common.showAlert("خطأ", "فشل حذف التقييم", "error");
          }
        }
      } else if (e.target.classList.contains("like-btn")) {
        const id = e.target.dataset.id;
        const isLiked = e.target.textContent === "إلغاء الإعجاب";
        try {
          const token = localStorage.getItem("authToken");
          const response = await fetch(`${API_BASE_URL}/ratings/${id}/like`, {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ liked: !isLiked }),
          });
          await window.auth.handleApiError(response);

          common.showAlert(
            "تم",
            `تم ${isLiked ? "إلغاء" : "إضافة"} الإعجاب بنجاح`,
            "success"
          );
          cache.ratings = null;
          await loadSectionData(
            cache,
            "#ratingContent",
            renderItem,
            "#ratingList"
          );
        } catch (error) {
          console.error("Like rating error:", error.message);
          common.showAlert("خطأ", "فشل تحديث الإعجاب", "error");
        }
      }
    });
}