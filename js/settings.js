// Settings Management
const settingsManager = {
    settings: {
        name: '',
        phone: '',
        address: ''
    },
    
    // Initialize settings functionality
    init() {
        this.setupEventListeners();
        this.loadSettings();
    },
    
    // Setup event listeners for settings-related actions
    setupEventListeners() {
        // Save settings button
        const saveSettingsBtn = document.getElementById('save-settings-btn');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => {
                this.saveSettings();
            });
        }
    },
    
    // Load settings from the database
    async loadSettings() {
        try {
            const settings = await db.getSettings();
            
            // Update local settings object
            this.settings = {
                name: settings.name || '',
                phone: settings.phone || '',
                address: settings.address || ''
            };
            
            // Update form fields
            document.getElementById('shop-name').value = this.settings.name;
            document.getElementById('shop-phone').value = this.settings.phone;
            document.getElementById('shop-address').value = this.settings.address;
            
            return this.settings;
        } catch (error) {
            console.error('Error loading settings:', error);
            utils.showAlert('Failed to load settings. Please try again.', 'error');
            return this.settings;
        }
    },
    
    // Save settings to the database
    async saveSettings() {
        try {
            // Get form values
            const name = document.getElementById('shop-name').value.trim();
            const phone = document.getElementById('shop-phone').value.trim();
            const address = document.getElementById('shop-address').value.trim();
            
            utils.showLoading();
            
            // Update settings object
            this.settings = {
                name,
                phone,
                address
            };
            
            // Save to database
            const savedSettings = await db.saveSettings(this.settings);
            
            // Make sure we update the local settings object with what was actually saved
            if (savedSettings) {
                this.settings = savedSettings;
            }
            
            // Force a reload of the settings from the server to ensure consistency
            await this.loadSettings();
            
            utils.hideLoading();
            utils.showAlert('Settings saved successfully!', 'success');
        } catch (error) {
            utils.hideLoading();
            console.error('Error saving settings:', error);
            utils.showAlert('Failed to save settings. Please try again.', 'error');
        }
    }
};
