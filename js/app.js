// Main application script
const app = {
    // Initialize the application
    init() {
        // Set initial active section based on URL or default to customer bills
        const initialSection = utils.getQueryParam('section') || 'customer-bills';
        utils.setActiveSection(`${initialSection}-section`);
        
        // Initialize UI components
        this.setupEventListeners();
        this.loadInitialData();
        utils.initFeatherIcons();
        
        // Initialize dupattas manager
        dupattas.init();
    },
    
    // Setup event listeners
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            if (btn.dataset.section) {
                btn.addEventListener('click', () => {
                    utils.setActiveSection(`${btn.dataset.section}-section`);
                });
            }
        });
        
        // Close modal buttons using event delegation for dynamic modals
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('close-modal') || e.target.classList.contains('close-modal-btn')) {
                const modal = e.target.closest('.modal');
                if (modal) {
                    console.log('[Modal] Closed by close button:', modal.id);
                    modal.classList.remove('show');
                    document.body.style.overflow = 'auto';
                }
            }
            // Click outside modal-content closes modal
            if (e.target.classList.contains('modal') && e.target.classList.contains('show')) {
                console.log('[Modal] Closed by clicking outside:', e.target.id);
                e.target.classList.remove('show');
                document.body.style.overflow = 'auto';
            }
        });
        
        // When clicked outside modal content, close the modal
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    utils.hideModal(modal.id);
                }
            });
        });
        
        // Initialize section-specific event listeners
        if (typeof billsManager !== 'undefined') billsManager.setupEventListeners();
        if (typeof expensesManager !== 'undefined') expensesManager.setupEventListeners();
        if (typeof salaryManager !== 'undefined') salaryManager.setupEventListeners();
        if (typeof settingsManager !== 'undefined') settingsManager.setupEventListeners();
        if (typeof insightsManager !== 'undefined') insightsManager.setupEventListeners();
        // Ensure export dropdown works after navigation
        if (typeof insightsManager !== 'undefined' && typeof insightsManager.init === 'function') {
            insightsManager.init();
        }
        if (typeof dupattas !== 'undefined') dupattas.setupEventListeners();
    },
    
    // Load initial data for all sections
    async loadInitialData() {
        try {
            utils.showLoading();
            
            // Load settings first
            await settingsManager.loadSettings();
            
            // Load data for each section
            await Promise.all([
                billsManager.loadBills(),
                expensesManager.loadExpenses(),
                salaryManager.loadSalaries(),
                insightsManager.loadInsights(),
                dupattas.loadDupattas()
            ]);
            
            utils.hideLoading();
        } catch (error) {
            utils.hideLoading();
            console.error('Error loading initial data:', error);
            utils.showAlert('Failed to load data. Please refresh the page.', 'error');
        }
    }
};

// Initialize the auth system when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('[Debug] DOMContentLoaded fired');
    // Fix for Supabase CDN loading - if it's not loaded yet, wait for it
    if (typeof supabase === 'undefined') {
        const checkSupabase = setInterval(() => {
            if (typeof supabase !== 'undefined') {
                clearInterval(checkSupabase);
                // Pass the db reference to auth module
                auth.setDb(db);
                auth.init();
            }
        }, 100);
        
        // Timeout after 10 seconds
        setTimeout(() => {
            clearInterval(checkSupabase);
            console.error('Supabase client failed to load');
            document.getElementById('login-message').innerHTML = 'Failed to connect to database.<br>Please refresh the page or try again later.';
            document.getElementById('login-message').style.color = 'red';
        }, 10000);
    } else {
        // Pass the db reference to auth module
        auth.setDb(db);
        auth.init();
    }

    // Initialize Feather icons
    utils.initFeatherIcons();

    // Setup keyboard shortcuts
    window.addEventListener('keydown', (e) => {
        // Escape key closes modals
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.show').forEach(modal => {
                console.log('[Modal] Closed by Escape key:', modal.id);
                utils.hideModal(modal.id);
            });
        }
    });
});

// Handle browser back/forward buttons
window.addEventListener('popstate', () => {
    const section = utils.getQueryParam('section') || 'customer-bills';
    utils.setActiveSection(`${section}-section`);
});

// Add debug logs for beforeunload and DOMContentLoaded
window.addEventListener('beforeunload', function() {
    console.log('[Debug] Window is unloading (refresh or navigation)');
});
