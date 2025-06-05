// Expenses Management
const expensesManager = {
    expenses: [],
    currentExpenseId: null,
    
    // Initialize expenses functionality
    init() {
        this.setupEventListeners();
        this.loadExpenses();
    },
    
    // Setup event listeners for expense-related actions
    setupEventListeners() {
        // New expense button
        const newExpenseBtn = document.getElementById('new-expense-btn');
        if (newExpenseBtn) {
            newExpenseBtn.addEventListener('click', () => {
                this.showNewExpenseModal();
            });
        }
        
        // Save expense button
        const saveExpenseBtn = document.getElementById('save-expense-btn');
        if (saveExpenseBtn) {
            saveExpenseBtn.addEventListener('click', () => {
                this.saveExpense();
            });
        }
        
        // Expense search button
        const expenseSearchBtn = document.getElementById('expense-search-btn');
        if (expenseSearchBtn) {
            expenseSearchBtn.addEventListener('click', () => {
                this.filterExpenses();
            });
        }
        
        // Expense clear button
        const expenseClearBtn = document.getElementById('expense-clear-btn');
        if (expenseClearBtn) {
            expenseClearBtn.addEventListener('click', () => {
                document.getElementById('expense-search').value = '';
                document.getElementById('expense-date-filter').value = '';
                this.renderExpensesTable(this.expenses);
            });
        }
        
        // Delegate event for expense actions
        document.addEventListener('click', (e) => {
            // Edit expense
            if (e.target.closest('.edit-expense')) {
                const btn = e.target.closest('.edit-expense');
                const expenseId = btn.dataset.id;
                this.editExpense(expenseId);
            }
            
            // Delete expense
            if (e.target.closest('.delete-expense')) {
                const btn = e.target.closest('.delete-expense');
                const expenseId = btn.dataset.id;
                this.deleteExpense(expenseId);
            }
        });
    },
    
    // Load expenses from the database
    async loadExpenses() {
        try {
            utils.showLoading();
            
            this.expenses = await db.getExpenses();
            this.renderExpensesTable(this.expenses);
            
            // Update insights after loading expenses
            if (typeof insightsManager !== 'undefined') {
                insightsManager.updateInsights();
            }
            
            utils.hideLoading();
        } catch (error) {
            utils.hideLoading();
            console.error('Error loading expenses:', error);
            utils.showAlert('Failed to load expenses. Please try again.', 'error');
        }
    },
    
    // Render expenses in the table
    renderExpensesTable(expenses) {
        const tableBody = document.getElementById('expense-table-body');
        
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        if (expenses.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `<td colspan="4" class="text-center">No expenses found</td>`;
            tableBody.appendChild(emptyRow);
            
            document.getElementById('expense-total-amount').textContent = utils.formatCurrency(0);
            return;
        }
        
        let totalAmount = 0;
        
        expenses.forEach(expense => {
            const tr = document.createElement('tr');
            
            tr.innerHTML = `
                <td>${expense.description}</td>
                <td>${utils.formatCurrency(expense.amount)}</td>
                <td>${utils.formatDate(expense.date)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon edit-expense" data-id="${expense.id}">
                            <i data-feather="edit"></i>
                        </button>
                        <button class="btn-icon danger delete-expense" data-id="${expense.id}">
                            <i data-feather="trash-2"></i>
                        </button>
                    </div>
                </td>
            `;
            
            tableBody.appendChild(tr);
            totalAmount += parseFloat(expense.amount) || 0;
        });
        
        // Update total amount
        document.getElementById('expense-total-amount').textContent = utils.formatCurrency(totalAmount);
        
        // Reinitialize Feather icons
        utils.initFeatherIcons();
    },
    
    // Show new expense modal
    showNewExpenseModal() {
        // Reset the form
        document.getElementById('new-expense-form').reset();
        
        // Set default date to today
        document.getElementById('expense-date').value = utils.getCurrentDate();
        
        // Show the modal
        utils.showModal('new-expense-modal');
    },
    
    // Save a new expense
    async saveExpense() {
        try {
            // Validate the form
            const description = document.getElementById('expense-description').value.trim();
            const amount = document.getElementById('expense-amount').value;
            const date = document.getElementById('expense-date').value;
            
            if (!description || !amount || !date) {
                utils.showAlert('Please fill in all required fields.', 'error');
                return;
            }
            
            utils.showLoading();
            
            // Create expense object
            const expense = {
                description,
                amount: parseFloat(amount),
                date
            };
            
            // Save to database
            const savedExpense = await db.createExpense(expense);
            
            // Add to local array and update table
            this.expenses.unshift(savedExpense);
            this.renderExpensesTable(this.expenses);
            
            // Hide modal
            utils.hideModal('new-expense-modal');
            
            // Update insights
            if (typeof insightsManager !== 'undefined') {
                insightsManager.updateInsights();
            }
            
            utils.hideLoading();
            utils.showAlert('Expense added successfully!', 'success');
        } catch (error) {
            utils.hideLoading();
            console.error('Error saving expense:', error);
            utils.showAlert('Failed to add expense. Please try again.', 'error');
        }
    },
    
    // Filter expenses based on search and date
    filterExpenses() {
        const searchText = document.getElementById('expense-search').value.trim().toLowerCase();
        const dateFilter = document.getElementById('expense-date-filter').value;
        
        // Reset if all filters are empty
        if (!searchText && !dateFilter) {
            this.renderExpensesTable(this.expenses);
            return;
        }
        
        // Filter expenses
        const filteredExpenses = this.expenses.filter(expense => {
            // Search text filter
            const textMatch = !searchText || 
                expense.description.toLowerCase().includes(searchText);
            
            // Date filter
            const dateMatch = !dateFilter || expense.date === dateFilter;
            
            return textMatch && dateMatch;
        });
        
        this.renderExpensesTable(filteredExpenses);
    },
    
    // Edit an expense
    async editExpense(expenseId) {
        try {
            // Find the expense in local array
            const expense = this.expenses.find(e => e.id.toString() === expenseId.toString());
            
            if (!expense) {
                throw new Error('Expense not found');
            }
            
            // Store current expense ID for update operation
            this.currentExpenseId = expense.id;
            
            // Create and show a modal for editing expense
            const modalHtml = `
                <div id="edit-expense-modal" class="modal">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h2><i data-feather="edit"></i> Edit Expense</h2>
                            <span class="close-modal">&times;</span>
                        </div>
                        <div class="modal-body">
                            <form id="edit-expense-form">
                                <div class="form-group">
                                    <label for="edit-expense-description">Description</label>
                                    <input type="text" id="edit-expense-description" value="${expense.description}" required>
                                </div>
                                <div class="form-group">
                                    <label for="edit-expense-amount">Amount</label>
                                    <input type="number" id="edit-expense-amount" min="0" step="0.01" value="${expense.amount}" required>
                                </div>
                                <div class="form-group">
                                    <label for="edit-expense-date">Date</label>
                                    <input type="date" id="edit-expense-date" value="${utils.formatInputDate(expense.date)}" required>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn-secondary close-modal-btn">Cancel</button>
                            <button type="button" id="update-expense-btn" class="btn-primary">Update</button>
                        </div>
                    </div>
                </div>
            `;
            
            // Add the modal to the DOM if it doesn't exist
            if (!document.getElementById('edit-expense-modal')) {
                const modalDiv = document.createElement('div');
                modalDiv.innerHTML = modalHtml;
                document.body.appendChild(modalDiv.firstChild);
                
                // Setup event listeners for the new modal
                document.querySelector('#edit-expense-modal .close-modal').addEventListener('click', () => {
                    utils.hideModal('edit-expense-modal');
                });
                
                document.querySelector('#edit-expense-modal .close-modal-btn').addEventListener('click', () => {
                    utils.hideModal('edit-expense-modal');
                });
                
                document.getElementById('update-expense-btn').addEventListener('click', () => {
                    this.updateExpense();
                });
                
                document.getElementById('edit-expense-modal').addEventListener('click', (e) => {
                    if (e.target.id === 'edit-expense-modal') {
                        utils.hideModal('edit-expense-modal');
                    }
                });
            } else {
                // Update form values
                document.getElementById('edit-expense-description').value = expense.description;
                document.getElementById('edit-expense-amount').value = expense.amount;
                document.getElementById('edit-expense-date').value = utils.formatInputDate(expense.date);
            }
            
            // Show the modal
            utils.showModal('edit-expense-modal');
            
            // Reinitialize Feather icons
            utils.initFeatherIcons();
        } catch (error) {
            console.error('Error editing expense:', error);
            utils.showAlert('Failed to load expense details. Please try again.', 'error');
        }
    },
    
    // Update an expense
    async updateExpense() {
        try {
            // Validate the form
            const description = document.getElementById('edit-expense-description').value.trim();
            const amount = document.getElementById('edit-expense-amount').value;
            const date = document.getElementById('edit-expense-date').value;
            
            if (!description || !amount || !date) {
                utils.showAlert('Please fill in all required fields.', 'error');
                return;
            }
            
            utils.showLoading();
            
            // Create expense object
            const expense = {
                id: this.currentExpenseId,
                description,
                amount: parseFloat(amount),
                date
            };
            
            // Update in database
            await db.updateExpense(expense);
            
            // Update in local array
            const index = this.expenses.findIndex(e => e.id.toString() === this.currentExpenseId.toString());
            if (index !== -1) {
                this.expenses[index] = expense;
            }
            
            // Update table
            this.renderExpensesTable(this.expenses);
            
            // Hide modal
            utils.hideModal('edit-expense-modal');
            
            // Reset current expense ID
            this.currentExpenseId = null;
            
            // Update insights
            if (typeof insightsManager !== 'undefined') {
                insightsManager.updateInsights();
            }
            
            utils.hideLoading();
            utils.showAlert('Expense updated successfully!', 'success');
        } catch (error) {
            utils.hideLoading();
            console.error('Error updating expense:', error);
            utils.showAlert('Failed to update expense. Please try again.', 'error');
            this.currentExpenseId = null;
        }
    },
    
    // Prepare to delete an expense
    deleteExpense(expenseId) {
        this.currentExpenseId = expenseId;
        
        // Set confirmation message
        document.getElementById('delete-confirm-message').textContent = 
            'Are you sure you want to delete this expense? This action cannot be undone.';
        
        // Show confirmation modal
        utils.showModal('delete-confirm-modal');
        
        // Set up the confirm delete button
        document.getElementById('confirm-delete-btn').onclick = () => this.confirmDeleteExpense();
    },
    
    // Confirm and process expense deletion
    async confirmDeleteExpense() {
        if (!this.currentExpenseId) return;
        
        try {
            utils.showLoading();
            
            // Delete from database
            await db.deleteExpense(this.currentExpenseId);
            
            // Remove from local array
            this.expenses = this.expenses.filter(expense => expense.id.toString() !== this.currentExpenseId.toString());
            
            // Update table
            this.renderExpensesTable(this.expenses);
            
            // Hide modal
            utils.hideModal('delete-confirm-modal');
            
            // Reset current expense ID
            this.currentExpenseId = null;
            
            // Update insights
            if (typeof insightsManager !== 'undefined') {
                insightsManager.updateInsights();
            }
            
            utils.hideLoading();
            utils.showAlert('Expense deleted successfully!', 'success');
        } catch (error) {
            utils.hideLoading();
            console.error('Error deleting expense:', error);
            utils.showAlert('Failed to delete expense. Please try again.', 'error');
            this.currentExpenseId = null;
        }
    }
};
