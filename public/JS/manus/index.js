/**
 * Main entry point for the profile system
 * Integrates all modules and initializes the profile functionality
 */

// Import all necessary modules
import { initializeProfile } from './profileIntegration.js';
import { isProfileOwner, setupEditControls } from './profileUtils.js';
import { initializeEditMode } from './profileEditMode.js';
import { initializeViewMode } from './profileViewMode.js';

// Initialize the profile system when the DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  try {
    console.log('Initializing profile system...');
    
    // Add CSS for profile modes
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '../CSS/profileModes.css';
    document.head.appendChild(link);
    
    // Initialize the profile system
    const { isProfileOwner: ownerStatus } = await initializeProfile();
    
    console.log(`Profile initialized as: ${ownerStatus ? 'Owner' : 'Visitor'}`);
    
    // Set up global testing function
    window.testProfileSystem = async () => {
      const { runAllTests } = await import('./profileTesting.js');
      return runAllTests();
    };
    
  } catch (error) {
    console.error('Failed to initialize profile system:', error);
    common.showAlert('خطأ', 'فشل تحميل الملف الشخصي', 'error');
  }
});
