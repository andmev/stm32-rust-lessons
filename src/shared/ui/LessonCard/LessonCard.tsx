import { h } from '@jsx/html';

interface LessonCardProps {
  lessonNumber: number;
  title: string;
  description: string;
  link: string;
}

export function LessonCard({ lessonNumber, title, description, link }: LessonCardProps): string {
  return (
    <a href={link} class="lesson-card">
      <div class="lesson-card__number">Lesson {lessonNumber}</div>
      <h3 class="lesson-card__title">{title}</h3>
      <p class="lesson-card__description">{description}</p>
    </a>
  );
}
