import { Calendar, Users, Trophy } from "lucide-react";
import { GalleryImage, Feature } from "@/types/homePage";

export const galleryImages: GalleryImage[] = [
  { src: "/team/image-1.jpg", alt: "Basketball game action" },
  { src: "/team/image-2.jpg", alt: "Team training session" },
  { src: "/team/image-3.jpg", alt: "Basketball tournament" },
  { src: "/team/image-4.jpg", alt: "Team celebration" },
  { src: "/team/image-5.jpg", alt: "Melbourne Old Boys Hoops" },
  { src: "/team/image-6.jpg", alt: "Basketball practice" },
];

// here to use the translation key
export const features: Feature[] = [
  {
    icon: Calendar,
    title: "regularEvents",
    description: "regularEvents",
  },
  {
    icon: Users,
    title: "community",
    description: "community",
  },
  {
    icon: Trophy,
    title: "competition",
    description: "competition",
  },
];
