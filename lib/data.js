export const announcementText =
  "Get 20% off for first order. More information here.";

export const announcementPoints = [
  "Free shipping on orders above ₹999",
  "Hassle-free returns within 7 days",
];

export const heroSlides = [
  { id: 1, src: "/images/hero-1.png", alt: "House of Qalakari banarasi silk saree — celebrate the elegance of tradition" },
  { id: 2, src: "/images/hero-2.png", alt: "Handwoven saree draped by a model — House of Qalakari" },
  { id: 3, src: "/images/hero-1.png", alt: "House of Qalakari banarasi silk saree — celebrate the elegance of tradition" },
  { id: 4, src: "/images/hero-2.png", alt: "Handwoven saree draped by a model — House of Qalakari" },
];

const IMG = (name, ext = "png") => `/images/${name}.${ext}`;

// Listing payload: main image + gallery (kept small on purpose — full metadata lives on the detail page).
export const products = [
  {
    id: 1,
    sku: "QAL-BHA-RED-01",
    name: "Bhakti Silk in Red",
    price: 4999,
    mrp: 8000,
    image: IMG("product-1"),
    gallery: [IMG("product-1")],
    isNew: true,
    hasVideo: true,
    fabric: "Silk",
    colour: "Red",
    inStock: true,
    rating: 4.6,
    reviews: 128,
  },
  {
    id: 2,
    sku: "QAL-ETH-PUR-02",
    name: "Ethnic Motifs Sequinned Saree in Purple",
    price: 2999,
    mrp: 3500,
    image: IMG("product-2"),
    gallery: [IMG("product-2")],
    isNew: true,
    hasVideo: false,
    fabric: "Georgette",
    colour: "Purple",
    inStock: true,
    rating: 4.4,
    reviews: 76,
  },
  {
    id: 3,
    sku: "QAL-WOV-RED-03",
    name: "Woven Design Chanderi Cotton Saree with Red Motifs",
    price: 1149,
    mrp: 1499,
    image: IMG("product-main-chanderi"),
    gallery: [
      IMG("product-main-chanderi"),
      IMG("swatch-1", "jpg"),
      IMG("swatch-2", "jpg"),
      IMG("swatch-3", "jpg"),
      IMG("swatch-4", "jpg"),
    ],
    isNew: false,
    hasVideo: true,
    fabric: "Cotton",
    colour: "Red",
    inStock: true,
    rating: 4.8,
    reviews: 214,
  },
  {
    id: 4,
    sku: "QAL-BAN-GLD-04",
    name: "Banarasi Organza Saree with Gold Zari",
    price: 5499,
    mrp: 9000,
    image: IMG("product-4"),
    gallery: [IMG("product-4")],
    isNew: true,
    hasVideo: false,
    fabric: "Organza",
    colour: "Gold",
    inStock: true,
    rating: 4.7,
    reviews: 93,
  },
  {
    id: 5,
    sku: "QAL-KAT-BUT-05",
    name: "Katan Silk Banarasi Saree with Floral Buta",
    price: 6999,
    mrp: 11000,
    image: IMG("product-5"),
    gallery: [IMG("product-5")],
    isNew: false,
    hasVideo: true,
    fabric: "Silk",
    colour: "Maroon",
    inStock: false,
    rating: 4.9,
    reviews: 41,
  },
  {
    id: 6,
    sku: "QAL-CHC-CON-06",
    name: "Chanderi Cotton Saree with Contrast Border",
    price: 1899,
    mrp: 2499,
    image: IMG("product-6"),
    gallery: [IMG("product-6")],
    isNew: true,
    hasVideo: false,
    fabric: "Cotton",
    colour: "Beige",
    inStock: true,
    rating: 4.3,
    reviews: 58,
  },
  {
    id: 7,
    sku: "QAL-TUS-BEI-07",
    name: "Tussar Silk Saree in Earthy Beige",
    price: 4299,
    mrp: 6500,
    image: IMG("product-7"),
    gallery: [IMG("product-7")],
    isNew: false,
    hasVideo: false,
    fabric: "Silk",
    colour: "Beige",
    inStock: true,
    rating: 4.5,
    reviews: 67,
  },
  {
    id: 8,
    sku: "QAL-GEO-FOI-08",
    name: "Georgette Saree with Foil Print",
    price: 2599,
    mrp: 3999,
    image: IMG("product-8", "jpg"),
    gallery: [IMG("product-8", "jpg")],
    isNew: true,
    hasVideo: true,
    fabric: "Georgette",
    colour: "Pink",
    inStock: true,
    rating: 4.2,
    reviews: 34,
  },
  {
    id: 9,
    sku: "QAL-MUS-HND-09",
    name: "Pure Muslin Saree with Hand Painted Motifs",
    price: 3199,
    mrp: 4500,
    image: IMG("product-9", "jpg"),
    gallery: [IMG("product-9", "jpg")],
    isNew: false,
    hasVideo: false,
    fabric: "Muslin",
    colour: "Ivory",
    inStock: true,
    rating: 4.6,
    reviews: 52,
  },
  {
    id: 10,
    sku: "QAL-TIS-ROS-10",
    name: "Festive Tissue Silk Saree in Rose Gold",
    price: 5999,
    mrp: 9500,
    image: IMG("product-10", "jpg"),
    gallery: [IMG("product-10", "jpg")],
    isNew: true,
    hasVideo: false,
    fabric: "Tissue",
    colour: "Rose Gold",
    inStock: true,
    rating: 4.7,
    reviews: 88,
  },
];

