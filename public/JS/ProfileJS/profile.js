///////////////////////////////////
// import * as profileService from "./profileService.js";
// import * as experienceService from "./experienceService.js";
// import * as certificateService from "./certificateService.js";
// import * as educationService from "./educationService.js";
// import * as ratingService from "./ratingService.js";
// import * as achievementService from "./achievementService.js";
// import * as imageUploadService from "./imageUploadService.js";

// document.addEventListener("DOMContentLoaded", async function () {
//   const dataCache = {
//     experiences: null,
//     certifications: null,
//     education: null,
//     ratings: null,
//     achievements: null,
//   };

//   let isProfileOwner = true;

//   // Initialize notifications
//   let notificationsData = [];
//   try {
//     notificationsData = await window.auth.fetchNotifications();
//     console.log("Notifications loaded:", notificationsData);
//   } catch (error) {
//     console.error("Failed to fetch notifications:", error.message);
//   }

//   // Setup authentication UI
//   const authSection = document.querySelector(".left_Sec");
//   if (authSection) {
//     common.initializeAuth(
//       authSection,
//       notificationsData,
//       common.showLoginPopup,
//       common.showSignupPopup,
//       common.toggleNotifications,
//       () => common.updateNotificationCount(notificationsData)
//     );
//     common.renderNotifications(notificationsData, () =>
//       common.updateNotificationCount(notificationsData)
//     );
//   }

//   // Initialize Flatpickr for date inputs
//   function initializeFlatpickr() {
//     const dateInputs = document.querySelectorAll(".date-start, .date-end");
//     dateInputs.forEach((input) => {
//       flatpickr(input, {
//         locale: "ar",
//         dateFormat: "Y-m-d",
//         allowInput: true,
//         altInput: true,
//         altFormat: "d/m/Y",
//         onChange: function (selectedDates, dateStr) {
//           const pairId = input.dataset.pair;
//           if (pairId && input.classList.contains("date-start")) {
//             const pairInput = document.getElementById(pairId);
//             if (pairInput) pairInput._flatpickr.set("minDate", dateStr);
//           }
//         },
//       });
//     });
//   }

//   // Toggle visibility of edit/upload buttons based on ownership
//   function toggleEditButtons() {
//     const editElementIds = [
//       "editBtn",
//       "editBtnMain",
//       "edit_2BtnExp",
//       "edit_addExp",
//       "moreExBtn_EX",
//       "edit_2BtnCert",
//       "edit_addCert",
//       "moreExBtn_SP",
//       "edit_2BtnEdu",
//       "edit_addEdu",
//       "moreExBtn_Edu",
//       "edit_2BtnRating",
//       "edit_addRating",
//       "moreExBtn_Rating",
//       "edit_2BtnAchievement",
//       "edit_addAchievement",
//       "moreExBtn_Achievement",
//       "edit_bigimage",
//       "uploadImage",
//       "uploadImageBackground",
//       "videoInput",
//       "removeProfileImage",
//     ];
//     const editClasses = [
//       "edit-exp",
//       "delete-exp",
//       "edit-cert",
//       "delete-cert",
//       "edit-edu",
//       "delete-edu",
//       "edit-btn",
//       "delete-btn",
//       "like-btn",
//     ];

//     const editElements = [];
//     editElementIds.forEach((id) => {
//       const el = document.getElementById(id);
//       if (el) editElements.push(el);
//       else console.warn(`Element with ID ${id} not found`);
//     });
//     editClasses.forEach((cls) => {
//       const elements = document.querySelectorAll(`.${cls}`);
//       elements.forEach((el) => editElements.push(el));
//     });

//     editElements.forEach((el) => {
//       if (isProfileOwner) {
//         el.style.display = "block";
//         el.style.visibility = "visible";
//         el.setAttribute("aria-hidden", "false");
//         if (el.tagName === "BUTTON" || el.tagName === "INPUT") {
//           el.disabled = false;
//         }
//       } else {
//         el.style.display = "none";
//         el.style.visibility = "hidden";
//         el.setAttribute("aria-hidden", "true");
//         if (el.tagName === "BUTTON" || el.tagName === "INPUT") {
//           el.disabled = true;
//         }
//       }
//     });

