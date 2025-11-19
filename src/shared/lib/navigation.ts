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
     * Get the base path for the application
     * On GitHub Pages, this would be something like '/stm32-rust-lessons/'
     * On localhost, this would be '/'
     */
    function getBasePath(): string {
        // Check for a base tag first
        const baseTag = document.querySelector('base');
        if (baseTag && baseTag.href) {
            try {
                const baseUrl = new URL(baseTag.href);
                return baseUrl.pathname.endsWith('/') ? baseUrl.pathname : baseUrl.pathname + '/';
            } catch {
                // fall through
            }
        }
        
        // Detect base path from the script tag that loads our JS
        // The script is at /js/index.js or /stm32-rust-lessons/js/index.js
        const scriptTag = document.querySelector('script[src*="/js/index.js"]');
        if (scriptTag) {
            const src = (scriptTag as HTMLScriptElement).src;
            try {
                const scriptUrl = new URL(src);
                const scriptPath = scriptUrl.pathname;
                // Extract base path: /js/index.js -> /, /stm32-rust-lessons/js/index.js -> /stm32-rust-lessons/
                const jsIndex = scriptPath.indexOf('/js/index.js');
                if (jsIndex > 0) {
                    return scriptPath.substring(0, jsIndex) + '/';
                } else if (jsIndex === 0) {
                    return '/';
                }
            } catch {
                // fall through
            }
        }
        
        // Fallback: detect from current pathname
        // If we're on GitHub Pages (github.io domain), extract repo name
        if (window.location.hostname.includes('github.io')) {
            const pathname = window.location.pathname;
            const parts = pathname.split('/').filter(p => p);
            // GitHub Pages URLs are: /repo-name/page-path
            // The first part is usually the repo name
            if (parts.length > 0) {
                // Check if first part looks like a repo name (not a known page route)
                const knownRoutes = ['', 'about', 'lessons'];
                const firstPart = parts[0];
                if (!knownRoutes.includes(firstPart)) {
                    // First part is likely the repo name
                    return '/' + firstPart + '/';
                }
            }
        }
        
        // Default to root
        return '/';
    }

    /**
     * Normalize a href to include the base path if needed
     * This ensures fetch() works correctly on GitHub Pages
     */
    function normalizeHref(href: string): string {
        // If href is already a full URL, return as-is
        if (href.startsWith('http://') || href.startsWith('https://')) {
            return href;
        }
        
        const basePath = getBasePath();
        const cleanBase = basePath === '/' ? '' : basePath.replace(/\/$/, '');
        
        // If href starts with '/', it's an absolute path
        if (href.startsWith('/')) {
            // Check if href already includes the base path
            if (cleanBase && href.startsWith(cleanBase + '/')) {
                // Already includes base path, return as-is
                return href;
            }
            // Prepend the base path if we're on GitHub Pages
            return cleanBase + href;
        }
        
        // Relative path - resolve it relative to current location
        const currentPath = window.location.pathname;
        const currentDir = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
        
        // Resolve relative path
        const resolved = new URL(href, window.location.origin + currentDir);
        return resolved.pathname + resolved.search + resolved.hash;
    }

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
     * Update the DOM with new content (synchronous for View Transition API)
     */
    function updateDOM(doc: Document, href: string, isPopState: boolean): void {
        // Update the document title
        document.title = doc.title;

        // Update the main content areas by updating innerHTML to preserve element identity
        // This allows View Transition API to recognize the same elements
        const oldMain = document.querySelector('main');
        const newMain = doc.querySelector('main');
        if (oldMain && newMain) {
            oldMain.innerHTML = newMain.innerHTML;
        }

        const oldHeader = document.querySelector('header');
        const newHeader = doc.querySelector('header');
        if (oldHeader && newHeader) {
            oldHeader.innerHTML = newHeader.innerHTML;
        }

        const oldFooter = document.querySelector('footer');
        const newFooter = doc.querySelector('footer');
        if (oldFooter && newFooter) {
            oldFooter.innerHTML = newFooter.innerHTML;
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
    }

    /**
     * Navigate to a new page and update the DOM
     */
    async function navigateToPage(href: string, isPopState: boolean = false, useTransition: boolean = false): Promise<void> {
        if (isNavigating) return;
        isNavigating = true;

        try {
            // Normalize href for fetching (includes base path for GitHub Pages)
            const fetchHref = normalizeHref(href);
            
            // Fetch the new page
            const response = await fetch(fetchHref);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // If using transition, wrap DOM update in startViewTransition
            if (useTransition && document.startViewTransition) {
                const transition = document.startViewTransition(() => {
                    updateDOM(doc, href, isPopState);
                });
                // Wait for transition to complete
                try {
                    await transition.finished;
                } catch (err) {
                    // Transition might be skipped, that's okay
                    console.debug('View transition:', err);
                }
            } else {
                // Update DOM directly
                updateDOM(doc, href, isPopState);
            }
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
            
            // Navigate with transition support
            await navigateToPage(href, false, true);
        });

        // Handle browser back/forward buttons
        window.addEventListener('popstate', async (e: PopStateEvent) => {
            if (!isViewTransitionSupported() || isNavigating) {
                return;
            }

            // Navigate with transition support
            await navigateToPage(window.location.pathname, true, true);
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

