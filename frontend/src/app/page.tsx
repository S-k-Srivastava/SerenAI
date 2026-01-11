'use client';

import { LandingHeader } from "@/components/landing/LandingHeader";
import { Hero } from "@/components/landing/Hero";
import { Contributor } from "@/components/landing/Contributor";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <LandingHeader />
      <main className="flex-1 overflow-x-hidden">
        <Hero />
        <Contributor />
      </main>
      <Footer />
    </div>
  );
}
