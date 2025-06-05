# Supabase Setup Guide for Boutique Manager

This guide will walk you through setting up Supabase as the backend for the Boutique Manager application.

## Step 1: Create a Supabase Account and Project

1. Go to [Supabase.com](https://supabase.com/) and sign up for an account if you don't have one.
2. Once logged in, create a new project by clicking the "New Project" button.
3. Give your project a name (e.g., "Boutique Manager").
4. Set a secure database password (make sure to save this somewhere safe).
5. Choose a region closest to your location.
6. Click "Create new project" and wait for the project to be created.

## Step 2: Create Tables in Supabase

Once your project is created, you'll need to set up the database tables.

1. In your Supabase project dashboard, go to the SQL Editor tab.
2. Create a new query.
3. Copy and paste the contents of the `supabase_tables.sql` file into the SQL Editor.
4. Run the SQL query to create all the required tables.

## Step 3: Set Up Authentication

1. In your Supabase project dashboard, go to the Authentication tab.
2. Under "Authentication", click on "Settings".
3. Make sure "Email" is enabled as a sign-in provider.
4. Go to "Users" and click "Invite" to create a new user or use the "Add User" button.
5. Enter the email address and password for your admin user.

## Step 4: Get Your API Credentials

1. In your Supabase project dashboard, go to the "Settings" tab (gear icon).
2. Click on "API" in the sidebar.
3. Copy the "URL" value - this is your Supabase project URL.
4. Copy the "anon public" key - this is your Supabase API key.

## Step 5: Configure the Application

1. Open the `js/supabase-client.js` file in the boutique manager application.
2. Replace the placeholder values with your actual Supabase credentials:

```javascript
const SUPABASE_URL = 'your-supabase-project-url';
const SUPABASE_KEY = 'your-supabase-anon-key';
```

## Step 6: Test the Application

1. Open the application in your browser and try to log in with the user you created in Supabase.
2. If login is successful, you should be able to see the main application interface.
3. Try creating a bill, dupatta order, salary record, or expense entry to verify that the Supabase integration is working correctly.

## Troubleshooting

### Login Issues
- Make sure the email and password match what you set up in Supabase.
- Check that you've entered the correct Supabase URL and API key.

### Database Issues
- Ensure all tables were created successfully using the SQL query.
- Check if there are any error messages in the browser console.

### Row Level Security (RLS)
- For production use, you should set up Row Level Security in Supabase to restrict access to your data.
- By default, all tables created have no RLS policies, meaning anyone with your anon key can read/write to these tables.

## Next Steps

Once the basic setup is working, you might want to consider:

1. Setting up Row Level Security (RLS) policies in Supabase for better data protection.
2. Adding more users with different roles and permissions.
3. Setting up database backups in Supabase.
4. Adding additional features to the Boutique Manager application.