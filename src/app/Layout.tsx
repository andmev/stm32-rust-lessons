import { h } from '@jsx/html';
import { Meta } from '@shared/ui/Meta/Meta';
import { Header } from '@shared/ui/Header/Header';
import { Footer } from '@shared/ui/Footer/Footer';
// Layout.css will be included in the bundled CSS

interface LayoutProps {
  title: string;
  description: string;
  children: string;
  cssContent: string;
}

export function Layout({ title, description, children, cssContent }: LayoutProps): string {
  return (
    <html lang="en">
      <head>
        {Meta({ title, description })}
        <style>{cssContent}</style>
      </head>
      <body>
        {Header()}
        {children}
        {Footer()}
        <script src="/js/index.js"></script>
      </body>
    </html>
  );
}

