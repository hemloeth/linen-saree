export default function JsonLd({ data, id = "jsonld-data" }) {
  if (!data) return null;
  return (
    <script
      id={id}
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
