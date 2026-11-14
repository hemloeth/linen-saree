import Image from "next/image";
import Link from "next/link";

export default function CollectionCard({ name, image, href = "/collections", sizes = "(max-width: 640px) 45vw, 220px", eager = false }) {
  return (
    <Link href={href} className="group flex flex-col items-center">
      <div className="relative aspect-[180/208] w-full overflow-hidden rounded-t-full bg-chip">
        <Image
          src={image}
          unoptimized={/^https?:\/\//.test(image || "")}
          alt={name}
          fill
          loading={eager ? "eager" : "lazy"}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </div>
      <p className="mt-2 text-center font-inter text-[13px] font-medium text-pine-800 group-hover:underline">
        {name}
      </p>
    </Link>
  );
}