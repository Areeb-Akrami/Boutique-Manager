// Dupatta Orders Manager
const dupattas = {
    // Array to store loaded dupattas
    dupattas: [],
    
    // Current dupatta for edit/delete operations
    currentDupattaId: null,
    
    // Flag to track listener setup
    listenersInitialized: false,
    
    // Initialize the dupattas section
    init() {
        // Setup event listeners
        this.setupEventListeners();
        
        // Load initial data
        this.loadDupattas();
    },
    
    // Setup event listeners for dupattas section
    setupEventListeners() {
        // Prevent adding listeners multiple times
        if (this.listenersInitialized) {
            console.log('Dupatta listeners already initialized. Skipping setup.');
            return;
        }
        console.log('Initializing dupatta listeners...');
        
        // New dupatta button
        document.getElementById('new-dupatta-btn').addEventListener('click', () => {
            this.showNewDupattaModal();
        });
        
        // Search button
        document.getElementById('dupatta-search-btn').addEventListener('click', () => {
            this.filterDupattas();
        });
        
        // Clear button
        document.getElementById('dupatta-clear-btn').addEventListener('click', () => {
            document.getElementById('dupatta-search').value = '';
            document.getElementById('dupatta-date-filter').value = '';
            document.getElementById('dupatta-status-filter').value = 'all';
            this.filterDupattas();
        });
        
        // New dupatta form submission
        const newDupattaForm = document.getElementById('new-dupatta-form');
        if (newDupattaForm) { // Add check if form exists
            newDupattaForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const formElement = e.currentTarget; // Get the form itself
                this.saveDupatta(formElement); // Pass the form element to saveDupatta
            });
        } else {
            console.error("Element with ID 'new-dupatta-form' not found.");
        }
        
        // Edit dupatta form submission
        const editDupattaForm = document.getElementById('edit-dupatta-form');
        if (editDupattaForm) {
             editDupattaForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const formElement = e.currentTarget; // Get the form itself
                this.updateDupatta(formElement); // Pass the form element to updateDupatta
             });
        } else {
             console.error("Element with ID 'edit-dupatta-form' not found.");
        }
        
        // Delete confirmation
        document.getElementById('delete-dupatta-confirm-btn').addEventListener('click', () => {
            this.confirmDeleteDupatta();
        });
        
        // Set the flag to true after successfully adding listeners
        this.listenersInitialized = true;
        console.log('Dupatta listeners initialized.');
    },
    
    // Load dupattas from database
    async loadDupattas() {
        try {
            utils.showLoading();
            
            // Fetch dupattas from API
            this.dupattas = await db.getDupattas();
            
            // Render the table
            this.renderDupattasTable(this.dupattas);
            
            utils.hideLoading();
        } catch (error) {
            utils.hideLoading();
            console.error('Error loading dupattas:', error);
            utils.showAlert('Failed to load dupatta orders. Please try again.', 'error');
        }
    },
    
    // Render the dupattas table with data
    renderDupattasTable(dupattas) {
        const tableBody = document.getElementById('dupatta-table-body');
        tableBody.innerHTML = '';
        
        let totalAmount = 0;
        
        if (dupattas.length === 0) {
            // If no dupattas, display a message
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="no-data-message">No dupatta orders found</td>
                </tr>
            `;
        } else {
            // Render each dupatta
            dupattas.forEach(dupatta => {
                const row = document.createElement('tr');
                
                // Status class for styling
                let statusClass = '';
                switch (dupatta.status) {
                    case 'pending':
                        statusClass = 'status-pending';
                        break;
                    case 'completed':
                        statusClass = 'status-completed';
                        break;
                    case 'cancelled':
                        statusClass = 'status-cancelled';
                        break;
                }
                
                // Calculate total amount
                totalAmount += dupatta.amount || 0;
                
                row.innerHTML = `
                    <td>${dupatta.order_number || ''}</td>
                    <td>${dupatta.customer_name || 'N/A'}</td>
                    <td>${dupatta.customer_phone || 'N/A'}</td>
                    <td>${utils.formatCurrency(dupatta.amount)}</td>
                    <td>${utils.formatDisplayDate(dupatta.order_date)}</td>
                    <td>${utils.formatDisplayDate(dupatta.delivery_date)}</td>
                    <td class="${statusClass}">${dupatta.status ? utils.capitalizeWords(dupatta.status) : 'Unknown'}</td>
                    <td>${dupatta.payment_mode ? utils.capitalizeWords(dupatta.payment_mode) : 'Cash'}</td>
                    <td>
                        <button class="btn-icon edit-dupatta-btn" data-id="${dupatta.id}">
                            <i data-feather="edit"></i>
                        </button>
                        <button class="btn-icon delete-dupatta-btn" data-id="${dupatta.id}">
                            <i data-feather="trash"></i>
                        </button>
                    </td>
                `;
                
                tableBody.appendChild(row);
            });
            
            // Add event listeners to edit and delete buttons
            document.querySelectorAll('.edit-dupatta-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.editDupatta(btn.dataset.id);
                });
            });
            
            document.querySelectorAll('.delete-dupatta-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.deleteDupatta(btn.dataset.id);
                });
            });
        }
        
        // Update total amount display
        document.getElementById('dupatta-total-amount').textContent = utils.formatCurrency(totalAmount);
        
        // Reinitialize Feather icons
        utils.initFeatherIcons();
    },
    
    // Show modal for creating a new dupatta order
    showNewDupattaModal() {
        // Reset form
        document.getElementById('new-dupatta-form').reset();
        
        // Set default dates
        document.getElementById('dupatta-order-date').value = utils.getCurrentDate();
        document.getElementById('dupatta-delivery-date').value = '';
        
        // Show modal
        utils.showModal('new-dupatta-modal');
    },
    
    // Save a new dupatta order
    async saveDupatta(formElement) {
        try {
            if (!formElement) {
                throw new Error('Form element not found');
            }

            utils.showLoading();
            
            // Get form values
            const formData = {
                order_number: formElement.querySelector('#dupatta-order-number').value.trim(),
                customer_name: formElement.querySelector('#dupatta-customer-name').value.trim(),
                customer_phone: formElement.querySelector('#dupatta-customer-phone').value.trim(),
                amount: parseFloat(formElement.querySelector('#dupatta-amount').value) || 0,
                order_date: formElement.querySelector('#dupatta-order-date').value,
                delivery_date: formElement.querySelector('#dupatta-delivery-date').value,
                status: formElement.querySelector('#dupatta-status').value,
                payment_mode: formElement.querySelector('#dupatta-payment-mode').value
            };

            // Validate required fields
            // Customer name is now optional, so no validation here
            
            if (!formData.order_date) {
                throw new Error('Order date is required');
            }

            if (!formData.amount || formData.amount <= 0) {
                throw new Error('Please enter a valid amount');
            }

            // Save to database
            const dupatta = await db.saveDupatta(formData);
            
            // Add to local array
            this.dupattas.push(dupatta);
            
            // Update table
            this.renderDupattasTable(this.dupattas);
            
            // Reset form
            formElement.reset();
            
            // Close modal
            utils.hideModal('new-dupatta-modal');
            
            utils.hideLoading();
            utils.showAlert('Dupatta order created successfully!', 'success');
            
        } catch (error) {
            utils.hideLoading();
            console.error('Error saving dupatta:', error);
            utils.showAlert(error.message || 'Failed to create dupatta order. Please try again.', 'error');
        }
    },
    
    // Filter dupattas based on search criteria
    filterDupattas() {
        const searchText = document.getElementById('dupatta-search').value.toLowerCase();
        const dateFilter = document.getElementById('dupatta-date-filter').value;
        const statusFilter = document.getElementById('dupatta-status-filter').value;
        
        // Filter dupattas
        const filteredDupattas = this.dupattas.filter(dupatta => {
            // Search text filter
            const textMatch = !searchText || 
                dupatta.id.toString().includes(searchText) ||
                (dupatta.order_number && dupatta.order_number.toLowerCase().includes(searchText)) ||
                (dupatta.customer_name && dupatta.customer_name.toLowerCase().includes(searchText)) ||
                (dupatta.customer_phone && dupatta.customer_phone.toLowerCase().includes(searchText));
            
            // Date filter
            const dateMatch = !dateFilter || dupatta.order_date === dateFilter;
            
            // Status filter
            const statusMatch = statusFilter === 'all' || dupatta.status === statusFilter;
            
            return textMatch && dateMatch && statusMatch;
        });
        
        this.renderDupattasTable(filteredDupattas);
    },
    
    // Edit a dupatta order
    async editDupatta(dupattaId) {
        try {
            utils.showLoading();
            
            // Find the dupatta in local array first
            let dupatta = this.dupattas.find(d => d.id.toString() === dupattaId.toString());
            
            // If not found (e.g. after page refresh), fetch from database
            if (!dupatta) {
                dupatta = await db.getDupatta(dupattaId);
            }
            
            if (!dupatta) {
                throw new Error('Dupatta order not found');
            }
            
            // Store current dupatta ID for update operation
            this.currentDupattaId = dupatta.id;
            
            // Populate form fields
            document.getElementById('edit-dupatta-id').value = dupatta.id;
            document.getElementById('edit-dupatta-order-number').value = dupatta.order_number || '';
            document.getElementById('edit-dupatta-customer-name').value = dupatta.customer_name || '';
            document.getElementById('edit-dupatta-customer-phone').value = dupatta.customer_phone || '';
            document.getElementById('edit-dupatta-order-date').value = utils.formatInputDate(dupatta.order_date);
            document.getElementById('edit-dupatta-delivery-date').value = utils.formatInputDate(dupatta.delivery_date);
            document.getElementById('edit-dupatta-status').value = dupatta.status;
            document.getElementById('edit-dupatta-payment-mode').value = dupatta.payment_mode || 'cash';
            document.getElementById('edit-dupatta-amount').value = dupatta.amount;
            document.getElementById('edit-dupatta-details').value = dupatta.details || '';
            
            // Show the modal
            utils.showModal('edit-dupatta-modal');
            
            utils.hideLoading();
        } catch (error) {
            utils.hideLoading();
            console.error('Error editing dupatta order:', error);
            utils.showAlert('Failed to load dupatta order details. Please try again.', 'error');
        }
    },
    
    // Update a dupatta order
    async updateDupatta(formElement) {
        try {
            if (!formElement) {
                throw new Error('Form element not found');
            }

            utils.showLoading();
            
            // Get form values
            const formData = {
                id: this.currentDupattaId,
                order_number: formElement.querySelector('#edit-dupatta-order-number').value.trim(),
                customer_name: formElement.querySelector('#edit-dupatta-customer-name').value.trim(),
                customer_phone: formElement.querySelector('#edit-dupatta-customer-phone').value.trim(),
                amount: parseFloat(formElement.querySelector('#edit-dupatta-amount').value) || 0,
                order_date: formElement.querySelector('#edit-dupatta-order-date').value,
                delivery_date: formElement.querySelector('#edit-dupatta-delivery-date').value,
                status: formElement.querySelector('#edit-dupatta-status').value,
                payment_mode: formElement.querySelector('#edit-dupatta-payment-mode').value
            };

            // Validate required fields
            if (!formData.customer_name) {
                throw new Error('Customer name is required');
            }

            if (!formData.order_date) {
                throw new Error('Order date is required');
            }

            if (!formData.amount || formData.amount <= 0) {
                throw new Error('Please enter a valid amount');
            }

            // Update in database
            await db.updateDupatta(formData);
            
            // Update local array
            this.dupattas = this.dupattas.map(dupatta => 
                dupatta.id === formData.id ? { ...dupatta, ...formData } : dupatta
            );
            
            // Update table
            this.renderDupattasTable(this.dupattas);
            
            // Reset form
            formElement.reset();
            
            // Close modal
            utils.hideModal('edit-dupatta-modal');
            
            // Reset current ID
            this.currentDupattaId = null;
            
            utils.hideLoading();
            utils.showAlert('Dupatta order updated successfully!', 'success');
            
        } catch (error) {
            utils.hideLoading();
            console.error('Error updating dupatta:', error);
            utils.showAlert(error.message || 'Failed to update dupatta order. Please try again.', 'error');
        }
    },
    
    // Prepare to delete a dupatta order
    deleteDupatta(dupattaId) {
        this.currentDupattaId = dupattaId;
        
        // Set confirmation message
        document.getElementById('delete-dupatta-confirm-message').textContent = 
            `Are you sure you want to delete this dupatta order? This action cannot be undone.`;
        
        // Show confirmation modal
        utils.showModal('delete-dupatta-confirm-modal');
    },
    
    // Confirm and process dupatta order deletion
    async confirmDeleteDupatta() {
        if (!this.currentDupattaId) return;
        
        try {
            utils.showLoading();
            
            // Delete from database
            await db.deleteDupatta(this.currentDupattaId);
            
            // Remove from local array safely
            const dupattaIdToDelete = this.currentDupattaId.toString(); // Ensure ID to delete is a string
            this.dupattas = this.dupattas.filter(dupatta => {
                // Check if dupatta and dupatta.id exist before comparing
                return dupatta && dupatta.id && dupatta.id.toString() !== dupattaIdToDelete;
            });
            
            // Update table
            this.renderDupattasTable(this.dupattas);
            
            // Hide modal
            utils.hideModal('delete-dupatta-confirm-modal');
            
            // Reset current dupatta ID
            this.currentDupattaId = null;
            
            // Update insights
            if (typeof insightsManager !== 'undefined') {
                insightsManager.updateInsights();
            }
            
            utils.hideLoading();
            utils.showAlert('Dupatta order deleted successfully!', 'success');
        } catch (error) {
            utils.hideLoading();
            console.error('Error deleting dupatta order:', error);
            utils.showAlert('Failed to delete dupatta order. Please try again.', 'error');
            this.currentDupattaId = null;
        }
    }
};