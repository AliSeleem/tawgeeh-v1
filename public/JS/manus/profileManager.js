/**
 * Profile Manager
 * Handles the integration of all profile-related functionality
 * Controls edit/view modes based on profile ownership
 */

// Import utility functions
import { isProfileOwner, setupEditControls, initializeProfileSections } from './profileUtils.js';
import { loadUserProfile } from './profileService.js';

// Initialize the profile system
export async function initializeProfileSystem() {
  // Data cache to reduce API calls
  const dataCache = {
    experiences: null,
    certifications: null,
    education: null,
    ratings: null,
    achievements: null,
  };
  
  // Load user profile data and determine ownership
  const { isProfileOwner: ownerStatus, userData } = await loadUserProfile();
  
  // Setup UI based on ownership status
  setupEditControls();
  
  // Initialize all profile sections with proper permissions
  initializeProfileSections(dataCache);
  
  // Setup event listeners for edit buttons
  setupEditButtonListeners(ownerStatus);
  
  return { isProfileOwner: ownerStatus, userData };
}

// Setup event listeners for edit buttons
function setupEditButtonListeners(isOwner) {
  if (!isOwner) return; // Skip for non-owners
  
  // Main profile edit button
  const editBtn = document.getElementById('editBtn');
  if (editBtn) {
    editBtn.addEventListener('click', () => {
      common.showPopup('editProfileInfo');
    });
  }
  
  // Experience edit buttons
  const edit2BtnExp = document.getElementById('edit_2BtnExp');
  const editAddExp = document.getElementById('edit_addExp');
  if (edit2BtnExp) {
    edit2BtnExp.addEventListener('click', () => {
      common.showPopup('editProfileEx_edit');
    });
  }
  if (editAddExp) {
    editAddExp.addEventListener('click', () => {
      // Reset form for new entry
      const form = document.getElementById('experienceForm');
      if (form) {
        form.reset();
        delete form.dataset.id;
      }
      common.showPopup('editProfileEx_edit2', 'experienceFormScreen');
    });
  }
  
  // Certificate edit buttons
  const edit2BtnCert = document.getElementById('edit_2BtnCert');
  const editAddCert = document.getElementById('edit_addCert');
  if (edit2BtnCert) {
    edit2BtnCert.addEventListener('click', () => {
      common.showPopup('editProfileSp_edit');
    });
  }
  if (editAddCert) {
    editAddCert.addEventListener('click', () => {
      // Reset form for new entry
      const form = document.getElementById('certificateForm');
      if (form) {
        form.reset();
        delete form.dataset.id;
      }
      common.showPopup('editProfileSp_add', 'certificateFormScreen');
    });
  }
  
  // Education edit buttons
  const edit2BtnEdu = document.getElementById('edit_2BtnEdu');
  const editAddEdu = document.getElementById('edit_addEdu');
  if (edit2BtnEdu) {
    edit2BtnEdu.addEventListener('click', () => {
      common.showPopup('editProfileEdu_edit');
    });
  }
  if (editAddEdu) {
    editAddEdu.addEventListener('click', () => {
      // Reset form for new entry
      const form = document.getElementById('educationForm');
      if (form) {
        form.reset();
        delete form.dataset.id;
      }
      common.showPopup('editProfileEdu_add', 'educationFormScreen');
    });
  }
  
  // Profile image edit buttons
  const editBtnMain = document.getElementById('editBtnMain');
  if (editBtnMain) {
    editBtnMain.addEventListener('click', () => {
      document.getElementById('uploadImageProfile').click();
    });
  }
  
  // Background image edit button
  const editBigImage = document.querySelector('.edit_bigimage');
  if (editBigImage) {
    editBigImage.addEventListener('click', () => {
      document.getElementById('uploadImageBackground').click();
    });
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await initializeProfileSystem();
  } catch (error) {
    console.error('Failed to initialize profile system:', error);
    common.showAlert('خطأ', 'فشل تحميل الملف الشخصي', 'error');
  }
});
