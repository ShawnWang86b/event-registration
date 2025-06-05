"use client";

import Link from "next/link";
import Image from "next/image";
import { Calendar, Users, Trophy, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div
      className="container mx-auto p-6"
      style={{ width: "calc(100vw - var(--sidebar-width))" }}
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

          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to OldBoy Basketball Club
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Join our vibrant basketball community where passion meets
            competition. Register for events, connect with fellow players, and
            be part of something special.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/events"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center gap-2"
            >
              View Events
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/account"
              className="border border-blue-600 text-blue-600 hover:bg-blue-50 font-medium py-3 px-6 rounded-lg transition-colors"
            >
              My Account
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Join OldBoy Basketball Club?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-lg shadow-md">
              <Calendar className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Regular Events</h3>
              <p className="text-gray-600">
                Weekly games, tournaments, and training sessions for all skill
                levels.
              </p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-md">
              <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Community</h3>
              <p className="text-gray-600">
                Connect with passionate players and build lasting friendships on
                and off the court.
              </p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-md">
              <Trophy className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">Competition</h3>
              <p className="text-gray-600">
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
          <p className="text-xl text-gray-600 mb-8">
            Check out our upcoming events and register today!
          </p>
          <Link
            href="/events"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-colors inline-flex items-center gap-2"
          >
            Browse Events
            <Calendar className="h-4 w-4" />
          </Link>
        </section>
      </div>
    </div>
  );
}
