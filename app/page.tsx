"use client";

import Link from "next/link";
import Image from "next/image";
import { Calendar, Users, Trophy } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";

export default function Home() {
  const { state } = useSidebar();

  return (
    <div
      className="min-h-screen w-full p-2 lg:w-auto"
      style={
        typeof window !== "undefined" && window.innerWidth >= 1024
          ? state === "collapsed"
            ? { width: "100vw" }
            : { width: "calc(100vw - var(--sidebar-width))" }
          : {}
      }
    >
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <section className="text-center py-16">
          {/* Logo */}
          <div className="mb-8">
            <Image
              src="/logo/logo.jpg"
              alt="OldBoy Basketball Club Logo"
              width={150}
              height={150}
              className="mx-auto rounded-full "
              priority
            />
          </div>

          <h1 className="text-2xl md:text-5xl font-bold text-gray-900 mb-6">
            Welcome to Old Boys Basketball Club
          </h1>
          <p className="text-sm md:text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
            Join our vibrant basketball community where passion meets
            competition. Register for events, connect with fellow players, and
            be part of something special.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/events"
              className="bg-blue-800 hover:bg-blue-900 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center gap-2"
            >
              View Events
            </Link>
            <Link
              href="/account"
              className="border border-blue-800 text-blue-800 hover:bg-blue-50 font-medium py-3 px-6 rounded-lg transition-colors"
            >
              My Account
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Join Us?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-lg border border-gray-200">
              <Calendar className="h-12 w-12 text-blue-800 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Regular Events</h3>
              <p className="text-gray-600 text-sm">
                Weekly games, tournaments, and training sessions for all skill
                levels.
              </p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg border border-gray-200">
              <Users className="h-12 w-12 text-blue-800 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Community</h3>
              <p className="text-gray-600 text-sm">
                Connect with passionate players and build lasting friendships on
                and off the court.
              </p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg border border-gray-200">
              <Trophy className="h-12 w-12 text-blue-800 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Competition</h3>
              <p className="text-gray-600 text-sm">
                Participate in organized leagues and tournaments to test your
                skills.
              </p>
            </div>
          </div>
        </section>

        {/* Image Placeholder Section */}
        <section className="py-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Club Gallery
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Team Images */}
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src="/team/image-1.jpg"
                alt="Basketball game action"
                width={400}
                height={300}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src="/team/image-2.jpg"
                alt="Team training session"
                width={400}
                height={300}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src="/team/image-3.jpg"
                alt="Basketball tournament"
                width={400}
                height={300}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src="/team/image-4.jpg"
                alt="Team celebration"
                width={400}
                height={300}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src="/team/image-5.jpg"
                alt="OldBoy Basketball Club team"
                width={400}
                height={300}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src="/team/image-6.jpg"
                alt="Basketball practice"
                width={400}
                height={300}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-16 text-center bg-gray-50 rounded-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Ready to Join?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Check out our upcoming events and register today!
          </p>
          <Link
            href="/events"
            className="bg-blue-800 hover:bg-blue-900 text-white font-medium py-3 px-8 rounded-lg transition-colors inline-flex items-center gap-2"
          >
            Browse Events
          </Link>
        </section>
      </div>
    </div>
  );
}
