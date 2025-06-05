// Bills Management
const billsManager = {
    bills: [],
    currentBillId: null,
    
    // Initialize bills functionality
    init() {
        this.setupEventListeners();
        this.loadBills();
    },
    
    // Setup event listeners for bill-related actions
    setupEventListeners() {
        // New bill button
        const newBillBtn = document.getElementById('new-bill-btn');
        if (newBillBtn) {
            newBillBtn.addEventListener('click', () => {
                this.showNewBillModal();
            });
        }
        
        // Multiple bills button
        const multipleBillsBtn = document.getElementById('multiple-bills-btn');
        if (multipleBillsBtn) {
            multipleBillsBtn.addEventListener('click', () => {
                utils.showModal('multiple-bills-modal');
            });
        }
        
        // Save bill button
        const saveBillBtn = document.getElementById('save-bill-btn');
        if (saveBillBtn) {
            saveBillBtn.addEventListener('click', () => {
                this.saveBill();
            });
        }
        
        // Update bill button
        const updateBillBtn = document.getElementById('update-bill-btn');
        if (updateBillBtn) {
            updateBillBtn.addEventListener('click', () => {
                this.updateBill();
            });
        }
        
        // Add service button
        const addServiceBtn = document.getElementById('add-service-btn');
        if (addServiceBtn) {
            addServiceBtn.addEventListener('click', () => {
                this.addServiceRow('bill-services-body');
            });
        }
        
        // Edit add service button
        const editAddServiceBtn = document.getElementById('edit-add-service-btn');
        if (editAddServiceBtn) {
            editAddServiceBtn.addEventListener('click', () => {
                this.addServiceRow('edit-bill-services-body');
            });
        }
        
        // Save multiple bills button
        const saveMultipleBillsBtn = document.getElementById('save-multiple-bills-btn');
        if (saveMultipleBillsBtn) {
            saveMultipleBillsBtn.addEventListener('click', () => {
                this.saveMultipleBills();
            });
        }
        
        // Add bill button (for multiple bills)
        const addBillBtn = document.getElementById('add-bill-btn');
        if (addBillBtn) {
            addBillBtn.addEventListener('click', () => {
                this.addBillCard();
            });
        }
        
        // Bill search button
        const billSearchBtn = document.getElementById('bill-search-btn');
        if (billSearchBtn) {
            billSearchBtn.addEventListener('click', () => {
                this.filterBills();
            });
        }
        
        // Bill clear button
        const billClearBtn = document.getElementById('bill-clear-btn');
        if (billClearBtn) {
            billClearBtn.addEventListener('click', () => {
                document.getElementById('bill-search').value = '';
                document.getElementById('bill-date-filter').value = '';
                document.getElementById('bill-status-filter').value = 'all';
                this.renderBillsTable(this.bills);
            });
        }
        
        // Print invoice button
        const printInvoiceBtn = document.getElementById('print-invoice-btn');
        if (printInvoiceBtn) {
            printInvoiceBtn.addEventListener('click', () => {
                this.printInvoice();
            });
        }
        
        // Confirm delete button
        const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
        if (confirmDeleteBtn) {
            confirmDeleteBtn.addEventListener('click', () => {
                this.confirmDelete();
            });
        }
        
        // Delegate event for bill services changes
        document.addEventListener('change', (e) => {
            // Calculate total amount when service amount changes
            if (e.target.classList.contains('service-amount')) {
                const tableBody = e.target.closest('tbody');
                if (tableBody) {
                    if (tableBody.id === 'bill-services-body') {
                        this.calculateBillTotal();
                    } else if (tableBody.id === 'edit-bill-services-body') {
                        this.calculateEditBillTotal();
                    } else if (tableBody.classList.contains('multi-bill-services-body')) {
                        this.calculateMultiBillTotal(tableBody);
                    }
                }
            }
        });

        // Delegate event for removing services or bills
        document.addEventListener('click', (e) => {
            const target = e.target.closest('button');
            if (!target) return;

            // Remove service
            if (target.classList.contains('remove-service')) {
                const row = target.closest('tr');
                const tableBody = row.closest('tbody');
                if (tableBody && tableBody.querySelectorAll('tr').length > 1) {
                    row.remove();
                    if (tableBody.id === 'bill-services-body') {
                        this.calculateBillTotal();
                    } else if (tableBody.id === 'edit-bill-services-body') {
                        this.calculateEditBillTotal();
                    } else if (tableBody.classList.contains('multi-bill-services-body')) {
                        this.calculateMultiBillTotal(tableBody);
                    }
                } else {
                    utils.showAlert('Cannot remove the only service. Please update its details instead.', 'error');
                }
            }
            // Remove bill card
            else if (target.classList.contains('remove-bill')) {
                const card = target.closest('.bill-card');
                const container = card.closest('.bills-list-container');
                if (container && container.querySelectorAll('.bill-card').length > 1) {
                    card.remove();
                    this.updateBillNumbers();
                } else {
                    utils.showAlert('Cannot remove the only bill. Please update its details instead.', 'error');
                }
            }
            // Add service to multiple bill
            else if (target.classList.contains('add-multi-service-btn')) {
                const tableBody = target.closest('.services-table')?.querySelector('tbody');
                if (tableBody) {
                    this.addServiceRow(tableBody);
                }
            }
            // View invoice
            else if (target.classList.contains('view-invoice')) {
                const billId = target.dataset.id;
                if (billId) {
                    this.viewInvoice(billId);
                }
            }
            // Edit bill
            else if (target.classList.contains('edit-bill')) {
                const billId = target.dataset.id;
                if (billId) {
                    this.editBill(billId);
                }
            }
            // Delete bill
            else if (target.classList.contains('delete-bill')) {
                const billId = target.dataset.id;
                if (billId) {
                    this.deleteBill(billId);
                }
            }
        });

        // Initialize today's date for multiple bills modal
        this.initializeTodayButton();
    },
    
    // Initialize today's date for multiple bills modal
    initializeTodayButton() {
        const todayBtn = document.getElementById('bill-today-btn');
        if (todayBtn) {
            todayBtn.addEventListener('click', () => {
                const dateInput = document.getElementById('bill-date');
                if (dateInput) {
                    dateInput.value = utils.getCurrentDate();
                }
            });
        }
    },
    
    // Load bills from the database
    async loadBills() {
        try {
            utils.showLoading();
            
            this.bills = await db.getBills();
            this.renderBillsTable(this.bills);
            
            // Update insights after loading bills
            if (typeof insightsManager !== 'undefined') {
                insightsManager.updateInsights();
            }
            
            utils.hideLoading();
        } catch (error) {
            utils.hideLoading();
            console.error('Error loading bills:', error);
            utils.showAlert('Failed to load bills. Please try again.', 'error');
        }
    },
    
    // Render bills in the table
    renderBillsTable(bills) {
        const tableBody = document.getElementById('bills-table-body');
        
        if (!tableBody) return;
        
        tableBody.innerHTML = '';
        
        if (bills.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `<td colspan="9" class="text-center">No bills found</td>`;
            tableBody.appendChild(emptyRow);
            
            document.getElementById('bills-total-amount').textContent = formatCurrency(0);
            return;
        }
        
        let totalAmount = 0;
        
        bills.forEach(bill => {
            const tr = document.createElement('tr');
            
            const statusClass = bill.status === 'paid' ? 'status-paid' : 
                               bill.status === 'unpaid' ? 'status-unpaid' : 'status-advance';
            
            tr.innerHTML = `
                <td>${bill.bill_number || bill.id}</td>
                <td>${bill.customer_name || ''}</td>
                <td>${bill.customer_phone || ''}</td>
                <td>${utils.formatCurrency(bill.total_amount)}</td>
                <td>${bill.date ? utils.formatDate(bill.date) : ''}</td>
                <td>${bill.delivery_date ? utils.formatDate(bill.delivery_date) : ''}</td>
                <td><span class="status-badge ${statusClass}">${bill.status ? bill.status.toUpperCase() : ''}</span></td>
                <td>${bill.payment_mode || ''}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon view-invoice" data-id="${bill.id}">
                            <i data-feather="eye"></i>
                        </button>
                        <button class="btn-icon edit-bill" data-id="${bill.id}">
                            <i data-feather="edit"></i>
                        </button>
                        <button class="btn-icon danger delete-bill" data-id="${bill.id}">
                            <i data-feather="trash-2"></i>
                        </button>
                    </div>
                </td>
            `;
            
            tableBody.appendChild(tr);
            totalAmount += parseFloat(bill.total_amount) || 0;
        });
        
        // Update total amount
        document.getElementById('bills-total-amount').textContent = utils.formatCurrency(totalAmount);
        
        // Reinitialize Feather icons
        utils.initFeatherIcons();
    },
    
    // Show new bill modal
    showNewBillModal() {
        // Reset the form
        document.getElementById('new-bill-form').reset();
        
        // Set default dates
        document.getElementById('bill-date').value = utils.getCurrentDate();
        
        // Default delivery date to 7 days from now
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + 7);
        document.getElementById('bill-delivery-date').value = deliveryDate.toISOString().split('T')[0];
        
        // Reset services table (keep only one row)
        const servicesBody = document.getElementById('bill-services-body');
        servicesBody.innerHTML = `
            <tr>
                <td>
                    <select class="service-type" required>
                        <option value="">Select Service</option>
                        <option value="stitching">Stitching</option>
                        <option value="dupatta">Dupatta</option>
                        <option value="handwork">Handwork</option>
                        <option value="embroidery">Embroidery</option>
                        <option value="hanging">Hanging</option>
                        <option value="fabric">Fabric</option>
                    </select>
                </td>
                <td>
                    <input type="number" class="service-amount" min="0" step="0.01" required>
                </td>
                <td>
                    <button type="button" class="btn-icon remove-service">
                        <i data-feather="trash-2"></i>
                    </button>
                </td>
            </tr>
        `;
        
        // Reset total amount
        document.getElementById('bill-total-amount').textContent = utils.formatCurrency(0);
        
        // Show the modal
        utils.showModal('new-bill-modal');
        
        // DEBUG: Check modal state after showing
        setTimeout(() => {
            const modal = document.getElementById('new-bill-modal');
            if (modal) {
                console.log('[Modal DEBUG] After showModal: classList=', Array.from(modal.classList), 'computed display=', getComputedStyle(modal).display, 'opacity=', getComputedStyle(modal).opacity, 'pointer-events=', getComputedStyle(modal).pointerEvents);
            } else {
                console.log('[Modal DEBUG] new-bill-modal not found in DOM after showModal');
            }
        }, 500);
        
        // Reinitialize Feather icons
        utils.initFeatherIcons();
    },
    
    // Add a new service row to a table
    addServiceRow(targetId) {
        const target = typeof targetId === 'string' ? document.getElementById(targetId) : targetId;
        
        if (!target) return;
        
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>
                <select class="service-type" required>
                    <option value="">Select Service</option>
                    <option value="stitching">Stitching</option>
                    <option value="dupatta">Dupatta</option>
                    <option value="handwork">Handwork</option>
                    <option value="embroidery">Embroidery</option>
                    <option value="hanging">Hanging</option>
                    <option value="fabric">Fabric</option>
                </select>
            </td>
            <td>
                <input type="number" class="service-amount" min="0" step="0.01" required>
            </td>
            <td>
                <button type="button" class="btn-icon remove-service">
                    <i data-feather="trash-2"></i>
                </button>
            </td>
        `;
        
        target.appendChild(newRow);
        
        // Reinitialize Feather icons
        utils.initFeatherIcons();
        
        // Calculate total if needed
        if (target.id === 'bill-services-body') {
            this.calculateBillTotal();
        } else if (target.id === 'edit-bill-services-body') {
            this.calculateEditBillTotal();
        } else if (target.classList.contains('multi-bill-services-body')) {
            this.calculateMultiBillTotal(target);
        }
    },
    
    // Calculate total amount for new bill
    calculateBillTotal() {
        const rows = document.querySelectorAll('#bill-services-body tr');
        let total = 0;
        
        rows.forEach(row => {
            const amountInput = row.querySelector('.service-amount');
            if (amountInput && amountInput.value) {
                total += parseFloat(amountInput.value) || 0;
            }
        });
        
        document.getElementById('bill-total-amount').textContent = utils.formatCurrency(total);
    },
    
    // Calculate total amount for edit bill
    calculateEditBillTotal() {
        const rows = document.querySelectorAll('#edit-bill-services-body tr');
        let total = 0;
        
        rows.forEach(row => {
            const amountInput = row.querySelector('.service-amount');
            if (amountInput && amountInput.value) {
                total += parseFloat(amountInput.value) || 0;
            }
        });
        
        document.getElementById('edit-bill-total-amount').textContent = utils.formatCurrency(total);
    },
    
    // Calculate total amount for multi-bill
    calculateMultiBillTotal(tableBody) {
        const rows = tableBody.querySelectorAll('tr');
        let total = 0;
        
        rows.forEach(row => {
            const amountInput = row.querySelector('.service-amount');
            if (amountInput && amountInput.value) {
                total += parseFloat(amountInput.value) || 0;
            }
        });
        
        const totalElement = tableBody.closest('.bill-card-content').querySelector('.multi-bill-total-amount');
        if (totalElement) {
            totalElement.textContent = utils.formatCurrency(total);
        }
    },
    
    // Save a new bill
    async saveBill() {
        try {
            // Validate the form
            const billNumber = document.getElementById('bill-number').value.trim();
            const customerName = document.getElementById('bill-customer-name').value.trim();
            const customerPhone = document.getElementById('bill-customer-phone').value.trim();
            const date = document.getElementById('bill-date').value;
            const deliveryDate = document.getElementById('bill-delivery-date').value;
            const status = document.getElementById('bill-payment-status').value;
            const paymentMode = document.getElementById('bill-payment-mode').value;
            
            if (!billNumber || !date || !deliveryDate || !status || !paymentMode) {
                utils.showAlert('Please fill in all required fields.', 'error');
                return;
            }
            
            // Note: Customer name and phone are optional
            
            // Validate services
            const serviceRows = document.querySelectorAll('#bill-services-body tr');
            const services = [];
            
            for (const row of serviceRows) {
                const serviceType = row.querySelector('.service-type').value;
                const amount = row.querySelector('.service-amount').value;
                
                if (!serviceType || !amount) {
                    utils.showAlert('Please complete all service details.', 'error');
                    return;
                }
                
                services.push({
                    service_type: serviceType,
                    amount: parseFloat(amount)
                });
            }
            
            if (services.length === 0) {
                utils.showAlert('Please add at least one service.', 'error');
                return;
            }
            
            utils.showLoading();
            
            // Calculate total amount
            const totalAmount = services.reduce((total, service) => total + service.amount, 0);
            
            // Create bill object
            const bill = {
                bill_number: billNumber,
                customer_name: customerName,
                customer_phone: customerPhone,
                date,
                delivery_date: deliveryDate,
                status,
                payment_mode: paymentMode,
                total_amount: totalAmount,
                services
            };
            
            // Save to database
            const savedBill = await db.createBill(bill);

            // Instead of manually updating the array, reload from DB
            await this.loadBills();

            // Hide modal
            utils.hideModal('new-bill-modal');
            // Update insights
            if (typeof insightsManager !== 'undefined') {
                insightsManager.updateInsights();
            }
            utils.hideLoading();
            utils.showAlert('Bill created successfully!', 'success');
        } catch (error) {
            utils.hideLoading();
            console.error('Error saving bill:', error);
            utils.showAlert('Failed to create bill. Please try again.', 'error');
        }
    },
    
    // Filter bills based on search, date, and status
    filterBills() {
        const searchText = document.getElementById('bill-search').value.trim().toLowerCase();
        const dateFilter = document.getElementById('bill-date-filter').value;
        const statusFilter = document.getElementById('bill-status-filter').value;
        
        // Reset if all filters are empty
        if (!searchText && !dateFilter && statusFilter === 'all') {
            this.renderBillsTable(this.bills);
            return;
        }
        
        // Filter bills
        const filteredBills = this.bills.filter(bill => {
            // Search text filter
            const textMatch = !searchText || 
                bill.id.toString().includes(searchText) ||
                (bill.bill_number && bill.bill_number.toLowerCase().includes(searchText)) ||
                (bill.customer_name && bill.customer_name.toLowerCase().includes(searchText)) ||
                (bill.customer_phone && bill.customer_phone.toLowerCase().includes(searchText));
            
            // Date filter
            const dateMatch = !dateFilter || bill.date === dateFilter;
            
            // Status filter
            const statusMatch = statusFilter === 'all' || bill.status === statusFilter;
            
            return textMatch && dateMatch && statusMatch;
        });
        
        this.renderBillsTable(filteredBills);
    },
    
    // View invoice for a bill
    async viewInvoice(billId) {
        try {
            utils.showLoading();
            
            // Find the bill in local array first
            let bill = this.bills.find(b => b.id.toString() === billId.toString());
            
            // If not found (e.g. after page refresh), fetch from database
            if (!bill) {
                bill = await db.getBill(billId);
            }
            
            if (!bill) {
                throw new Error('Bill not found');
            }
            
            // Initialize settings object
            let settings = {};
            
            // Try to load shop settings, but use defaults if it fails
            try {
                const loadedSettings = await settingsManager.loadSettings();
                if (loadedSettings) {
                    settings = loadedSettings;
                }
            } catch (settingsError) {
                console.warn('Could not load settings, using defaults:', settingsError);
            }
            
            // Generate invoice HTML
            const invoiceHtml = this.generateInvoiceHtml(bill, settings);
            
            // Update invoice container
            document.getElementById('invoice-container').innerHTML = invoiceHtml;
            
            // Init feather icons for the invoice
            utils.initFeatherIcons();
            
            // Show invoice modal
            utils.showModal('invoice-modal');
            
            utils.hideLoading();
        } catch (error) {
            utils.hideLoading();
            console.error('Error viewing invoice:', error);
            utils.showAlert('Failed to load invoice. Please try again.', 'error');
        }
    },
    
    // Generate HTML for invoice
    generateInvoiceHtml(bill, settings) {
        // Format services for display
        const servicesHtml = (bill.services && Array.isArray(bill.services) && bill.services.length > 0)
            ? bill.services.map(service => `
                <tr>
                    <td>${utils.capitalizeWords(service.service_type || '')}</td>
                    <td class="amount">${utils.formatCurrency(service.amount || 0)}</td>
                </tr>
              `).join('')
            : '<tr><td colspan="2">No services</td></tr>';

        return `
        <div class="invoice" style="font-family: 'Segoe UI', Arial, sans-serif; font-size: 10pt; color: #222;">
            <div style="text-align:center; margin-bottom:10px;">
                <h1 style="margin:0; font-size:18pt; letter-spacing:2px;">INVOICE</h1>
                <div style="font-size:11pt; font-weight:600; margin-top:2px;">${settings.name}</div>
                <div style="font-size:10pt;">${settings.phone} | ${settings.address}</div>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                <div>
                    <div><strong>Bill No:</strong> ${bill.bill_number || bill.id}</div>
                    <div><strong>Date:</strong> ${utils.formatDisplayDate(bill.date)}</div>
                </div>
                <div style="text-align:right;">
                    <div><strong>Customer:</strong> ${bill.customer_name || '-'}</div>
                    <div><strong>Phone:</strong> ${bill.customer_phone || '-'}</div>
                </div>
            </div>
            <table class="invoice-table" style="width:100%; border-collapse:collapse; margin-bottom:8px;">
                <thead>
                    <tr>
                        <th style="border:1px solid #ccc; padding:4px 8px; background:#f5f5f5;">Description</th>
                        <th style="border:1px solid #ccc; padding:4px 8px; background:#f5f5f5; text-align:right;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${servicesHtml}
                </tbody>
            </table>
            <div style="text-align:right; margin-bottom:8px;">
                <div><strong>Total Amount:</strong> ${utils.formatCurrency(bill.total_amount)}</div>
                <div><strong>Payment Status:</strong> ${bill.status ? bill.status.toUpperCase() : '-'}</div>
                <div><strong>Payment Mode:</strong> ${bill.payment_mode || '-'}</div>
            </div>
            <div style="font-size:9pt; color:#444; margin-top:10px;">
                <strong>Notes:</strong>
                <div>1. Payment is due upon receipt of the invoice.</div>
                <div>2. Please make the payment via the specified payment mode.</div>
                <div>Thank you for your business!</div>
            </div>
        </div>
        `;
    },
    
    // Print the current invoice with updated settings
    async printInvoice() {
        try {
            // Get current settings
            const settings = await settingsManager.loadSettings();
            const invoiceContainer = document.getElementById('invoice-container');
            
            // Regenerate invoice HTML with current settings
            const billData = JSON.parse(invoiceContainer.dataset.bill || '{}');
            const invoiceHtml = this.generateInvoiceHtml(billData, settings);
            
            // Update container before printing
            invoiceContainer.innerHTML = invoiceHtml;
            
            // Now print
            utils.printElement('invoice-container');
        } catch (error) {
            console.error('Error printing invoice:', error);
            utils.showAlert('Failed to print invoice. Please try again.', 'error');
        }
    },
    
    // Edit a bill
    async editBill(billId) {
        try {
            utils.showLoading();
            
            // Find the bill in local array first
            let bill = this.bills.find(b => b.id.toString() === billId.toString());
            
            // If not found (e.g. after page refresh), fetch from database
            if (!bill) {
                bill = await db.getBill(billId);
            }
            
            if (!bill) {
                throw new Error('Bill not found');
            }
            
            // Store current bill ID for update operation
            this.currentBillId = bill.id;
            
            // Populate form fields
            document.getElementById('edit-bill-id').value = bill.id;
            document.getElementById('edit-bill-number').value = bill.bill_number || '';
            document.getElementById('edit-bill-customer-name').value = bill.customer_name || '';
            document.getElementById('edit-bill-customer-phone').value = bill.customer_phone || '';
            document.getElementById('edit-bill-date').value = utils.formatInputDate(bill.date);
            document.getElementById('edit-bill-delivery-date').value = utils.formatInputDate(bill.delivery_date);
            document.getElementById('edit-bill-payment-status').value = bill.status;
            document.getElementById('edit-bill-payment-mode').value = bill.payment_mode;
            
            // Populate services
            const servicesBody = document.getElementById('edit-bill-services-body');
            servicesBody.innerHTML = '';
            
            // Ensure bill.services exists and is an array
            if (bill.services && Array.isArray(bill.services) && bill.services.length > 0) {
                bill.services.forEach(service => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>
                            <select class="service-type" required>
                                <option value="">Select Service</option>
                                <option value="stitching" ${service.service_type === 'stitching' ? 'selected' : ''}>Stitching</option>
                                <option value="dupatta" ${service.service_type === 'dupatta' ? 'selected' : ''}>Dupatta</option>
                                <option value="handwork" ${service.service_type === 'handwork' ? 'selected' : ''}>Handwork</option>
                                <option value="embroidery" ${service.service_type === 'embroidery' ? 'selected' : ''}>Embroidery</option>
                                <option value="hanging" ${service.service_type === 'hanging' ? 'selected' : ''}>Hanging</option>
                                <option value="fabric" ${service.service_type === 'fabric' ? 'selected' : ''}>Fabric</option>
                            </select>
                        </td>
                        <td>
                            <input type="number" class="service-amount" min="0" step="0.01" value="${service.amount}" required>
                        </td>
                        <td>
                            <button type="button" class="btn-icon remove-service">
                                <i data-feather="trash-2"></i>
                            </button>
                        </td>
                    `;
                    
                    servicesBody.appendChild(row);
                });
            } else {
                // If no services or services array is not valid, add an empty row
                this.addServiceRow('edit-bill-services-body');
            }
            
            // Update total amount
            document.getElementById('edit-bill-total-amount').textContent = utils.formatCurrency(bill.total_amount);
            
            // Show the modal
            utils.showModal('edit-bill-modal');
            
            // Reinitialize Feather icons
            utils.initFeatherIcons();
            
            utils.hideLoading();
        } catch (error) {
            utils.hideLoading();
            console.error('Error editing bill:', error);
            utils.showAlert('Failed to load bill details. Please try again.', 'error');
        }
    },
    
    // Update a bill
    async updateBill() {
        try {
            // Validate the form
            const billId = document.getElementById('edit-bill-id').value;
            const billNumber = document.getElementById('edit-bill-number').value.trim();
            const customerName = document.getElementById('edit-bill-customer-name').value.trim();
            const customerPhone = document.getElementById('edit-bill-customer-phone').value.trim();
            const date = document.getElementById('edit-bill-date').value;
            const deliveryDate = document.getElementById('edit-bill-delivery-date').value;
            const status = document.getElementById('edit-bill-payment-status').value;
            const paymentMode = document.getElementById('edit-bill-payment-mode').value;
            
            if (!billNumber || !date || !deliveryDate || !status || !paymentMode) {
                utils.showAlert('Please fill in all required fields.', 'error');
                return;
            }
            
            // Note: Customer name and phone are optional
            
            // Validate services
            const serviceRows = document.querySelectorAll('#edit-bill-services-body tr');
            const services = [];
            
            for (const row of serviceRows) {
                const serviceType = row.querySelector('.service-type').value;
                const amount = row.querySelector('.service-amount').value;
                
                if (!serviceType || !amount) {
                    utils.showAlert('Please complete all service details.', 'error');
                    return;
                }
                
                services.push({
                    service_type: serviceType,
                    amount: parseFloat(amount)
                });
            }
            
            if (services.length === 0) {
                utils.showAlert('Please add at least one service.', 'error');
                return;
            }
            
            utils.showLoading();
            
            // Calculate total amount
            const totalAmount = services.reduce((total, service) => total + service.amount, 0);
            
            // Create bill object
            const bill = {
                id: billId,
                bill_number: billNumber,
                customer_name: customerName,
                customer_phone: customerPhone,
                date,
                delivery_date: deliveryDate,
                status,
                payment_mode: paymentMode,
                total_amount: totalAmount,
                services
            };
            
            // Update in database
            await db.updateBill(bill);
            
            // Update in local array
            const index = this.bills.findIndex(b => b.id.toString() === billId.toString());
            if (index !== -1) {
                this.bills[index] = { ...bill, services: [...services] };
            }
            
            // Update table
            this.renderBillsTable(this.bills);
            
            // Hide modal
            utils.hideModal('edit-bill-modal');
            
            // Update insights
            if (typeof insightsManager !== 'undefined') {
                insightsManager.updateInsights();
            }
            
            utils.hideLoading();
            utils.showAlert('Bill updated successfully!', 'success');
        } catch (error) {
            utils.hideLoading();
            console.error('Error updating bill:', error);
            utils.showAlert('Failed to update bill. Please try again.', 'error');
        }
    },
    
    // Prepare to delete a bill
    deleteBill(billId) {
        this.currentBillId = billId;
        
        // Set confirmation message
        document.getElementById('delete-confirm-message').textContent = 
            `Are you sure you want to delete bill #${billId}? This action cannot be undone.`;
        
        // Show confirmation modal
        utils.showModal('delete-confirm-modal');
    },
    
    // Confirm and process bill deletion
    async confirmDelete() {
        if (!this.currentBillId) return;
        
        try {
            utils.showLoading();
            
            // Delete from database
            await db.deleteBill(this.currentBillId);
            
            // Remove from local array
            this.bills = this.bills.filter(bill => bill.id.toString() !== this.currentBillId.toString());
            
            // Update table
            this.renderBillsTable(this.bills);
            
            // Hide modal
            utils.hideModal('delete-confirm-modal');
            
            // Reset current bill ID
            this.currentBillId = null;
            
            // Update insights
            if (typeof insightsManager !== 'undefined') {
                insightsManager.updateInsights();
            }
            
            utils.hideLoading();
            utils.showAlert('Bill deleted successfully!', 'success');
        } catch (error) {
            utils.hideLoading();
            console.error('Error deleting bill:', error);
            utils.showAlert('Failed to delete bill. Please try again.', 'error');
            this.currentBillId = null;
        }
    },
    
    // Add a new bill card to multiple bills
    addBillCard() {
        const container = document.querySelector('.bills-list-container');
        const billCount = container.querySelectorAll('.bill-card').length + 1;
        
        const billCard = document.createElement('div');
        billCard.className = 'bill-card';
        billCard.innerHTML = `
            <div class="bill-card-header">
                <h3>Bill #${billCount}</h3>
                <button type="button" class="btn-icon remove-bill">
                    <i data-feather="trash-2"></i>
                </button>
            </div>
            <div class="bill-card-content">
                <div class="form-row">
                    <div class="form-group">
                        <label>Bill Number</label>
                        <input type="text" class="multi-bill-number" placeholder="e.g. EB-2025-001" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Payment Status</label>
                        <select class="multi-bill-payment-status" required>
                            <option value="unpaid">Unpaid</option>
                            <option value="paid">Paid</option>
                            <option value="advance">Advance</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Payment Mode</label>
                        <select class="multi-bill-payment-mode" required>
                            <option value="cash">Cash</option>
                            <option value="gpay">Google Pay</option>
                        </select>
                    </div>
                </div>
                <div class="services-container">
                    <h4>Services</h4>
                    <div class="services-table">
                        <table class="multi-bill-services-table">
                            <thead>
                                <tr>
                                    <th>Service</th>
                                    <th>Amount</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody class="multi-bill-services-body">
                                <tr>
                                    <td>
                                        <select class="service-type" required>
                                            <option value="">Select Service</option>
                                            <option value="stitching">Stitching</option>
                                            <option value="dupatta">Dupatta</option>
                                            <option value="handwork">Handwork</option>
                                            <option value="embroidery">Embroidery</option>
                                            <option value="hanging">Hanging</option>
                                            <option value="fabric">Fabric</option>
                                        </select>
                                    </td>
                                    <td>
                                        <input type="number" class="service-amount" min="0" step="0.01" required>
                                    </td>
                                    <td>
                                        <button type="button" class="btn-icon remove-service">
                                            <i data-feather="trash-2"></i>
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <button type="button" class="btn-secondary add-multi-service-btn">
                            <i data-feather="plus"></i> Add Service
                        </button>
                    </div>
                </div>
                <div class="form-row total-row">
                    <h4>Total Amount:</h4>
                    <h4 class="multi-bill-total-amount">₹0.00</h4>
                </div>
            </div>
        `;
        
        container.appendChild(billCard);
        
        // Reinitialize Feather icons
        utils.initFeatherIcons();
    },
    
    // Update bill numbers after removing a bill card
    updateBillNumbers() {
        const billCards = document.querySelectorAll('.bill-card');
        
        billCards.forEach((card, index) => {
            const header = card.querySelector('.bill-card-header h3');
            header.textContent = `Bill #${index + 1}`;
        });
    },
    
    // Save multiple bills
    async saveMultipleBills() {
        try {
            // Get common data
            const customerName = document.getElementById('multi-bill-customer-name').value.trim();
            const customerPhone = document.getElementById('multi-bill-customer-phone').value.trim();
            const date = document.getElementById('multi-bill-date').value;
            const deliveryDate = document.getElementById('multi-bill-delivery-date').value;
            
            if (!date || !deliveryDate) {
                utils.showAlert('Please fill in the bill date and delivery date.', 'error');
                return;
            }
            
            // Get bill cards
            const billCards = document.querySelectorAll('.bill-card');
            const bills = [];
            
            // Validate and collect bill data
            for (const card of billCards) {
                const status = card.querySelector('.multi-bill-payment-status').value;
                const paymentMode = card.querySelector('.multi-bill-payment-mode').value;
                
                // Validate services
                const serviceRows = card.querySelectorAll('.multi-bill-services-body tr');
                const services = [];
                
                for (const row of serviceRows) {
                    const serviceType = row.querySelector('.service-type').value;
                    const amount = row.querySelector('.service-amount').value;
                    
                    if (!serviceType || !amount) {
                        utils.showAlert(`Please complete all service details in bill #${bills.length + 1}.`, 'error');
                        return;
                    }
                    
                    services.push({
                        service_type: serviceType,
                        amount: parseFloat(amount)
                    });
                }
                
                if (services.length === 0) {
                    utils.showAlert(`Please add at least one service to bill #${bills.length + 1}.`, 'error');
                    return;
                }
                
                // Calculate total amount
                const totalAmount = services.reduce((total, service) => total + service.amount, 0);
                
                // Get bill number
                const billNumber = card.querySelector('.multi-bill-number').value.trim();
                
                if (!billNumber) {
                    utils.showAlert(`Please enter a bill number for bill #${bills.length + 1}.`, 'error');
                    return;
                }
                
                // Create bill object
                bills.push({
                    bill_number: billNumber,
                    customer_name: customerName,
                    customer_phone: customerPhone,
                    date,
                    delivery_date: deliveryDate,
                    status,
                    payment_mode: paymentMode,
                    total_amount: totalAmount,
                    services
                });
            }
            
            utils.showLoading();
            
            // Save each bill
            for (const bill of bills) {
                await db.createBill(bill);
            }

            // Instead of manually updating the array, reload from DB
            await this.loadBills();

            // Hide modal
            utils.hideModal('multiple-bills-modal');
            // Update insights
            if (typeof insightsManager !== 'undefined') {
                insightsManager.updateInsights();
            }
            utils.hideLoading();
            utils.showAlert(`${bills.length} bills created successfully!`, 'success');
        } catch (error) {
            utils.hideLoading();
            console.error('Error saving multiple bills:', error);
            utils.showAlert('Failed to create bills. Please try again.', 'error');
        }
    }
};
