// public/import-meta-polyfill.js

// Polyfill for import.meta
(function() {
    if (typeof window !== 'undefined') {
      // Create a mock import object if it doesn't exist
      if (!window.import) {
        window.import = {};
      }
      
      // Create a mock meta property if it doesn't exist
      if (!window.import.meta) {
        window.import.meta = {};
      }
      
      // Provide a hot property with necessary methods
      if (!window.import.meta.hot) {
        window.import.meta.hot = {
          accept: function() {},
          dispose: function() {},
          invalidate: function() {},
          decline: function() {},
          on: function() {}
        };
      }
      
      // Add the URL for completeness
      if (!window.import.meta.url) {
        window.import.meta.url = window.location.href;
      }
      
      console.log('import.meta polyfill loaded');
    }
  })();