export const discountPercent = (product) =>
  Math.round(((product.mrp - product.price) / product.mrp) * 100);

export const collections = [
  { name: "Silk Sarees", key: "silk", image: IMG("collection-silk-sarees"), href: "/collections" },
  { name: "Cotton Classic", key: "cotton", image: IMG("collection-cotton-classic"), href: "/collections" },
  { name: "Pure Georgette", key: "georgette", image: IMG("collection-pure-georgette"), href: "/collections" },
  { name: "Pure Muslin", key: "muslin", image: IMG("collection-pure-muslin"), href: "/collections" },
  { name: "Festive Wear", key: "festive", image: IMG("collection-festive-wear"), href: "/collections" },
  { name: "Wedding Sarees", key: "wedding", image: IMG("collection-wedding-sarees"), href: "/collections" },
];

export const homeCollectionCards = [
  { name: "Sarees", image: IMG("collection-silk-sarees"), href: "/collections" },
  { name: "Dress Materials", image: IMG("collection-cotton-classic"), href: "/collections" },
];

export const reels = [
  { id: 1, caption: "Ethnic Motifs Embroidered Sequinned Saree in purple", price: 2999, mrp: 3500, image: IMG("product-4"), href: "/product" },
  { id: 2, caption: "Bhakti Silk in Red", price: 4999, mrp: 8000, image: IMG("product-1"), href: "/product" },
  { id: 3, caption: "Banarasi Organza Saree with Gold Zari", price: 5499, mrp: 9000, image: IMG("product-4"), href: "/product" },
  { id: 4, caption: "Katan Silk Banarasi Saree", price: 6999, mrp: 11000, image: IMG("product-5"), href: "/product" },
  { id: 5, caption: "Bhakti Silk in Red", price: 4999, mrp: 8000, image: IMG("product-2"), href: "/product" },
  { id: 6, caption: "Chanderi Cotton Saree", price: 1899, mrp: 2499, image: IMG("product-6"), href: "/product" },
  { id: 7, caption: "Ethnic Motifs Embroidered Sequinned Saree in purple", price: 2999, mrp: 3500, image: IMG("product-3"), href: "/product" },
];

export const services = [
  { icon: IMG("service-dispatch"), label: "24-hour Dispatch" },
  { icon: IMG("service-returns"), label: "Easy Returns" },
  { icon: IMG("service-store"), label: "Instant In-Store Experience" },
  { icon: IMG("service-fitting"), label: "Custom Fitting" },
];

export const trustPoints = [
  { title: "Pure Handloom", detail: "Woven on traditional pit looms" },
  { title: "7-Day Returns", detail: "No questions asked" },
  { title: "Cash on Delivery", detail: "Available across India" },
  { title: "Secure Payments", detail: "UPI, cards & netbanking" },
];

