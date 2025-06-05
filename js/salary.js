// Salary Management
const salaryManager = {
    salaries: [],
    currentSalaryId: null,
    
    // Initialize salary functionality
    init() {
        this.setupEventListeners();
        this.loadSalaries();
    },
    
    // Setup event listeners for salary-related actions
    setupEventListeners() {
        // New salary button
        const newSalaryBtn = document.getElementById('new-salary-btn');
        if (newSalaryBtn) {
            newSalaryBtn.addEventListener('click', () => {
                this.showNewSalaryModal();
            });
        }
        
        // Save salary button
        const saveSalaryBtn = document.getElementById('save-salary-btn');
        if (saveSalaryBtn) {
            saveSalaryBtn.addEventListener('click', () => {
                this.saveSalary();
            });
        }
        
        // Search and clear buttons
        const salaryClearBtn = document.getElementById('salary-clear-btn');
        if (salaryClearBtn) {
            salaryClearBtn.addEventListener('click', () => {
                document.getElementById('salary-search').value = '';
                this.renderSalaryTable(this.salaries);
            });
        }
        
        // Salary search input
        const salarySearch = document.getElementById('salary-search');
        if (salarySearch) {
            salarySearch.addEventListener('input', () => {
                this.filterSalaries();
            });
        }
        
        // Delegate event for salary actions
        document.addEventListener('click', async (e) => {
            const target = e.target.closest('button');
            if (!target) return;

            // View salary history
            if (target.classList.contains('view-salary-history')) {
                const workerName = target.dataset.worker;
                this.viewSalaryHistory(workerName);
            }
            
            // Edit salary
            if (target.classList.contains('edit-salary')) {
                const salaryId = target.dataset.id;
                if (salaryId) {
                    this.editSalary(salaryId);
                }
            }
            
            // Delete salary
            if (target.classList.contains('delete-salary')) {
                const salaryId = target.dataset.id;
                if (salaryId) {
                    await this.confirmDeleteSalary(salaryId);
                }
            }
        });
    },
    
    // Load salaries from the database
    async loadSalaries() {
        try {
            utils.showLoading();
            
            this.salaries = await db.getSalaries();
            this.renderSalaryTable(this.salaries);
            
            // Update insights after loading salaries
            if (typeof insightsManager !== 'undefined') {
                insightsManager.updateInsights();
            }
            
            utils.hideLoading();
        } catch (error) {
            utils.hideLoading();
            console.error('Error loading salaries:', error);
            utils.showAlert('Failed to load salary data. Please try again.', 'error');
        }
    },
    
    // Render salaries in the table
    renderSalaryTable(salaries) {
        const tableBody = document.getElementById('salary-table-body');
        
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        if (salaries.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `<td colspan="5" class="text-center">No salary records found</td>`;
            tableBody.appendChild(emptyRow);
            return;
        }
        
        // Group salaries by worker name
        const workerSalaries = {};
        
        salaries.forEach(salary => {
            if (!workerSalaries[salary.worker_name]) {
                workerSalaries[salary.worker_name] = {
                    total: 0,
                    cashTotal: 0,
                    gpayTotal: 0,
                    lastPayment: null,
                    records: []
                };
            }
            
            workerSalaries[salary.worker_name].total += parseFloat(salary.amount) || 0;
            
            // Track payment mode totals
            if (salary.payment_mode === 'gpay') {
                workerSalaries[salary.worker_name].gpayTotal += parseFloat(salary.amount) || 0;
            } else {
                workerSalaries[salary.worker_name].cashTotal += parseFloat(salary.amount) || 0;
            }
            
            const paymentDate = new Date(salary.date);
            if (!workerSalaries[salary.worker_name].lastPayment || 
                paymentDate > new Date(workerSalaries[salary.worker_name].lastPayment)) {
                workerSalaries[salary.worker_name].lastPayment = salary.date;
            }
            
            workerSalaries[salary.worker_name].records.push(salary);
        });
        
        // Render worker summary rows
        Object.entries(workerSalaries).forEach(([workerName, data]) => {
            const tr = document.createElement('tr');
            
            tr.innerHTML = `
                <td>${workerName}</td>
                <td>${utils.formatCurrency(data.total)}</td>
                <td>${utils.formatDate(data.lastPayment)}</td>
                <td>
                    Cash: ${utils.formatCurrency(data.cashTotal)}<br>
                    GPay: ${utils.formatCurrency(data.gpayTotal)}
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon view-salary-history" data-worker="${workerName}">
                            <i data-feather="list"></i>
                        </button>
                        <button class="btn-icon edit-salary" data-id="${data.records[0].id}">
                            <i data-feather="edit-2"></i>
                        </button>
                        <button class="btn-icon danger delete-salary" data-id="${data.records[0].id}">
                            <i data-feather="trash-2"></i>
                        </button>
                    </div>
                </td>
            `;
            
            tableBody.appendChild(tr);
        });
        
        // Reinitialize Feather icons
        utils.initFeatherIcons();
    },
    
    // Show new salary modal
    showNewSalaryModal() {
        // Reset the form
        document.getElementById('new-salary-form').reset();
        
        // Set default date to today
        document.getElementById('salary-date').value = utils.getCurrentDate();
        
        // Show the modal
        utils.showModal('new-salary-modal');
    },
    
    // Save a new salary record
    async saveSalary() {
        try {
            // Validate the form
            const workerName = document.getElementById('worker-name').value.trim();
            const amountInput = document.getElementById('salary-amount').value.trim();
            const date = document.getElementById('salary-date').value;
            // We'll ignore payment mode for now
            
            // Better form validation
            let valid = true;
            
            if (!workerName) {
                utils.showAlert('Please enter worker name.', 'error');
                valid = false;
            }
            
            if (!date) {
                utils.showAlert('Please select a date.', 'error');
                valid = false;
            }
            
            // Special validation for amount - must be a positive number
            const amount = parseFloat(amountInput);
            if (!amountInput || isNaN(amount) || amount <= 0) {
                utils.showAlert('Please enter a valid positive amount.', 'error');
                valid = false;
            }
            
            if (!valid) return;
            
            utils.showLoading();
            
            // Create salary object
            const salary = {
                worker_name: workerName,
                amount: parseFloat(amount),
                date,
                notes: '',  // this field exists in the database
                // We'll modify the supabase.js method to omit payment_mode since the column doesn't exist yet
            };
            
            // Save to database
            const savedSalary = await db.createSalary(salary);
            
            // Add to local array and update table
            this.salaries.unshift(savedSalary);
            this.renderSalaryTable(this.salaries);
            
            // Hide modal
            utils.hideModal('new-salary-modal');
            
            // Update insights
            if (typeof insightsManager !== 'undefined') {
                insightsManager.updateInsights();
            }
            
            utils.hideLoading();
            utils.showAlert('Salary record added successfully!', 'success');
        } catch (error) {
            utils.hideLoading();
            console.error('Error saving salary:', error);
            utils.showAlert('Failed to add salary record. Please try again.', 'error');
        }
    },
    
    // Filter salaries based on search
    filterSalaries() {
        const searchText = document.getElementById('salary-search').value.trim().toLowerCase();
        
        if (!searchText) {
            this.renderSalaryTable(this.salaries);
            return;
        }
        
        // Filter salaries by worker name
        const filteredSalaries = this.salaries.filter(salary => {
            return salary.worker_name.toLowerCase().includes(searchText);
        });
        
        this.renderSalaryTable(filteredSalaries);
    },
    
    // View salary history for a worker
    viewSalaryHistory(workerName) {
        try {
            console.log("Starting to display salary history for:", workerName);
            
            // Filter salaries for this worker
            const workerSalaries = this.salaries.filter(salary => 
                salary.worker_name === workerName
            );
            
            console.log("Worker salaries found:", workerSalaries.length);
            
            if (workerSalaries.length === 0) {
                utils.showAlert('No salary records found for this worker.', 'error');
                return;
            }
            
            // Sort by date, newest first
            workerSalaries.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            // Calculate total
            const totalAmount = workerSalaries.reduce(
                (total, salary) => total + parseFloat(salary.amount), 0
            );
            
            console.log("Total amount calculated:", totalAmount);
            
            // First check for and remove any existing modal
            const existingModal = document.getElementById('salary-history-modal');
            if (existingModal) {
                console.log("Removing existing modal");
                existingModal.remove();
            }
            
            // Generate history HTML
            const historyHtml = workerSalaries.map(salary => `
                <tr>
                    <td>${utils.formatDate(salary.date)}</td>
                    <td>${utils.formatCurrency(salary.amount)}</td>
                    <td>${salary.payment_mode === 'gpay' ? 'Google Pay' : 'Cash'}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-icon edit-salary" data-id="${salary.id}" title="Edit">
                                <i data-feather="edit-2"></i>
                            </button>
                            <button class="btn-icon danger delete-salary" data-id="${salary.id}" title="Delete">
                                <i data-feather="trash-2"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
            
            console.log("History HTML generated");
            
            // Create modal HTML directly - a more reliable approach
            const modalHTML = `
            <div id="salary-history-modal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2><i data-feather="dollar-sign"></i> ${workerName}'s Salary History</h2>
                        <span class="close-modal">&times;</span>
                    </div>
                    <div class="modal-body">
                        <div class="salary-summary">
                            <h3>Total Paid: ${utils.formatCurrency(totalAmount)}</h3>
                        </div>
                        <div class="table-container">
                            <table class="salary-history-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Amount</th>
                                        <th>Payment Mode</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${historyHtml}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn-secondary close-modal-btn">Close</button>
                    </div>
                </div>
            </div>`;
            
            // Insert modal into DOM
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            
            // Get the modal element
            const modal = document.getElementById('salary-history-modal');
            
            // Setup event listeners
            modal.addEventListener('click', async (e) => {
                const target = e.target.closest('button');
                if (!target) return;
                
                // Close modal buttons
                if (target.classList.contains('close-modal-btn') || target.classList.contains('close-modal')) {
                    modal.classList.remove('show');
                    document.body.style.overflow = 'auto';
                    return;
                }
                
                // Edit salary
                if (target.classList.contains('edit-salary')) {
                    const salaryId = target.dataset.id;
                    if (salaryId) {
                        modal.classList.remove('show');
                        document.body.style.overflow = 'auto';
                        await this.editSalary(salaryId);
                    }
                }
                
                // Delete salary
                if (target.classList.contains('delete-salary')) {
                    const salaryId = target.dataset.id;
                    if (salaryId) {
                        await this.confirmDeleteSalary(salaryId);
                        modal.classList.remove('show');
                        document.body.style.overflow = 'auto';
                    }
                }
            });
            
            // Show modal
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
            
            // Initialize Feather icons
            utils.initFeatherIcons();
            
            console.log("Salary history modal displayed successfully");
            
        } catch (error) {
            console.error('Error displaying salary history:', error);
            utils.showAlert('Failed to display salary history. Please try again.', 'error');
        }
    },
    
    // Edit a salary record
    async editSalary(salaryId) {
        try {
            utils.showLoading();
            
            // Find the salary in local array
            const salary = this.salaries.find(s => s.id.toString() === salaryId.toString());
            
            if (!salary) {
                throw new Error('Salary record not found');
            }
            
            // Create and show edit modal
            const modalHtml = `
                <div id="edit-salary-modal" class="modal">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h2><i data-feather="edit"></i> Edit Salary Record</h2>
                            <span class="close-modal">&times;</span>
                        </div>
                        <div class="modal-body">
                            <form id="edit-salary-form">
                                <div class="form-group">
                                    <label for="edit-worker-name">Worker Name</label>
                                    <input type="text" id="edit-worker-name" value="${salary.worker_name}" required>
                                </div>
                                <div class="form-group">
                                    <label for="edit-salary-amount">Amount</label>
                                    <input type="number" id="edit-salary-amount" min="0" step="0.01" value="${salary.amount}" required>
                                </div>
                                <div class="form-group">
                                    <label for="edit-salary-date">Date</label>
                                    <input type="date" id="edit-salary-date" value="${utils.formatInputDate(salary.date)}" required>
                                </div>
                                <div class="form-group">
                                    <label for="edit-salary-payment-mode">Payment Mode</label>
                                    <select id="edit-salary-payment-mode" required>
                                        <option value="cash" ${salary.payment_mode === 'cash' ? 'selected' : ''}>Cash</option>
                                        <option value="gpay" ${salary.payment_mode === 'gpay' ? 'selected' : ''}>Google Pay</option>
                                    </select>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn-secondary close-modal-btn">Cancel</button>
                            <button type="button" class="btn-primary" id="update-salary-btn">Update</button>
                        </div>
                    </div>
                </div>`;
            
            // Remove existing modal if any
            const existingModal = document.getElementById('edit-salary-modal');
            if (existingModal) {
                existingModal.remove();
            }
            
            // Add new modal to DOM
            document.body.insertAdjacentHTML('beforeend', modalHtml);
            
            // Show modal
            const modal = document.getElementById('edit-salary-modal');
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
            
            // Setup close buttons
            const closeButtons = modal.querySelectorAll('.close-modal, .close-modal-btn');
            closeButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    modal.classList.remove('show');
                    document.body.style.overflow = 'auto';
                });
            });
            
            // Setup update button
            const updateBtn = document.getElementById('update-salary-btn');
            updateBtn.addEventListener('click', async () => {
                const updatedSalary = {
                    id: salary.id,
                    worker_name: document.getElementById('edit-worker-name').value,
                    amount: parseFloat(document.getElementById('edit-salary-amount').value),
                    date: document.getElementById('edit-salary-date').value,
                    payment_mode: document.getElementById('edit-salary-payment-mode').value
                };
                
                try {
                    utils.showLoading();
                    
                    // Update in database
                    await db.updateSalary(updatedSalary);
                    
                    // Update in local array
                    const index = this.salaries.findIndex(s => s.id.toString() === salary.id.toString());
                    if (index !== -1) {
                        this.salaries[index] = updatedSalary;
                    }
                    
                    // Refresh table
                    this.renderSalaryTable(this.salaries);
                    
                    // Close modal
                    modal.classList.remove('show');
                    document.body.style.overflow = 'auto';
                    
                    utils.hideLoading();
                    utils.showAlert('Salary record updated successfully!', 'success');
                    
                } catch (error) {
                    utils.hideLoading();
                    console.error('Error updating salary:', error);
                    utils.showAlert('Failed to update salary record. Please try again.', 'error');
                }
            });
            
            // Initialize Feather icons
            utils.initFeatherIcons();
            utils.hideLoading();
            
        } catch (error) {
            utils.hideLoading();
            console.error('Error editing salary:', error);
            utils.showAlert('Failed to load salary details. Please try again.', 'error');
        }
    },
    
    // Update a salary record
    async updateSalary() {
        try {
            // Validate the form
            const workerName = document.getElementById('edit-worker-name').value.trim();
            const amountInput = document.getElementById('edit-salary-amount').value.trim();
            const date = document.getElementById('edit-salary-date').value;
            // We'll ignore payment mode for now
            
            // Better form validation
            let valid = true;
            
            if (!workerName) {
                utils.showAlert('Please enter worker name.', 'error');
                valid = false;
            }
            
            if (!date) {
                utils.showAlert('Please select a date.', 'error');
                valid = false;
            }
            
            // Special validation for amount - must be a positive number
            const amount = parseFloat(amountInput);
            if (!amountInput || isNaN(amount) || amount <= 0) {
                utils.showAlert('Please enter a valid positive amount.', 'error');
                valid = false;
            }
            
            if (!valid) return;
            
            utils.showLoading();
            
            // Create salary object
            const salary = {
                id: this.currentSalaryId,
                worker_name: workerName,
                amount: parseFloat(amount),
                date,
                notes: ''  // this field exists in the database
                // We'll modify the supabase.js method to omit payment_mode 
            };
            
            // Update in database
            await db.updateSalary(salary);
            
            // Update in local array
            const index = this.salaries.findIndex(s => s.id.toString() === this.currentSalaryId.toString());
            if (index !== -1) {
                this.salaries[index] = salary;
            }
            
            // Update table
            this.renderSalaryTable(this.salaries);
            
            // Hide modal
            utils.hideModal('edit-salary-modal');
            
            // If salary history modal is open, update it
            if (document.getElementById('salary-history-modal') && 
                document.getElementById('salary-history-modal').style.display === 'flex') {
                this.viewSalaryHistory(workerName);
            }
            
            // Reset current salary ID
            this.currentSalaryId = null;
            
            // Update insights
            if (typeof insightsManager !== 'undefined') {
                insightsManager.updateInsights();
            }
            
            utils.hideLoading();
            utils.showAlert('Salary record updated successfully!', 'success');
        } catch (error) {
            utils.hideLoading();
            console.error('Error updating salary:', error);
            utils.showAlert('Failed to update salary record. Please try again.', 'error');
            this.currentSalaryId = null;
        }
    },
    
    // Delete a salary record
    async confirmDeleteSalary(salaryId) {
        try {
            if (!salaryId) {
                throw new Error('Invalid salary ID');
            }

            // Show confirmation dialog
            const confirmed = await utils.showConfirmDialog(
                'Delete Salary',
                'Are you sure you want to delete this salary record? This action cannot be undone.',
                'Delete',
                'Cancel'
            );

            if (!confirmed) return;

            utils.showLoading();
            
            // Delete from database
            await db.deleteSalary(salaryId);
            
            // Remove from local array
            this.salaries = this.salaries.filter(salary => salary.id !== salaryId);
            
            // Update table
            this.renderSalaryTable(this.salaries);
            
            // Update insights if available
            if (typeof insightsManager !== 'undefined') {
                insightsManager.updateInsights();
            }
            
            utils.hideLoading();
            utils.showAlert('Salary record deleted successfully.', 'success');
        } catch (error) {
            utils.hideLoading();
            console.error('Error deleting salary:', error);
            utils.showAlert('Failed to delete salary record. Please try again.', 'error');
        }
    },
    
    // Prepare to delete a salary record
    deleteSalary(salaryId) {
        this.confirmDeleteSalary(salaryId);
    },
};