//     // Display view-only message for non-owners
//     const viewOnlyMessage = document.getElementById("viewOnlyMessage");
//     if (isProfileOwner) {
//       if (!viewOnlyMessage) {
//         const message = document.createElement("p");
//         message.id = "viewOnlyMessage";
//         message.textContent = "هذا الملف الشخصي في وضع العرض فقط";
//         message.style.color = "#666";
//         message.style.margin = "10px 0";
//         message.style.textAlign = "center";
//         const profileContainer = document.querySelector("#profile-hero");
//         if (profileContainer) {
//           profileContainer.insertBefore(message, profileContainer.firstChild);
//         }
//       }
//     } else if (viewOnlyMessage) {
//       viewOnlyMessage.remove();
//     }
//   }

//   // Show popup for editing (only for profile owner)
//   function showPopup(popupId, screenId, data = {}) {
//     if (!isProfileOwner) {
//       console.log("Edit blocked: User is not the profile owner");
//       common.showAlert("غير مسموح", "لا يمكنك تعديل هذا الملف الشخصي", "error");
//       return;
//     }

//     const popupContainer = document.getElementById(popupId);
//     const popupOverlay = popupContainer?.parentElement;
//     if (!popupContainer || !popupOverlay) {
//       console.error(`Popup container or overlay not found for ID: ${popupId}`);
//       return;
//     }

//     document.querySelectorAll(".overlay.show").forEach((modal) => {
//       if (modal !== popupOverlay)
//         hidePopup(modal.querySelector(".popup-container")?.id);
//     });

//     popupOverlay.classList.add("show");
//     popupOverlay.style.display = "block";
//     popupContainer.classList.add("show");
//     popupContainer.style.display = "block";

//     const screens = popupContainer.querySelectorAll(".popup-screen");
//     screens.forEach((screen) => {
//       screen.style.display = screen.id === screenId ? "block" : "none";
//     });

//     const form = popupContainer.querySelector("form");
//     if (form) {
//       form.reset();
//       delete form.dataset.id;
//       Object.entries(data).forEach(([key, value]) => {
//         const input = form.querySelector(`#${key}`);
//         if (input) {
//           if (input.type === "checkbox") {
//             input.checked = !!value;
//           } else {
//             input.value = value || "";
//           }
//         }
//       });
//       if (data.id) form.dataset.id = data.id;
//       if (data.currentlyWorking !== undefined) {
//         const currentlyWorking = form.querySelector("#currentlyWorking");
//         if (currentlyWorking) currentlyWorking.checked = data.currentlyWorking;
//       }
//       form
//         .querySelectorAll(".error")
//         .forEach((span) => (span.textContent = ""));
//       form.querySelectorAll("input, textarea, select").forEach((input) => {
//         profileService.checkInputDirection(input);
//         input.addEventListener("input", () =>
//           profileService.checkInputDirection(input)
//         );
//       });
//     }

//     const authPopups = [
//       "hideSignupPopup",
//       "hideLoginPopup",
//       "hideMentorApplicationPopup",
//       "hidePasswordResetPopup",
//     ];
//     authPopups.forEach((fn) => {
//       if (typeof common[fn] === "function") common[fn]();
//     });

//     initializeFlatpickr();
//   }

//   // Hide popup with smooth transition
//   function hidePopup(popupId) {
//     const popupContainer = document.getElementById(popupId);
//     const popupOverlay = popupContainer?.parentElement;
//     if (!popupContainer || !popupOverlay) {
//       console.error(`Popup container or overlay not found for ID: ${popupId}`);
//       return;
//     }

//     if (!popupOverlay.classList.contains("show")) return;

//     popupContainer.classList.remove("show");
//     popupOverlay.classList.remove("show");

//     setTimeout(() => {
//       popupContainer.style.display = "none";
//       popupOverlay.style.display = "none";
//     }, 300);

//     const form = popupContainer.querySelector("form");
//     if (form) {
//       form.reset();
//       delete form.dataset.id;
//       form
//         .querySelectorAll(".error")
//         .forEach((span) => (span.textContent = ""));
//       form.querySelectorAll("input, textarea, select").forEach((input) => {
//         const clone = input.cloneNode(true);
//         input.parentNode.replaceChild(clone, input);
//       });
//     }
//   }

