/**
 * Quick Fix Script for Super Admin Token
 * 
 * Run this in your browser console to fix the 403 permission error
 * 
 * Instructions:
 * 1. Open your dashboard in browser
 * 2. Press F12 to open Developer Tools
 * 3. Go to Console tab
 * 4. Paste and run this entire script
 * 5. Refresh the page
 */

console.log('🔧 Eagle Dashboard - Super Admin Token Fix');
console.log('==========================================');

// Super admin token from backend
const SUPER_ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MDNlZjdkYzIyM2EzNWUwNDc0OGVjNCIsImVtYWlsIjoicmFzZWxob3NzYWluODY2NjZAZ21haWwuY29tIiwicm9sZSI6InN1cGVyYWRtaW4iLCJuYW1lIjoiUmFzZWwgSG9zc2FpbiIsImlhdCI6MTc2MjAxODg3MiwiZXhwIjoxNzYyNjIzNjcyfQ.wAWdDBd7mynwos5FyA_kMd_6tMbS7ZrCEaPNnr9S3z0';

function fixSuperAdminToken() {
    try {
        // Step 1: Clear all existing tokens and data
        console.log('🧹 Clearing existing tokens...');
        
        // Clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('user_data');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('tokenTimestamp');
        
        // Clear all cookies
        document.cookie.split(";").forEach(function(c) { 
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
        });
        
        console.log('✅ Cleared existing data');
        
        // Step 2: Set super admin token
        console.log('🔐 Setting super admin token...');
        
        // Set in localStorage
        localStorage.setItem('token', SUPER_ADMIN_TOKEN);
        localStorage.setItem('tokenTimestamp', Date.now().toString());
        
        // Set in cookie
        const maxAge = 7 * 24 * 60 * 60; // 7 days
        document.cookie = `token=${encodeURIComponent(SUPER_ADMIN_TOKEN)}; max-age=${maxAge}; path=/; SameSite=Strict`;
        
        console.log('✅ Super admin token set');
        
        // Step 3: Verify token
        console.log('🔍 Verifying token...');
        
        // Decode and check token
        const tokenParts = SUPER_ADMIN_TOKEN.split('.');
        const payload = JSON.parse(atob(tokenParts[1]));
        
        console.log('👤 Token payload:', payload);
        console.log('🏷️  User Role:', payload.role);
        console.log('📧 Email:', payload.email);
        console.log('⏰ Expires:', new Date(payload.exp * 1000));
        
        if (payload.role === 'superadmin') {
            console.log('✅ Super admin role verified!');
        } else {
            console.log('❌ Role verification failed');
        }
        
        // Step 4: Instructions
        console.log('\n🎉 SUCCESS! Super admin token has been set.');
        console.log('📝 Next steps:');
        console.log('   1. Refresh the page (F5 or Ctrl+R)');
        console.log('   2. Navigate to subscriber profiles');
        console.log('   3. You should now have admin access');
        
        return true;
        
    } catch (error) {
        console.error('❌ Error fixing token:', error);
        return false;
    }
}

// Run the fix
const success = fixSuperAdminToken();

if (success) {
    console.log('\n🚀 Ready to refresh! Press F5 or Ctrl+R to reload the page.');
} else {
    console.log('\n💥 Fix failed. Please try again or contact support.');
}

// Also make the function available globally for manual execution
window.fixSuperAdminToken = fixSuperAdminToken;