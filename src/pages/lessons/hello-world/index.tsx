import { h } from '@jsx/html';
import { Layout } from '@app/Layout';

interface PageProps {
  cssContent: string;
}

export function Page({ cssContent }: PageProps): string {
  const content = (
    <main>
      <h1>Hello World (Blinky)</h1>
      <p>Welcome to your first lesson! In the embedded world, "Hello World" usually means blinking an LED.</p>

      <h2>Prerequisites</h2>
      <ul>
        <li>STM32 Development Board</li>
        <li>Rust Toolchain installed</li>
      </ul>

      <h2>The Code</h2>
      <pre><code>{`// Pseudo-code for blinky
#[entry]
fn main() -> ! {
    let peripherals = Peripherals::take().unwrap();
    let mut led = peripherals.gpioa.odr;
    
    loop {
        led.toggle();
        delay(1000);
    }
}`}</code></pre>

      <p><a href="/" className="btn">Back to Home</a></p>
    </main>
  );

  return Layout({
    title: 'Hello World (Blinky) - STM32 Rust Lessons',
    description: 'Your first embedded Rust program: Blinking an LED on STM32.',
    children: content.toString(),
    cssContent,
  });
}

