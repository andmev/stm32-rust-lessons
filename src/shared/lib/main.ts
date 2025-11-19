console.log("STM32 Rust Lessons - Loaded");

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded and parsed");
    
    // Listen for page transitions if needed
    window.addEventListener('page-transition', () => {
        // Add any page-specific initialization here
        console.log("Page transition completed");
    });
});

