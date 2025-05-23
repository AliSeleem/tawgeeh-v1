const API_BASE_URL = "https://tawgeeh-v1-production.up.railway.app";

export function initializeImageUpload() {
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
      if (!file) return;

      // Validate file size and type
      if (file.size > 2 * 1024 * 1024) {
        common.showAlert(
          "خطأ",
          "حجم الصورة يجب أن يكون أقل من 2 ميجابايت",
          "error"
        );
        uploadImage.value = "";
        return;
      }
      if (!file.type.startsWith("image/")) {
        common.showAlert("خطأ", "يرجى تحميل ملف صورة صالح", "error");
        uploadImage.value = "";
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
        await window.auth.handleApiError(response);
        const data = await response.json();
        profileImagePreview.src = data.image_url;
        document.querySelectorAll("#image1, #image2").forEach((img) => {
          img.src = data.image_url;
        });
        common.showAlert("تم", "تم تحميل الصورة بنجاح", "success");
        uploadImage.value = "";
        await profileService.loadUserProfile();
      } catch (error) {
        console.error("Image upload error:", error.message);
        common.showAlert("خطأ", "فشل تحميل الصورة", "error");
        uploadImage.value = "";
      }
    });
  }

  if (uploadImageBackground) {
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
        await window.auth.handleApiError(response);
        const data = await response.json();
        document.getElementById("background_image").src =
          data.background_image_url;
        common.showAlert("تم", "تم تحميل صورة الخلفية بنجاح", "success");
        uploadImageBackground.value = "";
        await profileService.loadUserProfile();
      } catch (error) {
        console.error("Background image upload error:", error.message);
        common.showAlert("خطأ", "فشل تحميل صورة الخلفية", "error");
        uploadImageBackground.value = "";
      }
    });
  }

  if (videoInput) {
    videoInput.addEventListener("change", async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Validate file size and type
      if (!file.type.includes("mp4") || file.size > 25 * 1024 * 1024) {
        common.showAlert(
          "خطأ",
          "يجب أن يكون الفيديو بصيغة MP4 وحجمه أقل من 25 ميجابايت",
          "error"
        );
        videoInput.value = "";
        return;
      }

      try {
        const formData = new FormData();
        formData.append("video", file);
        const token = localStorage.getItem("authToken");
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get("id");

        const response = await fetch(
          `${API_BASE_URL}/users/${userId}/upload-video`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
          }
        );
        await window.auth.handleApiError(response);
        const data = await response.json();
        const videoPlayer = document.getElementById("videoPlayer");
        videoPlayer.src = data.video_url;
        videoPlayer.style.display = "block";
        document.getElementById("uplodimage").style.display = "none";
        document.getElementById("uplodeBtn").style.display = "none";
        document.getElementById("size").style.display = "none";
        common.showAlert("تم", "تم تحميل الفيديو بنجاح", "success");
        videoInput.value = "";
        await profileService.loadUserProfile();
      } catch (error) {
        console.error("Video upload error:", error.message);
        common.showAlert("خطأ", "فشل تحميل الفيديو", "error");
        videoInput.value = "";
      }
    });
  }

  if (editBtnMain) {
    editBtnMain.addEventListener("click", () => uploadImage.click());
  }

  // if (removeProfileImage) {
  //   removeProfileImage.addEventListener("click", async () => {
  //     try {
  //       const token = localStorage.getItem("authToken");
  //       const urlParams = new URLSearchParams(window.location.search);
  //       const userId = urlParams.get("id");

  //       const response = await fetch(
  //         `${API_BASE_URL}/users/${userId}/remove-image`,
  //         {
  //           method: "DELETE",
  //           headers: { Authorization: `Bearer ${token}` },
  //         }
  //       );
  //       await window.auth.handleApiError(response);
  //       profileImagePreview.src = "../mentor-images/personal_image.png";
  //       document.querySelectorAll("#image1, #image2").forEach((img) => {
  //         img.src = "../mentor-images/personal_image.png";
  //       });
  //       common.showAlert("تم", "تم إزالة الصورة بنجاح", "success");
  //       await profileService.loadUserProfile();
  //     } catch (error) {
  //       console.error("Image removal error:", error.message);
  //       common.showAlert("خطأ", "فشل إزالة الصورة", "error");
  //     }
  //   });
  // }
}
