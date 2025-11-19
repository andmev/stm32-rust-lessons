import { h } from '@jsx/html';
import { Layout } from '@app/Layout';

interface PageProps {
  cssContent: string;
}

export function Page({ cssContent }: PageProps): string {
  const content = (
    <main>
      <h1>About This Project</h1>
      <p>This project aims to provide high-quality, open-source educational resources for learning embedded Rust on STM32
        microcontrollers.</p>
      <p>We cover everything from basic "Hello World" blinky programs to advanced topics like RTIC, Embassy, and wireless
        communication.</p>
    </main>
  );

  return Layout({
    title: 'About - STM32 Rust Lessons',
    description: 'About STM32 Rust Lessons project.',
    children: content.toString(),
    cssContent,
  });
}

