// Authentication management
const auth = {
    // Store reference to database functions
    dbRef: null,

    // Set database reference
    setDb(database) {
        this.dbRef = database;
    },
    // Initialize authentication
    init() {
        this.setupEventListeners();
        this.checkSession();
    },
    
    // Setup event listeners
    setupEventListeners() {
        // Tab switching
        const loginTab = document.getElementById('login-tab');
        const signupTab = document.getElementById('signup-tab');
        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');
        
        if (loginTab && signupTab) {
            loginTab.addEventListener('click', () => {
                loginTab.classList.add('active');
                signupTab.classList.remove('active');
                loginForm.style.display = 'block';
                signupForm.style.display = 'none';
            });
            
            signupTab.addEventListener('click', () => {
                signupTab.classList.add('active');
                loginTab.classList.remove('active');
                signupForm.style.display = 'block';
                loginForm.style.display = 'none';
            });
        }
        
        // Login button click
        const loginBtn = document.getElementById('login-btn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.login());
        }
        
        // Enter key in login password field
        const loginPassword = document.getElementById('login-password');
        if (loginPassword) {
            loginPassword.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') {
                    this.login();
                }
            });
        }
        
        // Signup button click
        const signupBtn = document.getElementById('signup-btn');
        if (signupBtn) {
            signupBtn.addEventListener('click', () => this.signup());
        }
        
        // Enter key in signup confirm password field
        const signupConfirm = document.getElementById('signup-confirm');
        if (signupConfirm) {
            signupConfirm.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') {
                    this.signup();
                }
            });
        }
        
        // Logout button click
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
    },
    
    // Check if user is signed in
    async checkSession() {
        try {
            utils.showLoading();
            
            let user = null;
            
            // Get user from Supabase
            if (this.dbRef) {
                user = await this.dbRef.getCurrentUser();
            }
            
            if (user) {
                this.showMainApp();
            } else {
                this.showLoginScreen();
            }
            
            utils.hideLoading();
        } catch (error) {
            utils.hideLoading();
            console.error('Error checking session:', error);
            this.showLoginScreen();
        }
    },
    
    // Show the main application
    showMainApp() {
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('main-container').style.display = 'flex';
        
        // Initialize app
        app.init();
    },
    
    // Show the login screen
    showLoginScreen() {
        document.getElementById('auth-container').style.display = 'flex';
        document.getElementById('main-container').style.display = 'none';
    },
    
    // Login function
    async login() {
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value.trim();
        const authMessage = document.getElementById('login-message');
        
        // Validate inputs
        if (!email || !password) {
            authMessage.textContent = 'Please enter both email and password.';
            authMessage.style.color = 'red';
            return;
        }
        
        try {
            utils.showLoading();
            
            if (!this.dbRef) {
                throw new Error('Database connection not available. Please refresh and try again.');
            }
            
            const response = await this.dbRef.signIn(email, password);
            
            if (response && response.user) {
                // Clear inputs
                document.getElementById('login-email').value = '';
                document.getElementById('login-password').value = '';
                
                // Show success message
                authMessage.textContent = 'Login successful!';
                authMessage.style.color = 'green';
                
                setTimeout(() => {
                    // Show the main app with a slight delay to see the success message
                    this.showMainApp();
                }, 1000);
            } else {
                throw new Error('Authentication failed');
            }
            
            utils.hideLoading();
        } catch (error) {
            utils.hideLoading();
            
            console.error('Login error:', error);
            
            // Show friendly error message
            if (error.message) {
                if (error.message.includes('Invalid login credentials')) {
                    authMessage.textContent = 'Invalid email or password. Please try again.';
                } else {
                    authMessage.textContent = 'An error occurred during login. Please try again.';
                }
            } else {
                authMessage.textContent = 'An error occurred during login. Please try again.';
            }
            authMessage.style.color = 'red';
        }
    },
    
    // Signup function
    async signup() {
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value.trim();
        const confirmPassword = document.getElementById('signup-confirm').value.trim();
        const authMessage = document.getElementById('signup-message');
        
        // Validate inputs
        if (!email || !password || !confirmPassword) {
            authMessage.textContent = 'Please fill in all fields.';
            authMessage.style.color = 'red';
            return;
        }
        
        if (password !== confirmPassword) {
            authMessage.textContent = 'Passwords do not match.';
            authMessage.style.color = 'red';
            return;
        }
        
        // Password strength check
        if (password.length < 6) {
            authMessage.textContent = 'Password must be at least 6 characters long.';
            authMessage.style.color = 'red';
            return;
        }
        
        try {
            utils.showLoading();
            
            if (!this.dbRef) {
                throw new Error('Database connection not available. Please refresh and try again.');
            }
            
            // Supabase signup
            const { data, error } = await supabase.auth.signUp({
                email,
                password
            });
            
            if (error) throw error;
            
            if (data && data.user) {
                // Clear inputs
                document.getElementById('signup-email').value = '';
                document.getElementById('signup-password').value = '';
                document.getElementById('signup-confirm').value = '';
                
                // Show success message without email confirmation details
                authMessage.innerHTML = '<strong>Account created successfully!</strong>';
                authMessage.style.color = 'green';
                
                // Create a button to go to login
                const loginButton = document.createElement('button');
                loginButton.textContent = 'Go to Login';
                loginButton.className = 'btn-secondary';
                loginButton.style.marginTop = '15px';
                loginButton.style.width = '100%';
                loginButton.onclick = () => {
                    document.getElementById('login-tab').click();
                };
                
                // Clear any existing button
                const existingButton = authMessage.nextElementSibling;
                if (existingButton && existingButton.tagName === 'BUTTON' && existingButton.className.includes('btn-secondary')) {
                    existingButton.remove();
                }
                
                // Add button after the message
                authMessage.parentNode.insertBefore(loginButton, authMessage.nextSibling);
            } else {
                throw new Error('Signup failed');
            }
            
            utils.hideLoading();
        } catch (error) {
            utils.hideLoading();
            console.error('Signup error:', error);
            
            // Log more details about the error to help debugging
            if (error && error.code) {
                console.log('Error code:', error.code);
            }
            
            // Show friendly error message
            if (error.message) {
                if (error.message.includes('weak_password')) {
                    authMessage.textContent = 'Password is too weak. Use at least 6 characters with letters and numbers.';
                } else if (error.message.includes('email')) {
                    authMessage.textContent = 'Invalid email address. Please check and try again.';
                } else if (error.message.includes('user_already_exists') || error.code === 'user_already_exists') {
                    // Special handling for the case where user appears registered but doesn't exist in Supabase
                    authMessage.innerHTML = '<strong>Please try a different email address.</strong><br>' +
                                           'This email may have been used previously.';
                } else {
                    authMessage.textContent = error.message;
                }
            } else {
                authMessage.textContent = 'An error occurred during signup. Please try again.';
            }
            authMessage.style.color = 'red';
        }
    },
    
    // Logout function
    async logout() {
        try {
            utils.showLoading();
            
            if (!this.dbRef) {
                throw new Error('Database connection not available. Please refresh and try again.');
            }
            
            await this.dbRef.signOut();
            this.showLoginScreen();
            
            utils.hideLoading();
        } catch (error) {
            utils.hideLoading();
            console.error('Logout error:', error);
            utils.showAlert('An error occurred during logout. Please try again.', 'error');
        }
    }
};

// --- Today Button for Customer Bills ---
document.addEventListener('DOMContentLoaded', function() {
    const todayBtn = document.getElementById('bill-today-btn');
    const dateInput = document.getElementById('bill-date-filter');
    if (todayBtn && dateInput) {
        todayBtn.addEventListener('click', function() {
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            dateInput.value = `${yyyy}-${mm}-${dd}`;
            // Optionally, trigger search
            const searchBtn = document.getElementById('bill-search-btn');
            if (searchBtn) searchBtn.click();
        });
    }
});
