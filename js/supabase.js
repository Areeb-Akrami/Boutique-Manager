// Sample data - Only used if Supabase connection fails
const mockData = {
    settings: [{
        id: 1,
        name: 'Elegance Boutique',
        phone: '+91 98765 43210',
        address: '123 Fashion Street, Stylish City',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }],
    dupattas: [{
        id: 1,
        order_number: 'D-2025-001',
        customer_name: 'Aisha Khan',
        customer_phone: '9876543210',
        order_date: '2025-04-15',
        delivery_date: '2025-04-30',
        status: 'pending',
        amount: 2500,
        payment_mode: 'cash',
        details: 'Blue silk dupatta with gold embroidery',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }, {
        id: 2,
        order_number: 'D-2025-002',
        customer_name: 'Priya Singh',
        customer_phone: '8765432109',
        order_date: '2025-04-10',
        delivery_date: '2025-04-25',
        status: 'completed',
        amount: 3200,
        payment_mode: 'gpay',
        details: 'Red chiffon dupatta with mirror work',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }],
    bills: [{
        id: 1,
        bill_number: 'EB-2025-001',
        customer_name: 'Priya Sharma',
        customer_phone: '9876543210',
        date: '2025-04-20',
        delivery_date: '2025-04-27',
        status: 'paid',
        payment_mode: 'gpay',
        total_amount: 3500,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }, {
        id: 2,
        bill_number: 'EB-2025-002',
        customer_name: 'Ananya Singh',
        customer_phone: '8765432109',
        date: '2025-04-22',
        delivery_date: '2025-04-29',
        status: 'unpaid',
        payment_mode: 'cash',
        total_amount: 4200,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }, {
        id: 3,
        bill_number: 'EB-2025-003',
        customer_name: 'Ravi Kumar',
        customer_phone: '7654321098',
        date: '2025-04-15',
        delivery_date: '2025-04-22',
        status: 'advance',
        payment_mode: 'gpay',
        total_amount: 2800,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }],
    services: [{
        id: 1,
        bill_id: 1,
        service_type: 'stitching',
        amount: 1500,
        created_at: new Date().toISOString()
    }, {
        id: 2,
        bill_id: 1,
        service_type: 'embroidery',
        amount: 2000,
        created_at: new Date().toISOString()
    }, {
        id: 3,
        bill_id: 2,
        service_type: 'dupatta',
        amount: 1200,
        created_at: new Date().toISOString()
    }, {
        id: 4,
        bill_id: 2,
        service_type: 'handwork',
        amount: 3000,
        created_at: new Date().toISOString()
    }, {
        id: 5,
        bill_id: 3,
        service_type: 'stitching',
        amount: 1800,
        created_at: new Date().toISOString()
    }, {
        id: 6,
        bill_id: 3,
        service_type: 'fabric',
        amount: 1000,
        created_at: new Date().toISOString()
    }],
    salaries: [{
        id: 1,
        worker_name: 'Maya Singh',
        amount: 12000,
        date: '2025-04-01',
        payment_mode: 'cash',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }, {
        id: 2,
        worker_name: 'Rahul Verma',
        amount: 15000,
        date: '2025-04-01',
        payment_mode: 'gpay',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }, {
        id: 3,
        worker_name: 'Maya Singh',
        amount: 4000,
        date: '2025-03-15',
        payment_mode: 'cash',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }],
    expenses: [{
        id: 1,
        description: 'Fabric Materials',
        amount: 5000,
        date: '2025-04-05',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }, {
        id: 2,
        description: 'Electricity Bill',
        amount: 3200,
        date: '2025-04-10',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }, {
        id: 3,
        description: 'Shop Rent',
        amount: 15000,
        date: '2025-04-01',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }]
};

