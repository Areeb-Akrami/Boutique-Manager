// Business Insights Management
const insightsManager = {
    // Initialize insights functionality
    init() {
        this.setupEventListeners();
        this.loadInsights();
        setTimeout(() => {
            setupExportInsightsDropdown();
            // Show today's insights by default AFTER all listeners are set
            const todayBtn = document.getElementById('today-view-btn');
            if (todayBtn) {
                todayBtn.dispatchEvent(new Event('click', {bubbles: true}));
            }
        }, 400);
    },
    
    // Setup event listeners for insights-related actions
    setupEventListeners() {
        // View controls
        const monthlyViewBtn = document.getElementById('monthly-view-btn');
        const yearlyViewBtn = document.getElementById('yearly-view-btn');
        const customRangeBtn = document.getElementById('custom-range-btn');
        const todayBtn = document.getElementById('today-view-btn');
        
        if (monthlyViewBtn) {
            monthlyViewBtn.addEventListener('click', () => {
                this.setActiveViewButton(monthlyViewBtn);
                this.showMonthlyView();
            });
        }
        
        if (yearlyViewBtn) {
            yearlyViewBtn.addEventListener('click', () => {
                this.setActiveViewButton(yearlyViewBtn);
                this.showYearlyView();
            });
        }
        
        if (customRangeBtn) {
            customRangeBtn.addEventListener('click', () => {
                this.setActiveViewButton(customRangeBtn);
                this.showCustomRangeModal();
            });
        }
        
        if (todayBtn) {
            todayBtn.addEventListener('click', () => {
                // Get today's date in YYYY-MM-DD
                const today = utils.getCurrentDate();
                // Set active button style
                document.querySelectorAll('.insights-view-controls .btn-secondary').forEach(btn => btn.classList.remove('active'));
                todayBtn.classList.add('active');
                // Show insights for today as custom range
                if (typeof insightsManager.showCustomRangeView === 'function') {
                    insightsManager.showCustomRangeView(today, today);
                }
            });
        }
        
        // Current period dropdown toggle
        const currentPeriodBtn = document.getElementById('current-period-btn');
        if (currentPeriodBtn) {
            currentPeriodBtn.addEventListener('click', () => {
                const dropdown = document.getElementById('period-dropdown');
                dropdown.classList.toggle('show');
            });
        }
        
        // Apply date range button
        const applyDateRangeBtn = document.getElementById('apply-date-range-btn');
        if (applyDateRangeBtn) {
            applyDateRangeBtn.addEventListener('click', () => {
                this.applyCustomDateRange();
            });
        }
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.matches('.dropdown-toggle') && !e.target.closest('.dropdown-toggle')) {
                const dropdowns = document.getElementsByClassName('dropdown-menu');
                for (const dropdown of dropdowns) {
                    if (dropdown.classList.contains('show')) {
                        dropdown.classList.remove('show');
                    }
                }
            }
        });
    },
    
    // Set active view button
    setActiveViewButton(activeBtn) {
        const viewButtons = document.querySelectorAll('.insights-view-controls .btn-secondary');
        viewButtons.forEach(btn => {
            btn.classList.remove('active');
        });
        
        activeBtn.classList.add('active');
    },
    
    // Load insights data
    async loadInsights() {
        try {
            utils.showLoading();
            // Always fetch fresh data from Supabase
            let bills = [];
            let salaries = [];
            let expenses = [];
            let dupattasData = [];

            if (typeof db !== 'undefined') {
                bills = await db.getBills();
                salaries = await db.getSalaries();
                expenses = await db.getExpenses();
                if (typeof db.getDupattas === 'function') {
                    dupattasData = await db.getDupattas();
                } else {
                    console.warn('db.getDupattas is not defined!');
                }
            } else {
                console.error('Supabase db object is not defined!');
            }

            this.updateInsightsWithData(bills, salaries, expenses, dupattasData);

            const monthlyBtn = document.getElementById('monthly-view-btn');
            if (monthlyBtn) {
                monthlyBtn.click();
            }

            utils.hideLoading();
        } catch (error) {
            utils.hideLoading();
            console.error('Error loading insights:', error);
            utils.showAlert('Failed to load insights. Please try again.', 'error');
        }
    },
    
    // Update insights with all data
    async updateInsights() {
        try {
            // Always fetch fresh data from Supabase
            let bills = [];
            let salaries = [];
            let expenses = [];
            let dupattasData = [];

            if (typeof db !== 'undefined') {
                bills = await db.getBills();
                salaries = await db.getSalaries();
                expenses = await db.getExpenses();
                if (typeof db.getDupattas === 'function') {
                    dupattasData = await db.getDupattas();
                } else {
                    console.warn('db.getDupattas is not defined!');
                }
            } else {
                console.error('Supabase db object is not defined!');
            }

            this.updateInsightsWithData(bills, salaries, expenses, dupattasData);

            // Update period view
            const activeViewBtn = document.querySelector('.insights-view-controls .btn-secondary.active');
            if (activeViewBtn) {
                if (activeViewBtn.id === 'monthly-view-btn') {
                    this.showMonthlyView();
                } else if (activeViewBtn.id === 'yearly-view-btn') {
                    this.showYearlyView();
                } else if (activeViewBtn.id === 'custom-range-btn') {
                    // Reapply custom range if it was active
                    const startDate = document.getElementById('range-start-date').value;
                    const endDate = document.getElementById('range-end-date').value;
                    if (startDate && endDate) {
                        this.showCustomRangeView(startDate, endDate);
                    }
                }
            }
        } catch (error) {
            console.error('Error updating insights:', error);
        }
    },
    
    // Update insights with specific data
    updateInsightsWithData(bills, salaries, expenses, dupattasData) {
        // Calculate total revenue
        const totalRevenue = bills.reduce((total, bill) => {
            return total + (parseFloat(bill.total_amount) || 0);
        }, 0);
        
        // Paid bills amount
        const paidBillsAmount = bills.reduce((total, bill) => {
            return bill.status === 'paid' ? total + (parseFloat(bill.total_amount) || 0) : total;
        }, 0);
        
        // Pending bills amount
        const pendingBillsAmount = bills.reduce((total, bill) => {
            return bill.status === 'unpaid' || bill.status === 'advance' ? 
                total + (parseFloat(bill.total_amount) || 0) : total;
        }, 0);
        
        // Calculate amounts by service type
        const serviceAmounts = {};
        
        bills.forEach(bill => {
            if (bill.services && Array.isArray(bill.services)) {
                bill.services.forEach(service => {
                    const type = service.service_type;
                    if (!serviceAmounts[type]) {
                        serviceAmounts[type] = 0;
                    }
                    serviceAmounts[type] += parseFloat(service.amount) || 0;
                });
            }
        });
        
        // Calculate amounts by payment mode
        const paymentModeAmounts = bills.reduce((modes, bill) => {
            const mode = bill.payment_mode;
            if (!modes[mode]) {
                modes[mode] = 0;
            }
            modes[mode] += parseFloat(bill.total_amount) || 0;
            return modes;
        }, {});
        
        // --- Calculate Dupatta Insights using dupattasData ---
        const dupattaRevenue = dupattasData.reduce((total, dupatta) => {
            return total + (parseFloat(dupatta.amount) || 0); // Assuming 'amount' field exists
        }, 0);
        
        // Paid dupatta orders
        const paidDupattaOrders = dupattasData.reduce((total, dupatta) => {
            // Assuming 'status' field indicates completion, e.g., 'Completed'
            return (dupatta.status && dupatta.status.toLowerCase() === 'completed') 
                   ? total + (parseFloat(dupatta.amount) || 0) 
                   : total;
        }, 0);
        
        // Pending dupatta orders
        const pendingDupattaOrders = dupattasData.reduce((total, dupatta) => {
            // Assuming non-'Completed' status means pending
            return (!dupatta.status || dupatta.status.toLowerCase() !== 'completed') 
                   ? total + (parseFloat(dupatta.amount) || 0) 
                   : total;
        }, 0);
        // --- End Dupatta Insights Calculation ---
        
        // Calculate total salary expense
        const totalSalary = salaries.reduce((total, salary) => {
            return total + (parseFloat(salary.amount) || 0);
        }, 0);
        
        // Calculate total expenses
        const totalExpenses = expenses.reduce((total, expense) => {
            return total + (parseFloat(expense.amount) || 0);
        }, 0);
        
        // Other expenses (total expenses - salary expenses)
        const otherExpenses = totalExpenses;
        
        // Salary payment modes
        const salaryPaymentModes = salaries.reduce((modes, salary) => {
            const mode = salary.payment_mode;
            if (!modes[mode]) {
                modes[mode] = 0;
            }
            modes[mode] += parseFloat(salary.amount) || 0;
            return modes;
        }, {});
        
        // Calculate net profit
        const netProfit = totalRevenue - (totalExpenses + totalSalary);
        
        // Update UI elements
        document.getElementById('total-revenue').textContent = utils.formatCurrency(totalRevenue);
        document.getElementById('paid-bills-amount').textContent = utils.formatCurrency(paidBillsAmount);
        document.getElementById('pending-bills-amount').textContent = utils.formatCurrency(pendingBillsAmount);
        
        // Service breakdown
        document.getElementById('stitching-amount').textContent = utils.formatCurrency(serviceAmounts.stitching || 0);
        document.getElementById('dupatta-amount').textContent = utils.formatCurrency(serviceAmounts.dupatta || 0);
        document.getElementById('handwork-amount').textContent = utils.formatCurrency(serviceAmounts.handwork || 0);
        document.getElementById('embroidery-amount').textContent = utils.formatCurrency(serviceAmounts.embroidery || 0);
        document.getElementById('hanging-amount').textContent = utils.formatCurrency(serviceAmounts.hanging || 0);
        document.getElementById('fabric-amount').textContent = utils.formatCurrency(serviceAmounts.fabric || 0);
        
        // Payment modes
        document.getElementById('cash-amount').textContent = utils.formatCurrency(paymentModeAmounts.cash || 0);
        document.getElementById('gpay-amount').textContent = utils.formatCurrency(paymentModeAmounts.gpay || 0);
        
        // Dupatta revenue
        document.getElementById('dupatta-revenue').textContent = utils.formatCurrency(dupattaRevenue);
        document.getElementById('paid-orders-amount').textContent = utils.formatCurrency(paidDupattaOrders);
        document.getElementById('pending-orders-amount').textContent = utils.formatCurrency(pendingDupattaOrders);
        
        // Expenses
        document.getElementById('total-expenses').textContent = utils.formatCurrency(totalExpenses + totalSalary);
        document.getElementById('salary-expense-amount').textContent = utils.formatCurrency(totalSalary);
        document.getElementById('other-expense-amount').textContent = utils.formatCurrency(otherExpenses);
        document.getElementById('salary-cash-amount').textContent = utils.formatCurrency(salaryPaymentModes.cash || 0);
        document.getElementById('salary-gpay-amount').textContent = utils.formatCurrency(salaryPaymentModes.gpay || 0);
        
        // Net profit
        document.getElementById('net-profit').textContent = utils.formatCurrency(netProfit);
        document.getElementById('total-revenue-summary').textContent = utils.formatCurrency(totalRevenue);
        document.getElementById('total-expenses-summary').textContent = utils.formatCurrency(totalExpenses + totalSalary);
    },
    
    // Show monthly view
    showMonthlyView() {
        // Get current month's start and end dates
        const startDate = utils.getFirstDayOfMonth();
        const endDate = utils.getLastDayOfMonth();
        
        // Update period dropdown title
        document.getElementById('current-period-btn').innerHTML = 
            `${new Date().toLocaleString('default', { month: 'long' })} <i data-feather="chevron-down"></i>`;
        
        // Generate dropdown options for previous months
        this.generateMonthOptions();
        
        // Show period data
        this.showPeriodData(startDate, endDate);
        
        // Reinitialize Feather icons
        utils.initFeatherIcons();
    },
    
    // Show yearly view
    showYearlyView() {
        // Get current year's start and end dates
        const startDate = utils.getFirstDayOfYear();
        const endDate = utils.getLastDayOfYear();
        
        // Update period dropdown title
        document.getElementById('current-period-btn').innerHTML = 
            `${new Date().getFullYear()} <i data-feather="chevron-down"></i>`;
        
        // Generate dropdown options for previous years
        this.generateYearOptions();
        
        // Show period data
        this.showPeriodData(startDate, endDate);
        
        // Reinitialize Feather icons
        utils.initFeatherIcons();
    },
    
    // Show custom range modal
    showCustomRangeModal() {
        // Reset the form
        document.getElementById('date-range-form').reset();
        
        // Set default start date to first day of current month
        document.getElementById('range-start-date').value = utils.getFirstDayOfMonth();
        
        // Set default end date to current date
        document.getElementById('range-end-date').value = utils.getCurrentDate();
        
        // Show the modal
        utils.showModal('date-range-modal');
    },
    
    // Apply custom date range
    applyCustomDateRange() {
        const startDate = document.getElementById('range-start-date').value;
        const endDate = document.getElementById('range-end-date').value;
        
        if (!startDate || !endDate) {
            utils.showAlert('Please select both start and end dates.', 'error');
            return;
        }
        
        if (new Date(startDate) > new Date(endDate)) {
            utils.showAlert('Start date cannot be after end date.', 'error');
            return;
        }
        
        // Hide modal
        utils.hideModal('date-range-modal');
        
        // Show custom range view
        this.showCustomRangeView(startDate, endDate);
    },
    
    // Show custom range view
    showCustomRangeView(startDate, endDate) {
        // Format dates for display
        const formattedStartDate = utils.formatDisplayDate(startDate);
        const formattedEndDate = utils.formatDisplayDate(endDate);
        
        // Update period dropdown title
        document.getElementById('current-period-btn').innerHTML = 
            `${formattedStartDate} - ${formattedEndDate} <i data-feather="chevron-down"></i>`;
        
        // Clear dropdown options (no options for custom range)
        document.getElementById('period-dropdown').innerHTML = '';
        
        // Show period data
        this.showPeriodData(startDate, endDate);
        
        // Reinitialize Feather icons
        utils.initFeatherIcons();
    },
    
    // Generate month options for dropdown
    generateMonthOptions() {
        const dropdown = document.getElementById('period-dropdown');
        dropdown.innerHTML = '';
        
        // Get current date
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth();
        
        // Generate options for the last 12 months
        for (let i = 0; i < 12; i++) {
            const date = new Date(currentYear, currentMonth - i, 1);
            const year = date.getFullYear();
            const month = date.getMonth();
            
            const monthName = date.toLocaleString('default', { month: 'long' });
            const startDate = new Date(year, month, 1).toISOString().split('T')[0];
            const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];
            
            const option = document.createElement('div');
            option.className = 'dropdown-item';
            option.textContent = `${monthName} ${year}`;
            option.dataset.startDate = startDate;
            option.dataset.endDate = endDate;
            
            option.addEventListener('click', () => {
                document.getElementById('current-period-btn').innerHTML = 
                    `${monthName} ${year} <i data-feather="chevron-down"></i>`;
                this.showPeriodData(startDate, endDate);
                dropdown.classList.remove('show');
                utils.initFeatherIcons();
            });
            
            dropdown.appendChild(option);
        }
    },
    
    // Generate year options for dropdown
    generateYearOptions() {
        const dropdown = document.getElementById('period-dropdown');
        dropdown.innerHTML = '';
        // Get current year
        const currentYear = new Date().getFullYear();
        // Generate options for the last 5 years
        for (let i = 0; i < 5; i++) {
            const year = currentYear - i;
            const startDate = `${year}-01-01`;
            const endDate = `${year}-12-31`;
            const option = document.createElement('div');
            option.className = 'dropdown-item';
            option.textContent = year;
            option.dataset.startDate = startDate;
            option.dataset.endDate = endDate;
            option.tabIndex = 0;
            option.addEventListener('click', () => {
                document.getElementById('current-period-btn').innerHTML = 
                    `${year} <i data-feather="chevron-down"></i>`;
                this.showPeriodData(startDate, endDate);
                dropdown.classList.remove('show');
                utils.initFeatherIcons();
            });
            // Also allow keyboard selection
            option.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    option.click();
                }
            });
            dropdown.appendChild(option);
        }
    },
    
    // Show data for a specific period
    showPeriodData(startDate, endDate) {
        // Get filtered data for the period
        const bills = typeof billsManager !== 'undefined' ? billsManager.bills : [];
        const salaries = typeof salaryManager !== 'undefined' ? salaryManager.salaries : [];
        const expenses = typeof expensesManager !== 'undefined' ? expensesManager.expenses : [];
        
        // Filter bills by date
        const periodBills = bills.filter(bill => {
            const billDate = new Date(bill.date);
            return billDate >= new Date(startDate) && billDate <= new Date(endDate);
        });
        
        // Filter salaries by date
        const periodSalaries = salaries.filter(salary => {
            const salaryDate = new Date(salary.date);
            return salaryDate >= new Date(startDate) && salaryDate <= new Date(endDate);
        });
        
        // Filter expenses by date
        const periodExpenses = expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate >= new Date(startDate) && expenseDate <= new Date(endDate);
        });
        
        // Calculate period revenue
        const periodRevenue = periodBills.reduce((total, bill) => {
            return total + (parseFloat(bill.total_amount) || 0);
        }, 0);
        
        // Paid bills in period
        const periodPaidBills = periodBills.reduce((total, bill) => {
            return bill.status === 'paid' ? total + (parseFloat(bill.total_amount) || 0) : total;
        }, 0);
        
        // Pending bills in period
        const periodPendingBills = periodBills.reduce((total, bill) => {
            return bill.status === 'unpaid' || bill.status === 'advance' ? 
                total + (parseFloat(bill.total_amount) || 0) : total;
        }, 0);
        
        // Payment modes in period
        const periodPaymentModes = periodBills.reduce((modes, bill) => {
            const mode = bill.payment_mode;
            if (!modes[mode]) {
                modes[mode] = 0;
            }
            modes[mode] += parseFloat(bill.total_amount) || 0;
            return modes;
        }, {});
        
        // Period expenses
        const periodTotalExpenses = periodExpenses.reduce((total, expense) => {
            return total + (parseFloat(expense.amount) || 0);
        }, 0);
        
        // Period salary expenses
        const periodSalaryExpense = periodSalaries.reduce((total, salary) => {
            return total + (parseFloat(salary.amount) || 0);
        }, 0);
        
        // Period expense payment modes
        const periodExpensePaymentModes = {};
        
        // Period profit
        const periodProfit = periodRevenue - (periodTotalExpenses + periodSalaryExpense);
        
        // Calculate profit margin
        const profitMargin = periodRevenue > 0 ? (periodProfit / periodRevenue) * 100 : 0;
        
        // Update UI elements
        document.getElementById('period-revenue').textContent = utils.formatCurrency(periodRevenue);
        document.getElementById('period-paid-bills').textContent = utils.formatCurrency(periodPaidBills);
        document.getElementById('period-pending-bills').textContent = utils.formatCurrency(periodPendingBills);
        document.getElementById('period-cash-amount').textContent = utils.formatCurrency(periodPaymentModes.cash || 0);
        document.getElementById('period-gpay-amount').textContent = utils.formatCurrency(periodPaymentModes.gpay || 0);
        
        document.getElementById('period-expenses').textContent = utils.formatCurrency(periodTotalExpenses + periodSalaryExpense);
        document.getElementById('period-salary-expense').textContent = utils.formatCurrency(periodSalaryExpense);
        document.getElementById('period-other-expense').textContent = utils.formatCurrency(periodTotalExpenses);
        document.getElementById('period-expense-cash').textContent = utils.formatCurrency(periodExpensePaymentModes.cash || 0);
        document.getElementById('period-expense-gpay').textContent = utils.formatCurrency(periodExpensePaymentModes.gpay || 0);
        
        document.getElementById('period-profit').textContent = utils.formatCurrency(periodProfit);
        document.getElementById('period-total-revenue').textContent = utils.formatCurrency(periodRevenue);
        document.getElementById('period-total-expenses').textContent = utils.formatCurrency(periodTotalExpenses + periodSalaryExpense);
        document.getElementById('period-profit-margin').textContent = `${profitMargin.toFixed(1)}%`;
    }
};

