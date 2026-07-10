import React from 'react';
import { Helmet } from 'react-helmet-async';

interface JsonLdProps {
  type: 'WebApplication' | 'Article';
  data: Record<string, any>;
}

export default function JsonLd({ type, data }: JsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
}
