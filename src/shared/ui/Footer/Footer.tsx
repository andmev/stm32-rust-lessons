import { h } from '@jsx/html';
// Footer.css will be included in the bundled CSS

export function Footer(): string {
  return (
    <footer>
      <div class="footer-container">
        <div class="footer-links">
          <a href="/about/" class="footer-link">About</a>
          <a href="/" class="footer-link">Lessons</a>
        </div>
        <p class="footer-copyright">&copy; 2024 STM32 Rust Lessons</p>
      </div>
    </footer>
  );
}
