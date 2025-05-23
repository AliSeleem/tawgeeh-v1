/**
 * Utility functions for profile management
 * Handles conditional rendering and permissions based on profile ownership
 */

// Check if current user is the profile owner
export function isProfileOwner() {
  const token = localStorage.getItem("authToken");
  const urlParams = new URLSearchParams(window.location.search);
  const profileUserId = urlParams.get("id");
  
  if (!token || !profileUserId) return false;
  
  try {
    const decoded = common.decodeJWT(token);
    return decoded && (decoded.sub === profileUserId || decoded.id === profileUserId);
  } catch (error) {
    console.error("Error checking profile ownership:", error);
    return false;
  }
}

// Show or hide edit controls based on profile ownership
export function setupEditControls() {
  const isOwner = isProfileOwner();
  console.log(`user is ${isOwner ? 'the owner' : 'not the ower'}`);
  
  // Get all edit buttons and controls
  const editButtons = document.querySelectorAll('.editIcons, #editBtn, #editBtnMain, .edit_bigimage');
  const addButtons = document.querySelectorAll('#moreExBtn_EX, #moreExBtn_SP, #moreExBtn_Edu, #moreExBtn_Rating, #moreExBtn_Achievement');
  
  // Show/hide edit buttons based on ownership
  editButtons.forEach(button => {
    button.style.display = isOwner ? 'flex' : 'none';
  });
  
  addButtons.forEach(button => {
    button.style.display = isOwner ? 'block' : 'none';
  });
  
  // Handle file upload elements
  const uploadElements = document.querySelectorAll('#uploadImageProfile, #uploadImageBackground, #videoInput');
  uploadElements.forEach(element => {
    if (element.parentElement) {
      const uploadTrigger = element.parentElement.querySelector('[aria-label*="تحميل"], [aria-label*="upload"]');
      if (uploadTrigger) {
        uploadTrigger.style.display = isOwner ? 'block' : 'none';
      }
    }
  });
  
  return isOwner;
}

// Initialize all profile sections with proper permissions
export function initializeProfileSections(dataCache) {
  const isOwner = isProfileOwner();
  
  // Initialize services with ownership context
  if (window.experienceService) {
    experienceService.loadSectionData(
      dataCache,
      "#experiencesContainer",
      experienceService.renderItem,
      "#experienceList",
      isOwner
    );
    experienceService.initializePopup(common.showPopup, common.hidePopup, dataCache, isOwner);
    experienceService.initializeEventListeners(dataCache, common.showPopup, isOwner);
  }
  
  if (window.certificateService) {
    certificateService.loadSectionData(
      dataCache,
      "#certificatesContainer",
      certificateService.renderItem,
      "#certificateList",
      isOwner
    );
    certificateService.initializePopup(common.showPopup, common.hidePopup, dataCache, isOwner);
    certificateService.initializeEventListeners(dataCache, common.showPopup, isOwner);
  }
  
  if (window.educationService) {
    educationService.loadSectionData(
      dataCache,
      "#educationContainer",
      educationService.renderItem,
      "#educationList",
      isOwner
    );
    educationService.initializePopup(common.showPopup, common.hidePopup, dataCache, isOwner);
    educationService.initializeEventListeners(dataCache, common.showPopup, isOwner);
  }
  
  if (window.achievementService) {
    achievementService.loadSectionData(
      dataCache,
      "#achievementsContent",
      achievementService.renderItem,
      "#achievementList",
      isOwner
    );
    achievementService.initializePopup(common.showPopup, common.hidePopup, dataCache, isOwner);
    achievementService.initializeEventListeners(dataCache, common.showPopup, isOwner);
  }
  
  if (window.ratingService) {
    ratingService.loadSectionData(
      dataCache,
      "#ratingContent",
      ratingService.renderItem,
      "#ratingList",
      isOwner
    );
    ratingService.initializePopup(common.showPopup, common.hidePopup, dataCache, isOwner);
    ratingService.initializeEventListeners(dataCache, common.showPopup, isOwner);
  }
  
  // Initialize image upload functionality
  if (window.imageUploadService && isOwner) {
    imageUploadService.initializeImageUpload();
  }
  
  return isOwner;
}
