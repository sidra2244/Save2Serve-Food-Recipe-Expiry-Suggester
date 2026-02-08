
// cookie.js - Fixed Cookie Management System

const CookieMaster = {
  // Set cookie - FIXED VERSION
  setCookie: function(name, value, days = 30) {
    try {
      let expires = "";
      if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
      }
      
      // IMPORTANT: For local development, don't set domain
      // Only set domain if not localhost
      let domainPart = '';
      const hostname = window.location.hostname;
      if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
        domainPart = '; domain=' + hostname;
      }
      
      const cookieString = `${name}=${encodeURIComponent(value)}${expires}; path=/${domainPart}; SameSite=Lax`;
      document.cookie = cookieString;
      
      console.log(`✅ Cookie SET: ${name}=${value}`);
      console.log(`🔧 Cookie string: ${cookieString}`);
      return true;
    } catch (error) {
      console.error(`❌ Error setting cookie ${name}:`, error);
      return false;
    }
  },

  // Get cookie value - FIXED VERSION
  getCookie: function(name) {
    try {
      const nameEQ = name + "=";
      const ca = document.cookie.split(';');
      
      for(let i = 0; i < ca.length; i++) {
        let c = ca[i].trim(); // Trim spaces properly
        if (c.indexOf(nameEQ) === 0) {
          const value = decodeURIComponent(c.substring(nameEQ.length));
          console.log(`🔍 Cookie GET: ${name}=${value}`);
          return value;
        }
      }
      console.log(`🔍 Cookie NOT FOUND: ${name}`);
      return null;
    } catch (error) {
      console.error(`❌ Error getting cookie ${name}:`, error);
      return null;
    }
  },

  // Get all cookies - FIXED VERSION
  getAllCookies: function() {
    try {
      const cookies = {};
      
      // Check if document.cookie exists and has content
      if (!document.cookie || document.cookie.trim() === '') {
        console.log('📋 No cookies found (document.cookie is empty)');
        return cookies;
      }
      
      console.log('📋 Raw document.cookie:', document.cookie);
      
      const cookieArray = document.cookie.split(';');
      
      cookieArray.forEach(cookie => {
        const trimmed = cookie.trim();
        if (trimmed) {
          const equalsIndex = trimmed.indexOf('=');
          if (equalsIndex !== -1) {
            const name = trimmed.substring(0, equalsIndex);
            const value = decodeURIComponent(trimmed.substring(equalsIndex + 1));
            cookies[name] = value;
          }
        }
      });
      
      console.log('📋 Parsed cookies:', cookies);
      return cookies;
    } catch (error) {
      console.error('❌ Error getting all cookies:', error);
      return {};
    }
  },

  // Delete cookie
  deleteCookie: function(name) {
    // Set expiration in the past
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    console.log(`🗑️ Cookie DELETED: ${name}`);
  },

  // Check if user has given consent
  hasConsent: function() {
    const consent = this.getCookie('cookie_consent');
    console.log(`🎯 Has consent? ${consent !== null ? 'Yes: ' + consent : 'No'}`);
    return consent !== null;
  },

  // Set consent level - FIXED VERSION
  setConsent: function(level) {
    console.log(`🎯 Setting consent to: ${level}`);
    
    // Always set session cookie
    const sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    this.setCookie('session_id', sessionId, 1);
    
    // Set consent cookie
    this.setCookie('cookie_consent', level, 365);
    
    // Update based on consent level
    if (level === 'all') {
      // Analytics cookie
      this.setCookie('analytics', 'enabled', 365);
      
      // User preferences
      let visits = 1;
      const existingPrefs = this.getCookie('user_preferences');
      if (existingPrefs) {
        try {
          const parsed = JSON.parse(existingPrefs);
          visits = (parsed.visits || 0) + 1;
        } catch (e) {
          console.log('No existing preferences found');
        }
      }
      
      const preferences = {
        theme: 'light',
        language: 'en',
        lastVisit: new Date().toISOString(),
        visits: visits
      };
      
      this.setCookie('user_preferences', JSON.stringify(preferences), 365);
      
    } else if (level === 'necessary') {
      // Remove analytics if exists
      this.deleteCookie('analytics');
      this.deleteCookie('user_preferences');
    } else if (level === 'reject') {
      // Remove all non-essential
      this.deleteCookie('analytics');
      this.deleteCookie('user_preferences');
    }
    
    // Update UI
    this.updateUI(level);
    
    // Show confirmation
    this.showToast(`Cookies ${level === 'reject' ? 'rejected' : 'accepted'}!`, 'success');
    
    // Hide popup
    this.hidePopup();
    
    // Debug: Show all cookies
    setTimeout(() => {
      console.log('=== FINAL COOKIE STATE ===');
      console.log('document.cookie:', document.cookie);
      console.log('All cookies:', this.getAllCookies());
      console.log('=======================');
    }, 100);
  },

  // Update UI elements
  updateUI: function(level) {
    const statusElements = document.querySelectorAll('#cookieStatus');
    const statusText = level === 'all' ? 'All Accepted' : 
                      level === 'necessary' ? 'Necessary Only' : 
                      level === 'reject' ? 'Rejected' : 'Not Set';
    
    statusElements.forEach(element => {
      element.textContent = statusText;
      
      if (level === 'all') {
        element.style.color = '#4CAF50';
      } else if (level === 'necessary') {
        element.style.color = '#FF9000';
      } else if (level === 'reject') {
        element.style.color = '#F44336';
      } else {
        element.style.color = '#666';
      }
    });
  },

  // Show toast message
  showToast: function(message, type = 'info') {
    // Remove existing toast
    const existingToast = document.querySelector('.cookie-toast');
    if (existingToast) {
      existingToast.remove();
    }
    
    // Create new toast
    const toast = document.createElement('div');
    toast.className = `cookie-toast cookie-toast-${type}`;
    toast.innerHTML = `
      <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
      <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.remove();
        }
      }, 300);
    }, 3000);
  },

  // Show cookie popup
  showPopup: function() {
    const popup = document.getElementById('cookiePopup');
    if (popup) {
      popup.style.display = 'block';
      console.log('👀 Cookie popup shown');
    }
  },

  // Hide cookie popup
  hidePopup: function() {
    const popup = document.getElementById('cookiePopup');
    if (popup) {
      popup.style.display = 'none';
      console.log('👻 Cookie popup hidden');
    }
  },

  // Reject all non-essential cookies
  rejectAll: function() {
    this.setConsent('reject');
  },

  // Initialize cookie system
  init: function() {
    console.log('=== COOKIE MASTER INITIALIZING ===');
    console.log('Hostname:', window.location.hostname);
    console.log('Initial document.cookie:', document.cookie);
    
    // Add CSS styles
    this.addStyles();
    
    // Check existing consent
    const consent = this.getCookie('cookie_consent');
    
    if (consent) {
      this.updateUI(consent);
      console.log(`✅ Existing consent found: ${consent}`);
    } else {
      // Show popup after 1 second
      setTimeout(() => {
        this.showPopup();
      }, 1000);
      console.log('❓ No consent found, showing popup');
    }
    
    // Set session cookie if not exists
    if (!this.getCookie('session_id')) {
      const sessionId = 'sess_' + Date.now();
      this.setCookie('session_id', sessionId, 1);
    }
    
    // Debug info
    console.log('=== INITIALIZATION COMPLETE ===');
    console.log('All cookies:', this.getAllCookies());
    
    // Make functions globally available (REPLACED CookieManager)
    window.acceptAllCookies = () => this.setConsent('all');
    window.acceptNecessaryCookies = () => this.setConsent('necessary');
    window.rejectAllCookies = () => this.rejectAll();
    window.showCookiePopup = () => this.showPopup();
    window.CookieManager = this; // Backward compatibility
  },

  // Add CSS styles
  addStyles: function() {
    if (document.querySelector('#cookie-master-styles')) {
      return; // Already added
    }
    
    const style = document.createElement('style');
    style.id = 'cookie-master-styles';
    style.textContent = `
      /* Toast notifications */
      .cookie-toast {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 12px;
        transform: translateX(120%);
        transition: transform 0.3s ease;
        max-width: 350px;
        border-left: 4px solid #4CAF50;
      }
      
      .cookie-toast.show {
        transform: translateX(0);
      }
      
      .cookie-toast-success {
        border-left-color: #4CAF50;
      }
      
      .cookie-toast-info {
        border-left-color: #2196F3;
      }
      
      .cookie-toast i {
        font-size: 20px;
      }
      
      .cookie-toast-success i {
        color: #4CAF50;
      }
      
      .cookie-toast-info i {
        color: #2196F3;
      }
    `;
    
    document.head.appendChild(style);
  },

  // Debug function to test cookies
  debugCookies: function() {
    console.log('=== COOKIE DEBUG ===');
    console.log('1. document.cookie:', document.cookie);
    console.log('2. navigator.cookieEnabled:', navigator.cookieEnabled);
    console.log('3. All parsed cookies:', this.getAllCookies());
    
    // Try to manually read cookies
    const cookies = {};
    if (document.cookie) {
      document.cookie.split(';').forEach(pair => {
        const [key, value] = pair.trim().split('=');
        if (key && value) {
          cookies[key] = decodeURIComponent(value);
        }
      });
    }
    
    console.log('4. Manual parsing:', cookies);
    
    // Try to set a test cookie
    document.cookie = "debug_test=123; path=/; max-age=60";
    console.log('5. After setting test cookie:', document.cookie);
    
    return cookies;
  }
};

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM fully loaded, initializing CookieMaster');
    CookieMaster.init();
  });
} else {
  console.log('📄 DOM already loaded, initializing CookieMaster now');
  CookieMaster.init();
}

// Make available globally
window.CookieMaster = CookieMaster;

// Debug: Check if loaded
console.log('🍪 cookie.js loaded successfully!');
console.log('Window.CookieMaster:', typeof window.CookieMaster);