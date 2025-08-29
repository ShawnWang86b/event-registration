import { Calendar, Users, Trophy, type LucideIcon } from "lucide-react";
import { GalleryImage, Feature } from "@/types/homePage";

export const galleryImages: GalleryImage[] = [
  { src: "/team/image-1.jpg", alt: "Basketball game action" },
  { src: "/team/image-2.jpg", alt: "Team training session" },
  { src: "/team/image-3.jpg", alt: "Basketball tournament" },
  { src: "/team/image-4.jpg", alt: "Team celebration" },
  { src: "/team/image-5.jpg", alt: "Melbourne Old Boys Hoops" },
  { src: "/team/image-6.jpg", alt: "Basketball practice" },
];

export const features: Feature[] = [
  {
    icon: Calendar,
    title: "Regular Events",
    description:
      "Weekly games, tournaments, and training sessions for all skill levels.",
  },
  {
    icon: Users,
    title: "Community",
    description:
      "Connect with passionate players and build lasting friendships on and off the court.",
  },
  {
    icon: Trophy,
    title: "Competition",
    description:
      "Participate in organized leagues and tournaments to test your skills.",
  },
];
