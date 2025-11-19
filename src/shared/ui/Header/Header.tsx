import { h } from '@jsx/html';
// Header.css will be included in the bundled CSS

export function Header(): string {
  return (
    <header>
      <nav>
        <a href="/" style="font-weight: bold; font-size: 1.2rem;">STM32 Rust Lessons</a>
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/about/">About</a></li>
        </ul>
      </nav>
    </header>
  );
}

