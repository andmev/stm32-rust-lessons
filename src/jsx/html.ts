/**
 * Custom JSX Factory for Static HTML Generation
 * Converts JSX syntax to HTML strings without React
 */

export type JSXElement = string | number | null | undefined | JSXElement[];

export interface JSXAttributes {
  [key: string]: string | number | boolean | undefined | null;
}

/**
 * Custom JSX factory function (h)
 * Transforms JSX elements into HTML strings
 */
export function h(
  tag: string | ((props: any) => string),
  props: JSXAttributes | null,
  ...children: JSXElement[]
): string {
  // If tag is a function (component), call it with props and children
  if (typeof tag === 'function') {
    return tag({ ...props, children });
  }

  // Handle fragments (empty string tag)
  if (tag === '') {
    return renderChildren(children);
  }

  // Process attributes
  const attrs = props ? renderAttributes(props) : '';

  // Process children
  const content = renderChildren(children);

  // Self-closing tags
  const selfClosingTags = [
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
    'link', 'meta', 'param', 'source', 'track', 'wbr'
  ];

  if (selfClosingTags.includes(tag.toLowerCase()) && !content) {
    return `<${tag}${attrs} />`;
  }

  return `<${tag}${attrs}>${content}</${tag}>`;
}

/**
 * Render JSX children to HTML string
 */
function renderChildren(children: JSXElement[]): string {
  return children
    .filter(child => child !== null && child !== undefined)
    .map(child => {
      if (Array.isArray(child)) {
        return renderChildren(child);
      }
      return String(child);
    })
    .join('');
}

/**
 * Render JSX attributes to HTML attribute string
 */
function renderAttributes(props: JSXAttributes): string {
  const attrs: string[] = [];

  for (const [key, value] of Object.entries(props)) {
    if (value === null || value === undefined || value === false) {
      continue;
    }

    // Handle special cases
    if (key === 'className') {
      attrs.push(`class="${escapeHtml(String(value))}"`);
    } else if (key === 'htmlFor') {
      attrs.push(`for="${escapeHtml(String(value))}"`);
    } else if (key === 'dangerouslySetInnerHTML') {
      // Skip - handled separately
      continue;
    } else if (key.startsWith('on') && typeof value === 'function') {
      // Skip event handlers for static HTML
      continue;
    } else if (typeof value === 'boolean' && value === true) {
      // Boolean attributes (e.g., disabled, checked)
      attrs.push(key);
    } else {
      attrs.push(`${key}="${escapeHtml(String(value))}"`);
    }
  }

  return attrs.length > 0 ? ' ' + attrs.join(' ') : '';
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Fragment component for JSX fragments (<>...</>)
 */
export function Fragment(props: { children?: JSXElement }): string {
  if (props.children === undefined) {
    return '';
  }
  if (Array.isArray(props.children)) {
    return renderChildren(props.children);
  }
  return String(props.children);
}

// Export h as default for JSX factory
export default h;

