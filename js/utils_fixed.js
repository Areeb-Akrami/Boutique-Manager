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
    // Create a loading indicator if it doesn't exist
    if (!document.getElementById('loading-indicator')) {
        const loadingIndicator = document.createElement('div');
        loadingIndicator.id = 'loading-indicator';
        loadingIndicator.classList.add('loading-indicator');
        
        const spinner = document.createElement('div');
        spinner.classList.add('spinner');
        
        loadingIndicator.appendChild(spinner);
        document.body.appendChild(loadingIndicator);
        
        // Add loading indicator styles if not already added
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
    // Create an alert if it doesn't exist
    if (!document.getElementById('alert')) {
        const alert = document.createElement('div');
        alert.id = 'alert';
        alert.classList.add('alert');
        document.body.appendChild(alert);
        
        // Add alert styles if not already added
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
    
    // Remove the alert after 3 seconds
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
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Remove active class from all nav buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show the active section
    const activeSection = document.getElementById(sectionId);
    if (activeSection) {
        activeSection.style.display = 'block';
    }
    
    // Add active class to the active nav button
    const activeBtn = document.querySelector(`.nav-btn[data-section="${sectionId.replace('-section', '')}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    // Update the URL without reloading the page
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

// Print element
function printElement(elementId) {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Element with ID ${elementId} not found`);
        showAlert('Invoice container not found for printing', 'error');
        return;
    }
    
    // Use a named window so it reuses the same window if already open
    const printWindow = window.open('', 'printInvoiceWindow');
    if (!printWindow) {
        showAlert('Unable to open print window. Please check your popup blocker settings.', 'error');
        return;
    }
    
    // Create the print content in the window
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Print Invoice</title>
            <style>
                @page {
                    size: A4;
                    margin: 1.5cm; /* Increased margin */
                }
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; /* Modern font */
                    font-size: 10pt; /* Slightly smaller base font size */
                    color: #333;
                    padding: 0;
                    margin: 0;
                }
                #print-container {
                    width: 100%;
                    min-height: 100vh;
                    padding: 0; /* Remove padding, rely on @page margin */
                    box-sizing: border-box;
                }
                #print-container h1 {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    font-size: 18pt;
                    font-weight: 600;
                    color: #000;
                    margin-bottom: 20px;
                    text-align: center;
                    border-bottom: 1px solid #ccc;
                    padding-bottom: 10px;
                }
                #print-container .invoice-date {
                    font-size: 10pt;
                    text-align: right;
                    margin-bottom: 20px;
                    color: #555;
                }
                #print-container .invoice-header,
                #print-container .invoice-summary,
                #print-container .invoice-details {
                    margin-bottom: 25px; /* Increased spacing */
                }
                #print-container .invoice-header p,
                #print-container .invoice-summary p {
                    margin: 6px 0; /* Slightly increased line spacing */
                    display: flex;
                    justify-content: space-between;
                    font-size: 10pt;
                }
                #print-container .invoice-header strong,
                #print-container .invoice-summary strong {
                    font-weight: 600; /* Restore slightly bolder labels for clarity */
                    min-width: 120px; /* Keep width for alignment */
                    display: inline-block;
                    margin-right: 10px; /* Keep space after label */
                    color: #333; /* Darker label color for better contrast */
                }
                #print-container .invoice-summary {
                    border-top: 1px solid #ddd; /* Slightly darker border */
                    padding-top: 15px;
                    margin-top: 20px; /* Add margin top */
                }
                #print-container .invoice-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 25px;
                    font-size: 10pt;
                }
                #print-container .invoice-table th,
                #print-container .invoice-table td {
                    border: 1px solid #ddd;
                    padding: 10px; /* Increased padding */
                    text-align: left;
                    vertical-align: top; /* Align content top */
                }
                #print-container .invoice-table th {
                    background-color: #f5f5f5; /* Very light grey header */
                    font-weight: 600;
                    color: #333;
                    text-align: left; /* Align header text left */
                    padding: 10px 10px; /* Keep padding */
                    border-bottom: 1px solid #ddd; /* Slightly softer border */
                }
                #print-container .invoice-table th:first-child {
                    text-align: left;
                }
                #print-container .invoice-table th.amount {
                    text-align: right; /* Ensure amount header is right-aligned */
                }
                #print-container .invoice-table td.amount, /* Class for amount columns */
                #print-container .invoice-table th.amount {
                    text-align: right;
                }
                #print-container .invoice-total-row td {
                    font-weight: bold;
                    font-size: 11pt; /* Larger total */
                    border-top: 2px solid #333; /* Dark grey top border */
                    border-bottom: none; /* Remove bottom border */
                    padding: 12px 10px; /* Consistent padding */
                    color: #000; /* Black total text */
                }
                #print-container .invoice-total-row td:first-child {
                    text-align: right;
                }
                #print-container .description {
                    white-space: pre-wrap;
                    word-break: break-word;
                    margin-bottom: 5px;
                    font-size: 9pt; /* Smaller description */
                    color: #666;
                }
                #print-container .payment-info {
                    margin-top: 35px; /* Slightly reduce space */
                    padding-top: 15px;
                    border-top: 1px solid #ddd; /* Match table border */
                    font-size: 9pt;
                    color: #444; /* Slightly darker text */
                }
                #print-container .payment-info p {
                    margin: 4px 0;
                }
                .no-print {
                    display: none !important;
                }
            </style>
        </head>
        <body>
            <div id="print-container">
                ${element.innerHTML}
            </div>
        </body>
        </html>
    `);
    
    // Close the document for writing to avoid issues
    printWindow.document.close();
    
    // Add small delay to ensure styles are applied
    setTimeout(() => {
        // Print the document
        printWindow.print();
        
        // We don't automatically close the window so it can be reused
        // This allows the same window to be used for subsequent print operations
    }, 300);
}

// Format text to capitalize first letter of each word
function capitalizeWords(text) {
    return text.replace(/\b\w/g, letter => letter.toUpperCase());
}

// Filter data by text and date
function filterData(data, searchText, dateFilter, statusFilter) {
    return data.filter(item => {
        // Text search filter
        const textMatch = searchText ?
            Object.values(item).some(value =>
                value && typeof value === 'string' &&
        const textMatch = searchText ? 
            Object.values(item).some(value => 
                value && typeof value === 'string' && 
                value.toLowerCase().includes(searchText.toLowerCase())
            ) : true;
        
        // Date filter
        const dateMatch = dateFilter ?
        const dateMatch = dateFilter ? 
            new Date(item.date).toISOString().split('T')[0] === dateFilter : true;
        
        // Status filter
        const statusMatch = statusFilter && statusFilter !== 'all' ?
        const statusMatch = statusFilter && statusFilter !== 'all' ? 
            item.status && item.status.toLowerCase() === statusFilter.toLowerCase() : true;
        
        return textMatch && dateMatch && statusMatch;
    });
}

// Format object for display
function formatObject(obj) {
    if (!obj) return '';
    if (typeof obj !== 'object') return String(obj);
    
    // If it's an array, map through it
    if (Array.isArray(obj)) {
        return obj.map(item => formatObject(item)).join(', ');
    }
    
    // For objects, format key-value pairs
    try {
        // Check for common properties to display
        if (obj.name) return obj.name;
        if (obj.title) return obj.title;
        if (obj.id) return `ID: ${obj.id}`;
        if (obj.description) return obj.description;
        
        // If no common properties, create a formatted string
        return Object.entries(obj)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
    } catch (error) {
        console.error('Error formatting object:', error);
        return 'Error displaying object';
    }
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
    filterData,
    formatObject
};