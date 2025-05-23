/**
 * Profile View Mode
 * Handles the view-only mode for other users' profiles
 * Ensures all edit controls are hidden and data is read-only
 */

// Import utility functions
import { isProfileOwner } from './profileUtils.js';

// Initialize view-only mode for non-owners
export function initializeViewMode() {
  const isOwner = isProfileOwner();
  
  if (!isOwner) {
    // Hide all edit controls
    hideAllEditControls();
    
    // Disable all form inputs
    disableAllFormInputs();
    
    // Remove edit event listeners
    removeEditEventListeners();
    
    // Apply read-only styling
    applyReadOnlyStyling();
  }
  
  return !isOwner;
}

// Hide all edit controls for non-owners
function hideAllEditControls() {
  // Hide all edit buttons
  const editElements = document.querySelectorAll(
    '.editIcons, #editBtn, #editBtnMain, .edit_bigimage, ' +
    '#moreExBtn_EX, #moreExBtn_SP, #moreExBtn_Edu, #moreExBtn_Rating, #moreExBtn_Achievement, ' +
    '.edit-exp, .delete-exp, .edit-cert, .delete-cert, .edit-edu, .delete-edu, ' +
    '.edit-btn, .delete-btn'
  );
  
  editElements.forEach(element => {
    if (element) element.style.display = 'none';
  });
  
  // Hide file upload elements
  const uploadElements = document.querySelectorAll(
    '#uploadImageProfile, #uploadImageBackground, #videoInput'
  );
  
  uploadElements.forEach(element => {
    if (element && element.parentElement) {
      const uploadTrigger = element.parentElement.querySelector('[aria-label*="تحميل"], [aria-label*="upload"]');
      if (uploadTrigger) {
        uploadTrigger.style.display = 'none';
      }
    }
  });
}

// Disable all form inputs for non-owners
function disableAllFormInputs() {
  const formInputs = document.querySelectorAll(
    'input:not([type="hidden"]), textarea, select'
  );
  
  formInputs.forEach(input => {
    input.disabled = true;
    input.classList.add('read-only');
  });
}

// Remove edit event listeners for non-owners
function removeEditEventListeners() {
  // Remove click events from edit buttons
  const editButtons = document.querySelectorAll(
    '#editBtn, #edit_2BtnExp, #edit_addExp, #edit_2BtnCert, #edit_addCert, ' +
    '#edit_2BtnEdu, #edit_addEdu, #editBtnMain, .edit_bigimage'
  );
  
  editButtons.forEach(button => {
    if (button) {
      // Clone and replace to remove event listeners
      const newButton = button.cloneNode(true);
      if (button.parentNode) {
        button.parentNode.replaceChild(newButton, button);
      }
    }
  });
}

// Apply read-only styling for view mode
function applyReadOnlyStyling() {
  // Add view-only class to profile container
  const profileContainer = document.querySelector('#profile-hero');
  if (profileContainer) {
    profileContainer.classList.add('view-only-profile');
  }
  
  // Style all section containers as read-only
  const sectionContainers = document.querySelectorAll(
    '.veiw_mentorFormat, .mentor_veiw_con, .left_section'
  );
  
  sectionContainers.forEach(container => {
    container.classList.add('view-only-section');
  });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  try {
    initializeViewMode();
  } catch (error) {
    console.error('Failed to initialize view mode:', error);
  }
});
