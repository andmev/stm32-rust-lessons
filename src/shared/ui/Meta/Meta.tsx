import { h, Fragment } from '@jsx/html';

interface MetaProps {
  title: string;
  description: string;
}

export function Meta({ title, description }: MetaProps): string {
  return (
    <>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>{title}</title>
      <meta name="description" content={description} />
    </>
  );
}

