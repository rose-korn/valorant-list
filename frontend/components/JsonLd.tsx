// structured data (JSON-LD) ให้ Google อ่าน — escape "<" กันโค้ดหลุดออกจาก <script>
export default function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />
}
