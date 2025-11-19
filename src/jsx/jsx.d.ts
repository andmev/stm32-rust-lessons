/**
 * JSX type definitions for static HTML generation
 */

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
    
    type Element = string;
  }
}

export {};