//   // Switch between profile tabs
//   async function switchTab(tabName) {
//     const tabs = {
//       overview: {
//         content: "overviewContent",
//         tab: "overviewTab",
//         section: null,
//       },
//       services: {
//         content: "servicesContent",
//         tab: "manageservices",
//         section: null,
//       },
//       rating: {
//         content: "ratingContent",
//         tab: "ratingTab",
//         section: "ratings",
//       },
//       achievements: {
//         content: "achievementsContent",
//         tab: "achievementsTab",
//         section: "achievements",
//       },
//     };

//     Object.values(tabs).forEach(({ content, tab }) => {
//       const contentElement = document.getElementById(content);
//       if (contentElement) contentElement.style.display = "none";
//       const tabElement = document.getElementById(tab);
//       if (tabElement) tabElement.classList.remove("checked");
//     });

//     const selectedContent = document.getElementById(tabs[tabName].content);
//     const selectedTab = document.getElementById(tabs[tabName].tab);
//     if (selectedContent) selectedContent.style.display = "block";
//     if (selectedTab) selectedTab.classList.add("checked");

//     if (tabs[tabName].section) {
//       const service =
//         tabs[tabName].section === "ratings"
//           ? ratingService
//           : achievementService;
//       await service.loadSectionData(
//         dataCache,
//         `#${tabs[tabName].content}`,
//         service.renderItem,
//         `#${tabs[tabName].section}List`
//       );
//     }
//   }

//   // Initialize event listeners
//   function initializeEventListeners() {
//     const openModalConfigs = [
//       {
//         btnId: "editBtn",
//         modalId: "editProfileInfo",
//         screenId: "professionalForm",
//       },
//       {
//         btnId: "editBtnMain",
//         modalId: null,
//         action: () => document.getElementById("uploadImage")?.click(),
//       },
//       {
//         btnId: "edit_2BtnExp",
//         modalId: "editProfileEx_edit",
//         screenId: "experienceList",
//       },
//       {
//         btnId: "edit_addExp",
//         modalId: "editProfileEx_edit2",
//         screenId: "experienceFormScreen",
//       },
//       {
//         btnId: "moreExBtn_EX",
//         modalId: "editProfileEx_edit2",
//         screenId: "experienceFormScreen",
//       },
//       {
//         btnId: "edit_2BtnCert",
//         modalId: "editProfileSp_edit",
//         screenId: "certificateList",
//       },
//       {
//         btnId: "edit_addCert",
//         modalId: "editProfileSp_add",
//         screenId: "certificateFormScreen",
//       },
//       {
//         btnId: "moreExBtn_SP",
//         modalId: "editProfileSp_add",
//         screenId: "certificateFormScreen",
//       },
//       {
//         btnId: "edit_2BtnEdu",
//         modalId: "editProfileEdu_edit",
//         screenId: "educationList",
//       },
//       {
//         btnId: "edit_addEdu",
//         modalId: "editProfileEdu_add",
//         screenId: "educationFormScreen",
//       },
//       {
//         btnId: "moreExBtn_Edu",
//         modalId: "editProfileEdu_add",
//         screenId: "educationFormScreen",
//       },
//       {
//         btnId: "edit_2BtnRating",
//         modalId: "editProfileRating_edit",
//         screenId: "ratingList",
//       },
//       {
//         btnId: "edit_addRating",
//         modalId: "editProfileRating_add",
//         screenId: "ratingFormScreen",
//       },
//       {
//         btnId: "moreExBtn_Rating",
//         modalId: "editProfileRating_add",
//         screenId: "ratingFormScreen",
//       },
//       {
//         btnId: "edit_2BtnAchievement",
//         modalId: "editProfileAchievement_edit",
//         screenId: "achievementList",
//       },
//       {
//         btnId: "edit_addAchievement",
//         modalId: "editProfileAchievement_add",
//         screenId: "achievementFormScreen",
//       },
//       {
//         btnId: "moreExBtn_Achievement",
//         modalId: "editProfileAchievement_add",
//         screenId: "achievementFormScreen",
//       },
//       {
//         btnId: "edit_bigimage",
//         modalId: null,
//         action: () => document.getElementById("uploadImageBackground")?.click(),
//       },
//     ];

