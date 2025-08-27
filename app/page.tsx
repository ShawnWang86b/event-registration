"use client";

import Link from "next/link";
import Image from "next/image";
import { Calendar, Users, Trophy } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import ClubGallery from "@/components/ClubGallery";
import FeaturesSection from "@/components/FeaturesSection";

export default function Home() {
  const { state } = useSidebar();

  const galleryImages = [
    { src: "/team/image-1.jpg", alt: "Basketball game action" },
    { src: "/team/image-2.jpg", alt: "Team training session" },
    { src: "/team/image-3.jpg", alt: "Basketball tournament" },
    { src: "/team/image-4.jpg", alt: "Team celebration" },
    { src: "/team/image-5.jpg", alt: "OldBoy Basketball Club team" },
    { src: "/team/image-6.jpg", alt: "Basketball practice" },
  ];

  const features = [
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

  return (
    <div className="min-h-screen px-16">
      {/* Hero Section */}
      <section className="text-center py-16">
        {/* Logo */}
        <div className="mb-8">
          <Image
            src="/logo/logo.jpg"
            alt="Melbourne Old Boys Hoops Logo"
            width={150}
            height={150}
            className="mx-auto rounded-full "
            priority
          />
        </div>

        <h1 className="text-2xl md:text-5xl font-bold text-foreground mb-6">
          Welcome to Melbourne Old Boys Hoops
        </h1>
        <p className="text-sm md:text-lg text-primary mb-8 max-w-3xl mx-auto">
          Join our vibrant basketball community where passion meets competition.
          Register for events, connect with fellow players, and be part of
          something special.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/events"
            className="w-[200px] bg-primary hover:bg-primary/90 text-primary-foreground py-3 px-6 rounded-lg transition-colors"
          >
            View Events
          </Link>
          <Link
            href="/account"
            className="w-[200px] border border-primary text-primary hover:bg-blue-50 font-medium py-3 px-6 rounded-lg transition-colors"
          >
            My Account
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <FeaturesSection features={features} />

      {/* Club Gallery */}
      <ClubGallery images={galleryImages} />

      {/* Call to Action Section */}
      <section className="py-16 text-center">
        <h2 className="text-3xl font-bold text-secondary-foreground mb-6">
          Ready to Join?
        </h2>
        <p className="text-lg text-primary mb-8">
          Check out our upcoming events and register today!
        </p>
        <Link
          href="/events"
          className="w-[200px] bg-primary hover:bg-primary/90 text-primary-foreground py-3 px-6 rounded-lg transition-colors"
        >
          View Events
        </Link>
      </section>
    </div>
  );
}