// Mock client is handled in supabase-client.js
const _mockClient = {
    auth: {
            signInWithPassword: async ({ email, password }) => {
                // For demo, any non-empty credentials will work
                if (email && password) {
                    return { 
                        data: { user: { id: '1', email } },
                        error: null
                    };
                }
                return { 
                    data: null, 
                    error: { message: 'Invalid login credentials' }
                };
            },
            signOut: async () => {
                return { error: null };
            },
            getUser: async () => {
                // Return a mock user for demonstration
                return { 
                    data: { user: { id: '1', email: 'demo@example.com' } },
                    error: null
                };
            }
        },
        from: (table) => {
            return {
                select: (fields = '*') => {
                    return {
                        single: async () => {
                            // For settings, return a single record
                            if (table === 'settings') {
                                const settings = mockData[table][0] || { 
                                    name: 'Elegance Boutique',
                                    phone: '+91 98765 43210',
                                    address: '123 Fashion Street, Stylish City'
                                };
                                return { data: settings, error: null };
                            }
                            return { data: null, error: { code: 'PGRST116' } };
                        },
                        eq: (field, value) => {
                            return {
                                single: async () => {
                                    // For bills table with services
                                    if (table === 'bills' && fields.includes('services')) {
                                        const bill = mockData[table].find(item => item[field] == value);
                                        if (bill) {
                                            // Find associated services
                                            const services = mockData['services'].filter(service => service.bill_id == bill.id);
                                            // Create a new object with services included as an array
                                            const billWithServices = {
                                                ...bill, 
                                                services: Array.isArray(services) ? services : (services ? [services] : [])
                                            };
                                            return { data: billWithServices, error: null };
                                        }
                                        return { data: null, error: { message: 'Bill not found' } };
                                    }
                                    
                                    // For other tables
                                    const items = mockData[table].filter(item => item[field] == value);
                                    return {
                                        data: items.length > 0 ? items[0] : null,
                                        error: items.length > 0 ? null : { message: 'Not found' }
                                    };
                                }
                            };
                        },
                        order: (field, options) => {
                            const sortedData = [...mockData[table]];
                            sortedData.sort((a, b) => {
                                if (options && options.ascending === false) {
                                    return new Date(b[field]) - new Date(a[field]);
                                }
                                return new Date(a[field]) - new Date(b[field]);
                            });
                            
                            // For bills, include services
                            if (table === 'bills' && fields.includes('services')) {
                                const billsWithServices = sortedData.map(bill => {
                                    const services = mockData['services'].filter(service => service.bill_id === bill.id);
                                    // Ensure services is always an array
                                    return {
                                        ...bill, 
                                        services: Array.isArray(services) ? services : (services.length > 0 ? services : [])
                                    };
                                });
                                return { 
                                    data: billsWithServices,
                                    error: null 
                                };
                            }
                            
                            return { 
                                data: sortedData,
                                error: null 
                            };
                        }
                    };
                },
                insert: (values) => {
                    return {
                        select: () => {
                            const newItem = {
                                id: mockData[table].length + 1,
                                ...values,
                                created_at: new Date().toISOString(),
                                updated_at: new Date().toISOString()
                            };
                            mockData[table].push(newItem);
                            return {
                                single: async () => {
                                    return { data: newItem, error: null };
                                }
                            };
                        }
                    };
                },
                upsert: (values) => {
                    return {
                        select: () => {
                            // If it's settings and we have some, update it
                            if (table === 'settings' && mockData[table].length > 0) {
                                mockData[table][0] = {
                                    ...mockData[table][0],
                                    ...values,
                                    updated_at: new Date().toISOString()
                                };
                                return {
                                    single: async () => {
                                        return { data: mockData[table][0], error: null };
                                    }
                                };
                            }
                            // Otherwise insert as new
                            const newItem = {
                                id: mockData[table].length + 1,
                                ...values,
                                created_at: new Date().toISOString(),
                                updated_at: new Date().toISOString()
                            };
                            mockData[table].push(newItem);
                            return {
                                single: async () => {
                                    return { data: newItem, error: null };
                                }
                            };
                        }
                    };
                },
                update: (values) => {
                    return {
                        eq: (field, value) => {
                            const index = mockData[table].findIndex(item => item[field] == value);
                            if (index !== -1) {
                                mockData[table][index] = {
                                    ...mockData[table][index],
                                    ...values,
                                    updated_at: new Date().toISOString()
                                };
                                return { data: mockData[table][index], error: null };
                            }
                            return { data: null, error: { message: 'Not found' } };
                        }
                    };
                },
                delete: () => {
                    return {
                        eq: (field, value) => {
                            const index = mockData[table].findIndex(item => item[field] == value);
                            if (index !== -1) {
                                mockData[table].splice(index, 1);
                                return { error: null };
                            }
                            return { error: { message: 'Not found' } };
                        }
                    };
                }
            };
        }
    };

