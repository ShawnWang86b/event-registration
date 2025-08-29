import { LucideIcon } from "lucide-react";

export type GalleryImage = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
};

export type ClubGalleryProps = {
  title?: string;
  images: GalleryImage[];
  className?: string;
};

export type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export type FeaturesSectionProps = {
  title?: string;
  features: Feature[];
  className?: string;
};