//     if (isProfileOwner) {
//       openModalConfigs.forEach((config) => {
//         const button = document.getElementById(config.btnId);
//         if (button) {
//           button.addEventListener("click", (e) => {
//             e.preventDefault();
//             if (config.modalId) {
//               const form = document.getElementById(
//                 config.screenId.replace("Screen", "")
//               );
//               if (form) delete form.dataset.id;
//               showPopup(config.modalId, config.screenId);
//             } else if (config.action) {
//               config.action();
//             }
//           });
//         }
//       });

//       experienceService.initializeEventListeners(dataCache, showPopup);
//       certificateService.initializeEventListeners(dataCache, showPopup);
//       educationService.initializeEventListeners(dataCache, showPopup);
//       ratingService.initializeEventListeners(dataCache, showPopup);
//       achievementService.initializeEventListeners(dataCache, showPopup);
//     }

//     const closeModalConfigs = [
//       { btnId: "closeBtn1", modalId: "editProfileInfo" },
//       { btnId: "closeBtn3", modalId: "editProfileEx_edit" },
//       { btnId: "closeBtn4", modalId: "editProfileEx_edit2" },
//       { btnId: "closeBtn5", modalId: "editProfileSp_add" },
//       { btnId: "closeBtn6", modalId: "editProfileEdu_add" },
//       { btnId: "closeBtn7", modalId: "editProfileEdu_edit" },
//       { btnId: "closeBtn9", modalId: "editProfileSp_edit" },
//       { btnId: "closeBtn10", modalId: "editProfileRating_add" },
//       { btnId: "closeBtn11", modalId: "editProfileRating_edit" },
//       { btnId: "closeBtn12", modalId: "editProfileAchievement_add" },
//       { btnId: "closeBtn13", modalId: "editProfileAchievement_edit" },
//     ];

//     closeModalConfigs.forEach((config) => {
//       const button = document.getElementById(config.btnId);
//       if (button) {
//         button.addEventListener("click", () => hidePopup(config.modalId));
//       }
//     });

//     document.querySelectorAll(".tab").forEach((tab) => {
//       tab.addEventListener("click", async () => {
//         const tabName = tab.id.replace("Tab", "");
//         await switchTab(tabName);
//       });
//     });
//   }

//   // Initialize the page
//   async function initialize() {
//     const profileData = await profileService.loadUserProfile();
//     isProfileOwner = profileData.isProfileOwner;

//     toggleEditButtons();

//     common.initializeLoginPopup(common.showSignupPopup);
//     common.initializeSignupPopup();
//     common.initializeMentorApplicationPopup();

//     if (isProfileOwner) {
//       profileService.initializeProfilePopup(showPopup, hidePopup);
//       experienceService.initializePopup(showPopup, hidePopup, dataCache);
//       certificateService.initializePopup(showPopup, hidePopup, dataCache);
//       educationService.initializePopup(showPopup, hidePopup, dataCache);
//       ratingService.initializePopup(showPopup, hidePopup, dataCache);
//       achievementService.initializePopup(showPopup, hidePopup, dataCache);
//       imageUploadService.initializeImageUpload();
//     }

//     await Promise.all([
//       experienceService.loadSectionData(
//         dataCache,
//         "#experiencesContainer",
//         experienceService.renderItem,
//         "#experienceList"
//       ),
//       certificateService.loadSectionData(
//         dataCache,
//         "#certificatesContainer",
//         certificateService.renderItem,
//         "#certificateList"
//       ),
//       educationService.loadSectionData(
//         dataCache,
//         "#educationContainer",
//         educationService.renderItem,
//         "#educationList"
//       ),
//       ratingService.loadSectionData(
//         dataCache,
//         "#ratingContent",
//         ratingService.renderItem,
//         "#ratingList"
//       ),
//       achievementService.loadSectionData(
//         dataCache,
//         "#achievementsContent",
//         achievementService.renderItem,
//         "#achievementList"
//       ),
//     ]);

//     await switchTab("overview");
//     initializeEventListeners();
//   }

//   try {
//     await initialize();
//   } catch (error) {
//     console.error("Initialization error:", error.message);
//     common.showAlert("خطأ", "فشل تهيئة الصفحة", "error");
//   }
// });