// Database functions using Supabase
const db = {
    // Authentication
    async signIn(email, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error signing in:', error.message);
            throw error;
        }
    },
    
    async signOut() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
        } catch (error) {
            console.error('Error signing out:', error.message);
            throw error;
        }
    },
    
    async getCurrentUser() {
        try {
            // First check if we have an active session
            const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
            
            if (sessionError) {
                console.error('Session error:', sessionError.message);
                return null;
            }
            
            if (!sessionData?.session) {
                console.error('Auth session missing!');
                return null;
            }
            
            const { data: userData, error: userError } = await supabase.auth.getUser();
            
            if (userError) {
                console.error('User error:', userError.message);
                return null;
            }
            
            if (!userData?.user) {
                console.error('No user data returned');
                return null;
            }
            
            return userData.user;
        } catch (error) {
            console.error('Error getting user:', error);
            return null;
        }
    },
    
    // Shop Settings
    async getSettings() {
        try {
            // Removed API call to /api/init-tables; Supabase handles tables
            const { data, error } = await supabase
                .from('settings')
                .select('*')
                .eq('id', 1)
                .limit(1);
                
            if (error) {
                console.warn('Supabase error getting settings:', error.message, error.code);
                // Default settings if error
                return {
                    id: 1,
                    name: 'Elegance Boutique',
                    phone: '',
                    address: ''
                };
            }
            
            // If we got data back, return the first item
            if (data && data.length > 0) {
                console.log('Retrieved settings:', data[0]);
                return data[0];
            }
            
            // Default settings if no data is returned
            console.info('No settings found, using defaults');
            return {
                id: 1,
                name: 'Elegance Boutique',
                phone: '',
                address: ''
            };
        } catch (error) {
            console.error('Error getting settings:', error);
            // Return default settings on error
            return {
                id: 1,
                name: 'Elegance Boutique',
                phone: '',
                address: ''
            };
        }
    },
    
    async saveSettings(settings) {
        try {
            console.log('Saving settings to database:', settings);
            
            // First ensure tables are initialized
            try {
                await fetch('/api/init-tables', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });
            } catch (initError) {
                console.warn('Could not initialize tables:', initError);
            }
            
            // Always use ID 1 for settings
            const settingsWithId = {
                id: 1,
                ...settings,
                updated_at: new Date().toISOString()
            };
            
            console.log('Upserting settings with ID:', settingsWithId);
            
            const { data, error } = await supabase
                .from('settings')
                .upsert(settingsWithId)
                .select()
                .single();
            
            if (error) {
                console.error('Error in upsert operation:', error);
                
                // Try a direct update as fallback
                const { data: updateData, error: updateError } = await supabase
                    .from('settings')
                    .update(settings)
                    .eq('id', 1)
                    .select()
                    .single();
                
                if (updateError) {
                    console.error('Error in update operation:', updateError);
                    throw updateError;
                }
                
                console.log('Settings updated successfully via fallback:', updateData);
                return updateData;
            }
            
            console.log('Settings saved successfully:', data);
            return data;
        } catch (error) {
            console.error('Error saving settings:', error);
            throw error;
        }
    },
    
    // Bills
    async getBills() {
        try {
            // Get the current user's ID
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const { data, error } = await supabase
                .from('bills')
                .select('*, services(*)')
                .eq('user_id', user.id)
                .order('date', { ascending: false });
                
            if (error) throw error;
            
            // Ensure each bill has services as an array
            if (data && Array.isArray(data)) {
                data.forEach(bill => {
                    if (!bill.services) {
                        bill.services = [];
                    } else if (!Array.isArray(bill.services)) {
                        bill.services = [bill.services];
                    }
                });
            }
            
            return data || [];
        } catch (error) {
            console.error('Error getting bills:', error.message);
            return [];
        }
    },
    
    async getBill(id) {
        try {
            const { data, error } = await supabase
                .from('bills')
                .select('*, services(*)')
                .eq('id', id)
                .single();
                
            if (error) throw error;
            
            // Ensure services is an array
            if (data) {
                if (!data.services) {
                    data.services = [];
                } else if (!Array.isArray(data.services)) {
                    data.services = [data.services];
                }
            }
            
            return data;
        } catch (error) {
            console.error(`Error getting bill ${id}:`, error.message);
            throw error;
        }
    },
    
    async createBill(bill) {
        try {
            // Get the current user's ID
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            // Extract services from bill
            const { services, ...billData } = bill;
            
            // Add user_id to bill data
            const billWithUserId = {
                ...billData,
                user_id: user.id
            };
            
            // Insert the bill first
            const { data: newBill, error: billError } = await supabase
                .from('bills')
                .insert(billWithUserId)
                .select()
                .single();
                
            if (billError) throw billError;
            
            // Then insert services with the new bill_id and user_id
            if (services && services.length > 0) {
                const servicesWithBillId = services.map(service => ({
                    ...service,
                    bill_id: newBill.id,
                    user_id: user.id
                }));
                
                const { error: servicesError } = await supabase
                    .from('services')
                    .insert(servicesWithBillId);
                    
                if (servicesError) throw servicesError;
            }
            
            // Return the complete bill with services
            return await this.getBill(newBill.id);
        } catch (error) {
            console.error('Error creating bill:', error.message);
            throw error;
        }
    },
    
    async updateBill(bill) {
        try {
            // Extract services and ID
            const { services, id, ...billData } = bill;
            
            // Update the bill
            const { error: billError } = await supabase
                .from('bills')
                .update(billData)
                .eq('id', id);
                
            if (billError) throw billError;
            
            // Delete existing services for this bill
            const { error: deleteError } = await supabase
                .from('services')
                .delete()
                .eq('bill_id', id);
                
            if (deleteError) throw deleteError;
            
            // Insert updated services
            if (services && services.length > 0) {
                const servicesWithBillId = services.map(service => ({
                    ...service,
                    bill_id: id
                }));
                
                const { error: servicesError } = await supabase
                    .from('services')
                    .insert(servicesWithBillId);
                    
                if (servicesError) throw servicesError;
            }
            
            // Return the updated bill
            return await this.getBill(id);
        } catch (error) {
            console.error(`Error updating bill ${bill.id}:`, error.message);
            throw error;
        }
    },
    
    async deleteBill(id) {
        try {
            // Services will be deleted automatically with CASCADE
            const { error } = await supabase
                .from('bills')
                .delete()
                .eq('id', id);
                
            if (error) throw error;
        } catch (error) {
            console.error(`Error deleting bill ${id}:`, error.message);
            throw error;
        }
    },
    
    // Dupattas
    async getDupattas() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const { data, error } = await supabase
                .from('dupattas')
                .select('*')
                .eq('user_id', user.id)
                .order('order_date', { ascending: false });
                
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error getting dupattas:', error.message);
            return [];
        }
    },
    
    async getDupatta(id) {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const { data, error } = await supabase
                .from('dupattas')
                .select('*')
                .eq('id', id)
                .eq('user_id', user.id)
                .single();
                
            if (error) throw error;
            return data;
        } catch (error) {
            console.error(`Error getting dupatta ${id}:`, error.message);
            throw error;
        }
    },
    
    async createDupatta(dupatta) {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const dupattaWithUserId = {
                ...dupatta,
                user_id: user.id
            };

            const { data, error } = await supabase
                .from('dupattas')
                .insert(dupattaWithUserId)
                .select()
                .single();
                
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creating dupatta:', error.message);
            throw error;
        }
    },
    
    async saveDupatta(dupatta) {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const dupattaWithUserId = {
                ...dupatta,
                user_id: user.id
            };

            const { data, error } = await supabase
                .from('dupattas')
                .insert(dupattaWithUserId)
                .select()
                .single();
                
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error saving dupatta:', error.message);
            throw error;
        }
    },
    
    async updateDupatta(dupatta) {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const { id, ...dupattaData } = dupatta;
            
            const { data, error } = await supabase
                .from('dupattas')
                .update({ ...dupattaData, user_id: user.id })
                .eq('id', id)
                .eq('user_id', user.id)
                .select()
                .single();
                
            if (error) throw error;
            return data;
        } catch (error) {
            console.error(`Error updating dupatta ${dupatta.id}:`, error.message);
            throw error;
        }
    },
    
    async deleteDupatta(id) {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const { error } = await supabase
                .from('dupattas')
                .delete()
                .eq('id', id)
                .eq('user_id', user.id);
                
            if (error) throw error;
        } catch (error) {
            console.error(`Error deleting dupatta ${id}:`, error.message);
            throw error;
        }
    },
    
    // Salaries
    async getSalaries() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const { data, error } = await supabase
                .from('salaries')
                .select('*')
                .eq('user_id', user.id)
                .order('date', { ascending: false });
                
            if (error) throw error;
            
            // Add default payment_mode for client-side display 
            const salariesWithPaymentMode = (data || []).map(salary => ({
                ...salary,
                payment_mode: 'cash' // Default value for display purposes
            }));
            
            return salariesWithPaymentMode;
        } catch (error) {
            console.error('Error getting salaries:', error.message);
            return [];
        }
    },
    
    async createSalary(salary) {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            // Make a copy to avoid modifying the original object
            const salaryData = { ...salary };
            
            // Ensure payment_mode is not included if it doesn't exist in the database
            delete salaryData.payment_mode;
            
            // Add user_id
            salaryData.user_id = user.id;
            
            console.log('Creating salary with data:', salaryData);
            
            const { data, error } = await supabase
                .from('salaries')
                .insert(salaryData)
                .select()
                .single();
                
            if (error) {
                console.error('Supabase error creating salary:', error);
                throw error;
            }
            
            // Add a default payment_mode for client-side display
            data.payment_mode = 'cash';
            
            return data;
        } catch (error) {
            console.error('Error creating salary:', error.message);
            throw error;
        }
    },
    
    async updateSalary(salary) {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            // Extract ID and make a clean copy of salary data
            const { id, ...salaryDataWithPotentialPaymentMode } = salary;
            
            // Create a clean copy without payment_mode
            const salaryData = { ...salaryDataWithPotentialPaymentMode };
            delete salaryData.payment_mode;
            
            // Add user_id
            salaryData.user_id = user.id;
            
            console.log('Updating salary with data:', salaryData);
            
            const { data, error } = await supabase
                .from('salaries')
                .update(salaryData)
                .eq('id', id)
                .eq('user_id', user.id)
                .select()
                .single();
                
            if (error) {
                console.error('Supabase error updating salary:', error);
                throw error;
            }
            
            // Add a default payment_mode for client-side display
            data.payment_mode = 'cash';
            
            return data;
        } catch (error) {
            console.error(`Error updating salary ${salary.id}:`, error.message);
            throw error;
        }
    },
    
    async deleteSalary(id) {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const { error } = await supabase
                .from('salaries')
                .delete()
                .eq('id', id)
                .eq('user_id', user.id);
                
            if (error) throw error;
        } catch (error) {
            console.error(`Error deleting salary ${id}:`, error.message);
            throw error;
        }
    },
    
    // Expenses
    async getExpenses() {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const { data, error } = await supabase
                .from('expenses')
                .select('*')
                .eq('user_id', user.id)
                .order('date', { ascending: false });
                
            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error getting expenses:', error.message);
            return [];
        }
    },
    
    async createExpense(expense) {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const expenseWithUserId = {
                ...expense,
                user_id: user.id
            };

            const { data, error } = await supabase
                .from('expenses')
                .insert(expenseWithUserId)
                .select()
                .single();
                
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error creating expense:', error.message);
            throw error;
        }
    },
    
    async updateExpense(expense) {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const { id, ...expenseData } = expense;
            
            const { data, error } = await supabase
                .from('expenses')
                .update({ ...expenseData, user_id: user.id })
                .eq('id', id)
                .eq('user_id', user.id)
                .select()
                .single();
                
            if (error) throw error;
            return data;
        } catch (error) {
            console.error(`Error updating expense ${expense.id}:`, error.message);
            throw error;
        }
    },
    
    async deleteExpense(id) {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('User not authenticated');

            const { error } = await supabase
                .from('expenses')
                .delete()
                .eq('id', id)
                .eq('user_id', user.id);
                
            if (error) throw error;
        } catch (error) {
            console.error(`Error deleting expense ${id}:`, error.message);
            throw error;
        }
    }
};