// --- Export/Share Business Insights ---
function setupExportInsightsDropdown() {
    // Remove previous listeners by replacing node
    const oldBtn = document.getElementById('export-insights-btn');
    if (oldBtn) {
        const newBtn = oldBtn.cloneNode(true);
        oldBtn.parentNode.replaceChild(newBtn, oldBtn);
    }
    const btn = document.getElementById('export-insights-btn');
    const menu = document.getElementById('export-insights-menu');
    if (!btn || !menu) return;
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        menu.classList.toggle('show');
    });
    // Remove previous listeners from dropdown items
    const pdfBtn = document.getElementById('export-insights-pdf');
    if (pdfBtn) {
        const newItem = pdfBtn.cloneNode(true);
        pdfBtn.parentNode.replaceChild(newItem, pdfBtn);
    }
    document.getElementById('export-insights-pdf').addEventListener('click', () => {
        exportCleanInsightsPdf();
        menu.classList.remove('show');
    });
    // Hide dropdown if clicking outside
    document.addEventListener('click', function handler(e) {
        if (!btn.contains(e.target) && !menu.contains(e.target)) {
            menu.classList.remove('show');
            document.removeEventListener('click', handler);
        }
    });
}

// Export PDF without export dropdown in view
function exportCleanInsightsPdf() {
    const section = document.getElementById('insights-section');
    if (!section) return;
    // Hide export dropdown for PDF
    const actions = section.querySelector('.section-actions');
    const originalDisplay = actions ? actions.style.display : '';
    if (actions) actions.style.display = 'none';
    setTimeout(() => {
        utils.generatePdf('insights-section', 'business_insights.pdf');
        setTimeout(() => {
            if (actions) actions.style.display = originalDisplay;
        }, 500);
    }, 100);
}
