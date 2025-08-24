import Image from "next/image";

interface GalleryImage {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

interface ClubGalleryProps {
  title?: string;
  images: GalleryImage[];
  className?: string;
}

export default function ClubGallery({
  title = "Club Gallery",
  images,
  className = "",
}: ClubGalleryProps) {
  return (
    <section className={`py-16 ${className}`}>
      <h2 className="text-3xl font-bold text-center text-secondary-foreground mb-12">
        {title}
      </h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image, index) => (
          <div
            key={index}
            className="aspect-video bg-gray-100 rounded-lg overflow-hidden"
          >
            <Image
              src={image.src}
              alt={image.alt}
              width={image.width || 400}
              height={image.height || 300}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