export const testimonials = [
  { id: 1, quote: "I am genuinely impressed with the quality. Everything feels premium, and it delivered exactly what was promised. Will definitely recommend it to friends and family!", name: "Priya Singh", meta: "29, Bengaluru", avatar: IMG("avatar-priya", "jpg"), rating: 5 },
  { id: 2, quote: "Delivery was quick and packaging was neat. The product works perfectly, though I’d love to see more color options next time. Overall, a great buy!", name: "John Matthews", meta: "41, Mumbai", avatar: IMG("avatar-john", "jpg"), rating: 5 },
  { id: 3, quote: "Initially I was unsure, but after using it for a week, I can confidently say this is worth every rupee. Performance is smooth and reliable. Totally satisfied!", name: "Sneha Raghavan", meta: "34, Delhi", avatar: IMG("avatar-sneha", "jpg"), rating: 5 },
  { id: 4, quote: "Customer support team was super helpful when I had a question. They guided me step by step and made the whole process stress-free. Rare to see such good service these days.", name: "Rahul Chauhan", meta: "38, Pune", avatar: IMG("avatar-rahul", "jpg"), rating: 5 },
  { id: 5, quote: "This has made my daily routine so much easier. It’s affordable, well-designed, and does exactly what it claims. I’m already planning to get another one as a gift.", name: "Meera Kaur", meta: "45, Hyderabad", avatar: IMG("avatar-meera", "jpg"), rating: 5 },
];

export const reviews = [
  { id: 1, name: "Ananya R.", rating: 5, title: "Beautiful weave, exactly as pictured", body: "The zari work is finer than I expected and the fall of the fabric is lovely. Wore it to a family wedding and got compliments all evening.", date: "12 Oct 2025", verified: true },
  { id: 2, name: "Kavya M.", rating: 4, title: "Lovely colour, slightly stiff", body: "Colour is true to the photos. Needed one wash before it softened up, but the finish is neat and the blouse piece is generous.", date: "28 Sep 2025", verified: true },
  { id: 3, name: "Rohit S.", rating: 5, title: "Gifted to my mother", body: "Packaging was lovely and delivery was quick. She has worn it twice already — the fabric breathes well in this weather.", date: "03 Sep 2025", verified: false },
];

export const footerColumns = [
  {
    heading: "Company",
    links: ["About us", "Track Order", "Contact us", "Chat with us", "Talk to us", "Write to us"],
  },
  {
    heading: "Policies",
    links: ["Return Policy", "Refund Policy", "Shipping Policy", "Bulk Order"],
  },
  {
    heading: "Additional",
    links: ["Tutorials", "Support"],
  },
];

export const socialLinks = [
  { label: "Twitter", href: "https://twitter.com" },
  { label: "Instagram", href: "https://instagram.com" },
  { label: "Facebook", href: "https://facebook.com" },
  { label: "WhatsApp", href: "https://wa.me" },
];

export const featuredProduct = {
  ...products[2],
  color: "Red",
  size: "Free size",
  images: products[2].gallery.map((src, i) => ({
    src,
    alt: `${products[2].name} — view ${i + 1}`,
    label: i === 0 ? "Drape" : ["Red", "Rust", "Maroon", "Pink"][i - 1],
    swatch: i === 0 ? undefined : i,
  })),
  swatches: [
    { id: 1, image: IMG("swatch-1", "jpg"), name: "Red" },
    { id: 2, image: IMG("swatch-2", "jpg"), name: "Rust" },
    { id: 3, image: IMG("swatch-3", "jpg"), name: "Maroon" },
    { id: 4, image: IMG("swatch-4", "jpg"), name: "Pink" },
  ],
  description:
    "A handwoven chanderi cotton saree featuring rich red butta motifs woven across a soft, breathable body. Light-weight with a subtle sheen, it drapes beautifully for day wear and festive gatherings.",
  details: [
    { label: "Fabric & Weave", content: "Pure chanderi cotton with zari-toned woven motifs. 5.5 metres plus a matching unstitched blouse piece." },
    { label: "Care Instructions", content: "Dry clean only. Store folded in a muslin cloth, away from direct sunlight to preserve the zari." },
    { label: "Shipping & Returns", content: "Dispatched within 24 hours. Easy 7-day returns — initiate from Track Order or contact support." },
    { label: "Size & Fit", content: "One size fits all. Saree length 5.5 m with an 80 cm blouse piece." },
  ],
};

export const formatINR = (value) =>
  `Rs. ${Number(value).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;