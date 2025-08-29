import Image from "next/image";

type EventCardImageProps = {
  imageSrc: string;
  location: string | null | undefined;
  title: string;
  description: string;
};

export const EventCardImage = ({
  imageSrc,
  location,
  title,
  description,
}: EventCardImageProps) => {
  return (
    <div className="relative mb-6 h-48 rounded-lg overflow-hidden">
      <Image
        src={imageSrc}
        alt={location || "Event location"}
        fill
        className="object-cover"
      />
      <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/60 to-transparent">
        <h2 className="text-xl font-semibold mb-2 text-primary-foreground">
          {title}
        </h2>
        <p className="text-primary-foreground line-clamp-3">{description}</p>
      </div>
    </div>
  );
};
