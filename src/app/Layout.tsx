import { h } from '@jsx/html';
import { Footer } from '@shared/ui/Footer/Footer';
import { Meta } from '@shared/ui/Meta/Meta';

interface LayoutProps {
  title: string;
  description: string;
  children: string;
  floatingImages?: string;
  cssContent: string;
  basePath?: string;
}

export function Layout({ title, description, children, floatingImages, cssContent, basePath = '/' }: LayoutProps): string {
  // Normalize basePath - ensure it ends with / and remove leading / if basePath is not root
  const normalizedBase = basePath === '/' ? '' : basePath.replace(/\/$/, '');
  const scriptPath = `${normalizedBase}/js/index.js`;
  
  return (
    <html lang="en">
      <head>
        <base href={basePath} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif&display=swap" rel="stylesheet" />
        {Meta({ title, description })}
        <style>{cssContent}</style>
      </head>
      <body>
        {floatingImages || ''}
        {children}
        {Footer()}
        <script src={scriptPath}></script>
      </body>
    </html>
  );
}
