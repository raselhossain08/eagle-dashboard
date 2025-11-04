/**
 * Super Admin Token Setter for Cookies
 * 
 * Browser console এ run করার জন্য script
 */

console.log('🍪 Setting Super Admin Token in Cookies');
console.log('=======================================');

// Fresh super admin token
const SUPER_ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MDNlZjdkYzIyM2EzNWUwNDc0OGVjNCIsImVtYWlsIjoicmFzZWxob3NzYWluODY2NjZAZ21haWwuY29tIiwicm9sZSI6InN1cGVyYWRtaW4iLCJuYW1lIjoiUmFzZWwgSG9zc2FpbiIsImlhdCI6MTc2MjAxOTMyMiwiZXhwIjoxNzYyNjI0MTIyfQ.tygIiXYNO0RHYsne2pLQaaJDJEH7jZ-Jmg8sqithf-I';

function setSuperAdminTokenInCookies() {
    try {
        console.log('🧹 Clearing existing cookies...');
        
        // Clear all existing cookies
        document.cookie.split(";").forEach(function(c) { 
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
        });
        
        console.log('🔐 Setting super admin token in cookies...');
        
        // Set token cookie
        const maxAge = 7 * 24 * 60 * 60; // 7 days in seconds
        document.cookie = `token=${encodeURIComponent(SUPER_ADMIN_TOKEN)}; max-age=${maxAge}; path=/; SameSite=Strict`;
        
        // Also set in localStorage as backup
        localStorage.setItem('token', SUPER_ADMIN_TOKEN);
        localStorage.setItem('tokenTimestamp', Date.now().toString());
        
        console.log('✅ Token set successfully!');
        
        // Verify cookie was set
        const cookies = document.cookie.split(';');
        let tokenFound = false;
        
        for (const cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'token' && value) {
                console.log('✅ Token cookie verified');
                tokenFound = true;
                
                // Decode and show token info
                const tokenParts = SUPER_ADMIN_TOKEN.split('.');
                const payload = JSON.parse(atob(tokenParts[1]));
                console.log('👤 User:', payload.name);
                console.log('🏷️  Role:', payload.role);
                console.log('📧 Email:', payload.email);
                console.log('⏰ Expires:', new Date(payload.exp * 1000));
                break;
            }
        }
        
        if (!tokenFound) {
            console.log('❌ Token cookie not found');
            return false;
        }
        
        console.log('\n🎉 SUCCESS! Super admin token set in cookies.');
        console.log('📝 Next steps:');
        console.log('   1. Refresh this page (F5)');
        console.log('   2. Go to subscriber profiles');
        console.log('   3. You should have admin access now');
        
        return true;
        
    } catch (error) {
        console.error('❌ Error setting token:', error);
        return false;
    }
}

// Run the function
setSuperAdminTokenInCookies();

// Make it available globally
window.setSuperAdminTokenInCookies = setSuperAdminTokenInCookies;