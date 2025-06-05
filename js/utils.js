// Utility functions

// Format currency
function formatCurrency(amount) {
    return `₹${parseFloat(amount).toFixed(2)}`;
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
}

// Format date for display (Month Day, Year)
function formatDisplayDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Format date for inputs (YYYY-MM-DD)
function formatInputDate(dateString) {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
}

// Get current date in YYYY-MM-DD format
function getCurrentDate() {
    return new Date().toISOString().split('T')[0];
}

// Get first day of current month
function getFirstDayOfMonth() {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
}

// Get last day of current month
function getLastDayOfMonth() {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
}

// Get first day of current year
function getFirstDayOfYear() {
    const date = new Date();
    return new Date(date.getFullYear(), 0, 1).toISOString().split('T')[0];
}

// Get last day of current year
function getLastDayOfYear() {
    const date = new Date();
    return new Date(date.getFullYear(), 11, 31).toISOString().split('T')[0];
}

// Calculate total amount
function calculateTotal(items) {
    return items.reduce((total, item) => total + parseFloat(item.amount || 0), 0);
}

// Show a modal
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) {
        console.error(`Modal with ID ${modalId} not found`);
        return;
    }
    console.log('[Modal] showModal called for:', modalId);
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

// Hide a modal
function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) {
        console.error(`Modal with ID ${modalId} not found`);
        return;
    }
    console.log('[Modal] hideModal called for:', modalId);
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
}

// Show loading indicator
function showLoading() {
    if (!document.getElementById('loading-indicator')) {
        const loadingIndicator = document.createElement('div');
        loadingIndicator.id = 'loading-indicator';
        loadingIndicator.classList.add('loading-indicator');
        
        const spinner = document.createElement('div');
        spinner.classList.add('spinner');
        
        loadingIndicator.appendChild(spinner);
        document.body.appendChild(loadingIndicator);
        
        if (!document.getElementById('loading-styles')) {
            const style = document.createElement('style');
            style.id = 'loading-styles';
            style.textContent = `
                .loading-indicator {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 2000;
                }
                
                .spinner {
                    width: 50px;
                    height: 50px;
                    border: 5px solid rgba(212, 175, 55, 0.3);
                    border-radius: 50%;
                    border-top-color: var(--primary-color);
                    animation: spin 1s ease-in-out infinite;
                }
                
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    document.getElementById('loading-indicator').style.display = 'flex';
}

// Hide loading indicator
function hideLoading() {
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.style.display = 'none';
    }
}

// Show alert
function showAlert(message, type = 'error') {
    if (!document.getElementById('alert')) {
        const alert = document.createElement('div');
        alert.id = 'alert';
        alert.classList.add('alert');
        document.body.appendChild(alert);
        
        if (!document.getElementById('alert-styles')) {
            const style = document.createElement('style');
            style.id = 'alert-styles';
            style.textContent = `
                .alert {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 1rem 1.5rem;
                    border-radius: var(--border-radius);
                    box-shadow: var(--card-shadow);
                    z-index: 1500;
                    animation: slideIn 0.3s ease, fadeOut 0.5s ease 2.5s forwards;
                    max-width: 400px;
                }
                
                .alert-error {
                    background-color: var(--danger-color);
                    color: white;
                }
                
                .alert-success {
                    background-color: var(--success-color);
                    color: white;
                }
                
                @keyframes fadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; visibility: hidden; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    const alert = document.getElementById('alert');
    alert.textContent = message;
    alert.className = `alert alert-${type}`;
    alert.style.display = 'block';
    alert.style.opacity = '1';
    alert.style.visibility = 'visible';
    
    setTimeout(() => {
        alert.style.display = 'none';
    }, 3000);
}

// Generate a unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Get a query parameter from the URL
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Set the active section
function setActiveSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
    });
    
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const activeSection = document.getElementById(sectionId);
    if (activeSection) {
        activeSection.style.display = 'block';
    }
    
    const activeBtn = document.querySelector(`.nav-btn[data-section="${sectionId.replace('-section', '')}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    const url = new URL(window.location);
    url.searchParams.set('section', sectionId.replace('-section', ''));
    window.history.pushState({}, '', url);
}

// Initialize Feather icons
function initFeatherIcons() {
    if (window.feather) {
        feather.replace();
    }
}

// Generate PDF from HTML element
async function generatePdf(elementId, filename) {
    showLoading();
    
    try {
        const element = document.getElementById(elementId);
        
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false
        });
        
        const imgData = canvas.toDataURL('image/png');
        
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(filename);
        
        hideLoading();
        showAlert('PDF generated successfully!', 'success');
    } catch (error) {
        hideLoading();
        console.error('Error generating PDF:', error);
        showAlert('Failed to generate PDF. Please try again.', 'error');
    }
}

// Updated printElement function for guaranteed one-page invoice
function printElement(elementId) {
    const element = document.getElementById(elementId);
    if (!element) {
        alert('Invoice not found!');
        return;
    }
    const printWindow = window.open('', 'PRINT', 'height=900,width=650');
    printWindow.document.write(`
        <html>
        <head>
            <title>Print Invoice</title>
            <style>
                @page { size: A4 portrait; margin: 0; }
                html, body {
                    width: 210mm; height: 297mm;
                    margin: 0; padding: 0;
                    background: #fff;
                    font-size: 9pt;
                    font-family: 'Segoe UI', Arial, sans-serif;
                }
                #print-invoice {
                    width: 190mm; margin: 0 auto; padding: 0;
                }
                .invoice, .invoice * {
                    margin: 0 !important; padding: 0 !important;
                    line-height: 1.1 !important;
                    color: #000 !important;
                    background: #fff !important;
                    font-size: inherit !important;
                }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #ccc; padding: 2px 4px; }
                h1 { font-size: 16pt; margin-bottom: 4px; }
                .notes { font-size: 8pt; margin-top: 8px; }
            </style>
        </head>
        <body>
            <div id="print-invoice">${element.innerHTML}</div>
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 500);
}

// Format text to capitalize first letter of each word
function capitalizeWords(text) {
    return text.replace(/\b\w/g, letter => letter.toUpperCase());
}

// Filter data by text and date
function filterData(data, searchText, dateFilter, statusFilter) {
    return data.filter(item => {
        const textMatch = searchText ? 
            Object.values(item).some(value => 
                value && typeof value === 'string' && 
                value.toLowerCase().includes(searchText.toLowerCase())
            ) : true;
        
        const dateMatch = dateFilter ? 
            new Date(item.date).toISOString().split('T')[0] === dateFilter : true;
        
        const statusMatch = statusFilter && statusFilter !== 'all' ? 
            item.status && item.status.toLowerCase() === statusFilter.toLowerCase() : true;
        
        return textMatch && dateMatch && statusMatch;
    });
}

// Export functions
const utils = {
    formatCurrency,
    formatDate,
    formatDisplayDate,
    formatInputDate,
    getCurrentDate,
    getFirstDayOfMonth,
    getLastDayOfMonth,
    getFirstDayOfYear,
    getLastDayOfYear,
    calculateTotal,
    showModal,
    hideModal,
    showLoading,
    hideLoading,
    showAlert,
    generateId,
    getQueryParam,
    setActiveSection,
    initFeatherIcons,
    generatePdf,
    printElement,
    capitalizeWords,
    filterData
};