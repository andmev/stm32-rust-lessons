import { h } from '@jsx/html';
import { Layout } from '@app/Layout';

interface PageProps {
  cssContent: string;
  basePath?: string;
}

export function Page({ cssContent, basePath }: PageProps): string {
  const content = (
    <main>
      <h1>Welcome to STM32 Rust Lessons</h1>
      <p>Master embedded Rust programming on STM32 microcontrollers with our comprehensive tutorials and examples.</p>
      
      <h2>Available Lessons</h2>
      <ul>
        <li><a href="/lessons/hello-world/">Hello World (Blinky)</a></li>
      </ul>
    </main>
  );

  return Layout({
    title: 'STM32 Rust Lessons',
    description: 'Learn embedded Rust on STM32 microcontrollers.',
    children: content.toString(),
    cssContent,
    basePath,
  });
}

