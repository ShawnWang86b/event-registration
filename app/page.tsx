"use client";

import Link from "next/link";
import Image from "next/image";
import ClubGallery from "@/components/ClubGallery";
import FeaturesSection from "@/components/FeaturesSection";
import { features, galleryImages } from "@/constants/homePage";

export default function Home() {
  return (
    <div className="min-h-screen px-2 lg:px-16">
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
            className="w-[150px] lg:w-[200px] bg-primary hover:bg-primary/90 text-primary-foreground py-3 px-6 rounded-lg transition-colors"
          >
            View Events
          </Link>
          <Link
            href="/account"
            className="w-[150px] lg:w-[200px] border border-primary text-primary hover:bg-accent hover:text-primary-foreground py-3 px-6 rounded-lg transition-colors"
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
          className="w-[150px] lg:w-[200px] bg-primary hover:bg-primary/90 text-primary-foreground py-3 px-6 rounded-lg transition-colors"
        >
          View Events
        </Link>
      </section>
    </div>
  );
}
