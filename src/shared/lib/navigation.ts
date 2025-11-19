/**
 * View Transition API Navigation Library
 * Provides smooth page transitions using the View Transition API
 */

interface ViewTransitionNavigation {
    init: () => void;
    navigate: (href: string, isPopState?: boolean) => Promise<void>;
}

declare global {
    interface Window {
        ViewTransitionNavigation: ViewTransitionNavigation;
    }
}

(function() {
    'use strict';

    let isNavigating = false;

    /**
     * Check if View Transition API is supported
     */
    function isViewTransitionSupported(): boolean {
        return 'startViewTransition' in document;
    }

    /**
     * Check if a link should be handled by the navigation system
     */
    function shouldHandleLink(anchor: HTMLAnchorElement): boolean {
        const href = anchor.getAttribute('href');
        if (!href) return false;
        
        // Skip if it's an external link, hash link, or has special attributes
        if (
            anchor.target === '_blank' ||
            anchor.hasAttribute('download') ||
            href.startsWith('#') ||
            href.startsWith('mailto:') ||
            href.startsWith('tel:') ||
            href.startsWith('javascript:')
        ) {
            return false;
        }

        // Check if it's a same-origin link
        try {
            const url = new URL(href, window.location.origin);
            return url.origin === window.location.origin;
        } catch {
            return false;
        }
    }

    /**
     * Navigate to a new page and update the DOM
     */
    async function navigateToPage(href: string, isPopState: boolean = false): Promise<void> {
        if (isNavigating) return;
        isNavigating = true;

        try {
            // Fetch the new page
            const response = await fetch(href);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // Update the document title
            document.title = doc.title;

            // Update the main content areas
            const oldMain = document.querySelector('main');
            const newMain = doc.querySelector('main');
            if (oldMain && newMain) {
                oldMain.replaceWith(newMain);
            }

            const oldHeader = document.querySelector('header');
            const newHeader = doc.querySelector('header');
            if (oldHeader && newHeader) {
                oldHeader.replaceWith(newHeader);
            }

            const oldFooter = document.querySelector('footer');
            const newFooter = doc.querySelector('footer');
            if (oldFooter && newFooter) {
                oldFooter.replaceWith(newFooter);
            }

            // Update the URL without reloading
            // Use replaceState for popstate, pushState for regular navigation
            if (isPopState) {
                window.history.replaceState({}, '', href);
            } else {
                window.history.pushState({}, '', href);
            }

            // Dispatch a custom event for any additional initialization
            window.dispatchEvent(new Event('page-transition'));
        } catch (error) {
            console.error('Navigation failed:', error);
            // Fallback to normal navigation
            window.location.href = href;
        } finally {
            isNavigating = false;
        }
    }

    /**
     * Initialize the navigation system
     */
    function init(): void {
        // Check if View Transition API is supported
        if (!isViewTransitionSupported()) {
            console.warn("View Transition API not supported in this browser");
            return;
        }

        // Intercept all internal link clicks
        document.addEventListener('click', async (e: MouseEvent) => {
            const anchor = (e.target as HTMLElement).closest('a[href]') as HTMLAnchorElement | null;
            if (!anchor || !shouldHandleLink(anchor)) {
                return;
            }

            const href = anchor.getAttribute('href');
            if (!href) return;
            
            e.preventDefault();
            
            // Start view transition
            if (document.startViewTransition) {
                const transition = document.startViewTransition(() => {
                    navigateToPage(href, false);
                });

                try {
                    await transition.finished;
                } catch (err) {
                    console.error('View transition failed:', err);
                }
            } else {
                navigateToPage(href, false);
            }
        });

        // Handle browser back/forward buttons
        window.addEventListener('popstate', async (e: PopStateEvent) => {
            if (!isViewTransitionSupported() || isNavigating) {
                return;
            }

            if (document.startViewTransition) {
                const transition = document.startViewTransition(() => {
                    navigateToPage(window.location.pathname, true);
                });

                try {
                    await transition.finished;
                } catch (err) {
                    console.error('View transition failed:', err);
                }
            } else {
                navigateToPage(window.location.pathname, true);
            }
        });
    }

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Export for manual initialization if needed
    window.ViewTransitionNavigation = {
        init: init,
        navigate: navigateToPage
    };
})();

// Export empty object to make this file a module (required for declare global)
export {};

