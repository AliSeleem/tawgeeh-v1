// Modal Elements
const loginModal = document.getElementById('loginModal');
const signupModal = document.getElementById('signupModal');
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const closeBtns = document.querySelectorAll('.close');
const showSignupLink = document.getElementById('showSignup');
const showLoginLink = document.getElementById('showLogin');

// Signup Form Steps
const signupForm1 = document.getElementById('signupForm1');
const signupForm2 = document.getElementById('signupForm2');
const signupForm3 = document.getElementById('signupForm3');
const progressSteps = document.querySelectorAll('.progress-step');
let currentStep = 1;

// Event Listeners
loginBtn.addEventListener('click', () => openModal(loginModal));
signupBtn.addEventListener('click', () => openModal(signupModal));
closeBtns.forEach(btn => btn.addEventListener('click', closeModal));
showSignupLink.addEventListener('click', switchToSignup);
showLoginLink.addEventListener('click', switchToLogin);

// Form Submissions
signupForm1.addEventListener('submit', (e) => handleSignupStep(e, 1));
signupForm2.addEventListener('submit', (e) => handleSignupStep(e, 2));
signupForm3.addEventListener('submit', handleFinalSignup);
document.getElementById('loginForm').addEventListener('submit', handleLogin);

// Modal Functions
function openModal(modal) {
    closeAllModals();
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modals = [loginModal, signupModal];
    modals.forEach(modal => {
        modal.style.display = 'none';
    });
    document.body.style.overflow = 'auto';
    resetSignupForms();
}

function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => modal.style.display = 'none');
}

function switchToSignup(e) {
    e.preventDefault();
    closeAllModals();
    openModal(signupModal);
}

function switchToLogin(e) {
    e.preventDefault();
    closeAllModals();
    openModal(loginModal);
}

// Form Handling Functions
function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Add your login logic here
    console.log('Login attempt:', { email, password, rememberMe });
}

function handleSignupStep(e, step) {
    e.preventDefault();
    
    if (validateStep(step)) {
        if (step < 3) {
            currentStep++;
            updateSignupUI();
        }
    }
}

function handleFinalSignup(e) {
    e.preventDefault();
    
    if (validateStep(3)) {
        const formData = gatherFormData();
        // Add your signup logic here
        console.log('Signup data:', formData);
        closeModal();
    }
}

// UI Update Functions
function updateSignupUI() {
    // Hide all forms
    [signupForm1, signupForm2, signupForm3].forEach(form => {
        form.classList.add('hidden');
    });
    
    // Show current form
    document.getElementById(`signupForm${currentStep}`).classList.remove('hidden');
    
    // Update progress steps
    progressSteps.forEach((step, index) => {
        if (index + 1 <= currentStep) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
}

function resetSignupForms() {
    currentStep = 1;
    [signupForm1, signupForm2, signupForm3].forEach(form => form.reset());
    updateSignupUI();
}

// Validation Functions
function validateStep(step) {
    let isValid = true;
    
    switch(step) {
        case 1:
            const fullName = document.getElementById('fullName').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (!fullName || !email || !password || !confirmPassword) {
                isValid = false;
            }
            if (password !== confirmPassword) {
                isValid = false;
                // Show password mismatch error
            }
            break;
            
        case 2:
            const specialization = document.getElementById('specialization').value;
            const bio = document.getElementById('bio').value;
            
            if (!specialization || !bio) {
                isValid = false;
            }
            break;
            
        case 3:
            const termsAccept = document.getElementById('termsAccept').checked;
            
            if (!termsAccept) {
                isValid = false;
            }
            break;
    }
    
    return isValid;
}

function gatherFormData() {
    return {
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('signupEmail').value,
        password: document.getElementById('signupPassword').value,
        specialization: document.getElementById('specialization').value,
        bio: document.getElementById('bio').value,
        profileImage: document.getElementById('profileImage').files[0]
    };
}

// Social Login Functions
document.getElementById('googleLogin').addEventListener('click', () => {
    // Implement Google login
    console.log('Google login clicked');
});

document.getElementById('linkedinLogin').addEventListener('click', () => {
    // Implement LinkedIn login
    console.log('LinkedIn login clicked');
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        closeModal();
    }
});
