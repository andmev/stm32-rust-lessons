import { Layout } from '@app/Layout';
import { h } from '@jsx/html';
import { FloatingImage } from '@shared/ui/FloatingImage/FloatingImage';
import { LessonCard } from '@shared/ui/LessonCard/LessonCard';

interface PageProps {
  cssContent: string;
  basePath?: string;
}

const lessons = [
  {
    id: 1,
    title: 'Environment Setup & First Blinky',
    description: 'Set up the Rust toolchain, install necessary dependencies, and flash your first GPIO-controlled LED application.',
    link: '/lessons/hello-world'
  },
  {
    id: 2,
    title: 'Using the Hardware Abstraction Layer',
    description: 'Explore the STM32 HAL crates for safe, high-level control over peripherals instead of raw register manipulation.',
    link: '/lessons/lesson-2'
  },
  {
    id: 3,
    title: 'External Interrupts and Debouncing',
    description: 'Implement External Interrupts to handle asynchronous input and apply proper debouncing techniques for reliable.',
    link: '/lessons/lesson-3'
  },
  {
    id: 4,
    title: 'Timers and PWM Control',
    description: 'Configure and use on-chip Timers to generate accurate delays and implement Pulse Width Modulation (PWM) for.',
    link: '/lessons/lesson-4'
  },
  {
    id: 5,
    title: 'Real-Time Concurrency (RTIC)',
    description: 'Configure and use on-chip Timers to generate accurate delays and implement Pulse Width Modulation (PWM) for.',
    link: '/lessons/lesson-5'
  },
  {
    id: 6,
    title: 'Serial Communication (UART/USART)',
    description: 'Configure and use on-chip Timers to generate accurate delays and implement Pulse Width Modulation (PWM) for.',
    link: '/lessons/lesson-6'
  },
  {
    id: 7,
    title: 'Asynchronous Networking (EMBASSY)',
    description: 'Utilize the EMBASSY framework to introduce non-blocking, asynchronous I/O and networking capabilities to your.',
    link: '/lessons/lesson-7'
  },
  {
    id: 8,
    title: 'Sensor Protocols (I2C/SPI)',
    description: 'Master bus protocols I2C and SPI to successfully interface with external sensors, displays, and other peripheral.',
    link: '/lessons/lesson-8'
  }
];

export function Page({ cssContent, basePath }: PageProps): string {
  // Floating images - positioned to spread across viewport without overlapping
  const floatingImages = (
    <div class="floating-images-container">
      {FloatingImage({
        src: 'Diode',
        alt: 'Decorative diode illustration',
        position: { top: '15vh', right: '8%' },
        stickyTop: '100px',
        maxWidth: '220px'
      })}
      
      {FloatingImage({
        src: 'CPU',
        alt: 'Decorative CPU illustration',
        position: { top: '35vh', left: '5%' },
        stickyTop: '250px',
        maxWidth: '260px'
      })}
      
      {FloatingImage({
        src: 'Battery',
        alt: 'Decorative battery illustration',
        position: { top: '55vh', right: '10%' },
        stickyTop: '200px',
        maxWidth: '280px'
      })}
      
      {FloatingImage({
        src: 'Circuit',
        alt: 'Decorative circuit illustration',
        position: { top: '75vh', left: '7%' },
        stickyTop: '150px',
        maxWidth: '240px'
      })}
      
      {FloatingImage({
        src: 'Crab',
        alt: 'Decorative Rust crab illustration',
        position: { bottom: '10vh', right: '6%' },
        stickyTop: '300px',
        maxWidth: '250px'
      })}
    </div>
  );

  const content = (
    <main>
      <div class="text-center mb-12">
        <h3 class="hero-subtitle">Embedded Rust on STM32</h3>
        <h1>Powerfully Safe</h1>
        <p class="hero-description">Learn safe, bare-metal programming for STM32 microcontrollers using Rust. Focus on leveraging the efficiency of the ARM Cortex-M architecture for robust, high-performance firmware.</p>
      </div>
      
      <div class="lesson-grid">
        {lessons.map(lesson => (
          LessonCard({
            lessonNumber: lesson.id,
            title: lesson.title,
            description: lesson.description,
            link: lesson.link
          })
        ))}
      </div>
    </main>
  );

  return Layout({
    title: 'STM32 Rust Lessons',
    description: 'Learn embedded Rust on STM32 microcontrollers.',
    children: content.toString(),
    floatingImages: floatingImages.toString(),
    cssContent,
    basePath,
  });
}
