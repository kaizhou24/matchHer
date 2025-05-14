// src/pages/index.tsx

import Link from "next/link";
import Image from 'next/image'; // For optimized images
import { Button } from "@/components/ui/button"; // Assuming shadcn/ui Button is installed
import {
  ArrowRight,
  Award,
  Calendar,
  MessageSquare,
  Users,
  FileText, // Example for "Resume Upload" feature area
  Brain,    // Example for "Goal Tracking" or "Smart Matching"
  // Add any other Lucide icons you specifically use in this landing page
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Users className="h-7 w-7 text-pink-500" />
            <span className="text-xl font-semibold text-gray-800">MentorMatch</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="#features" className="text-sm font-medium text-gray-600 hover:text-pink-500 transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-pink-500 transition-colors">
              How It Works
            </Link>
            <Link href="#testimonials" className="text-sm font-medium text-gray-600 hover:text-pink-500 transition-colors">
              Testimonials
            </Link>
          </nav>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/auth/login"> {/* Ensure this path is correct for your login page */}
              <Button variant="outline" className="hidden sm:flex border-pink-500 text-pink-500 hover:bg-pink-50 hover:text-pink-600">
                Log In
              </Button>
            </Link>
            <Link href="/auth/signup"> {/* Ensure this path is correct for your signup page */}
              <Button className="bg-pink-500 hover:bg-pink-600 text-white">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-40 bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid items-center gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="flex flex-col justify-center space-y-6">
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold tracking-tighter text-gray-900 sm:text-5xl md:text-6xl xl:text-7xl/none">
                    Unlock Your Potential with <span className="text-pink-500">Meaningful Mentorship</span>
                  </h1>
                  <p className="max-w-[600px] text-gray-600 md:text-xl lg:text-lg xl:text-xl">
                    MentorMatch connects you with experienced professionals based on your unique career goals, interests, and background.
                    Stop guessing, start growing.
                  </p>
                </div>
                <div className="flex flex-col gap-3 min-[400px]:flex-row">
                  <Link href="/auth/signup?role=mentee">
                    <Button size="lg" className="w-full min-[400px]:w-auto bg-pink-500 hover:bg-pink-600 text-white shadow-lg hover:shadow-pink-300 transition-shadow">
                      Find a Mentor
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/auth/signup?role=mentor">
                    <Button size="lg" variant="outline" className="w-full min-[400px]:w-auto border-pink-500 text-pink-500 hover:bg-pink-50 hover:text-pink-600 shadow-sm hover:shadow-md transition-shadow">
                      Become a Mentor
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <Image
                  alt="Two people having a productive mentorship discussion"
                  className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
                  height={450} // Use numbers for height and width with next/image
                  width={600}
                  src="/images/mentorship-hero.svg" // **ACTION: Create or replace this image in public/images/**
                  priority // Good for LCP images
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="inline-block rounded-lg bg-pink-100 px-3 py-1 text-sm font-medium text-pink-600">Key Features</div>
              <h2 className="text-3xl font-bold tracking-tighter text-gray-900 md:text-4xl lg:text-5xl">
                Everything You Need for Success
              </h2>
              <p className="max-w-[900px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Our platform provides the tools to foster meaningful, lasting connections and track your growth.
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3">
              {[ // Ensure these icons are imported from lucide-react
                { icon: Brain, title: "Smart Matching", description: "Our NLP-powered algorithm connects you based on compatibility, industry, values, and goals." },
                { icon: Calendar, title: "Meeting Scheduler", description: "Coordinate sessions easily with an integrated scheduler and reminders." },
                { icon: MessageSquare, title: "Secure Messaging", description: "Communicate effectively with built-in, private conversation threads." },
                // { icon: Goal, title: "Goal Tracking", description: "Set, track, and achieve your career objectives with shared goal-setting tools." }, // Example: Goal from lucide-react
                { icon: FileText, title: "Resume Analysis", description: "Upload your resume for deeper insights and even better matching precision." },
                { icon: Award, title: "Progress &amp; Feedback", description: "Log meeting notes, share feedback, and celebrate milestones together." },
                { icon: Users, title: "Community Access", description: "Connect with a diverse community of professionals for broader networking." },
              ].map((feature, index) => (
                <div key={index} className="group flex flex-col items-center text-center gap-2 rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-lg transition-shadow">
                  <div className="rounded-full bg-pink-100 p-3 group-hover:bg-pink-500 transition-colors">
                    <feature.icon className="h-7 w-7 text-pink-500 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mt-3">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section - This uses Card, CardContent etc. which we determined is not needed here */}
        {/* For simplicity on the landing page, let's use basic divs unless you specifically want Card styling */}
        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32 bg-pink-50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="inline-block rounded-lg bg-pink-100 px-3 py-1 text-sm font-medium text-pink-600">How It Works</div>
              <h2 className="text-3xl font-bold tracking-tighter text-gray-900 md:text-4xl lg:text-5xl">
                Your Mentorship Journey in 3 Simple Steps
              </h2>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-8 md:grid-cols-3 md:gap-12">
              {[
                { title: "Sign Up &amp; Onboard", description: "Tell us about your goals, experience, and what you&apos;re looking for. Upload your resume for enhanced matching." },
                { title: "Get Intelligently Matched", description: "Our smart algorithm analyzes profiles to suggest highly compatible connections tailored to your needs." },
                { title: "Connect &amp; Grow", description: "Schedule meetings, set goals, share insights, and build a valuable professional relationship." },
              ].map((step, index) => (
                <div key={index} className="flex flex-col items-center text-center space-y-3 rounded-lg border border-transparent bg-white p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-pink-500 text-2xl font-bold text-white">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section - Also uses Card, CardContent etc. We'll simplify if Card is not meant for this page */}
        <section id="testimonials" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="inline-block rounded-lg bg-pink-100 px-3 py-1 text-sm font-medium text-pink-600">Testimonials</div>
              <h2 className="text-3xl font-bold tracking-tighter text-gray-900 md:text-4xl lg:text-5xl">
                Loved by Professionals Like You
              </h2>
            </div>
            <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {[
                { quote: "Finding a mentor who truly understood my niche career goals was a game-changer. MentorMatch&apos;s algorithm is spot on!", name: "Sarah J.", role: "AI Ethics Researcher", avatarInitial: "SJ" },
                { quote: "As a mentor, I&apos;ve connected with incredible talent. The platform makes scheduling and follow-ups so easy.", name: "David C.", role: "Lead Software Engineer", avatarInitial: "DC" },
                { quote: "The structured approach to goal setting within MentorMatch helped me land my dream job. Invaluable!", name: "Maya P.", role: "Product Manager", avatarInitial: "MP" },
              ].map((testimonial, index) => (
                <div key={index} className="flex flex-col justify-between rounded-lg border border-gray-200 bg-white p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <blockquote className="text-lg text-gray-700 italic mb-4">&ldquo;{testimonial.quote}&rdquo;</blockquote>
                  <div className="mt-auto flex items-center gap-3 border-t border-gray-100 pt-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-100 text-pink-600 font-semibold"> {/* Placeholder Avatar */}
                      {testimonial.avatarInitial}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{testimonial.name}</p>
                      <p className="text-xs text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-pink-500 text-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-6 text-center">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl lg:text-5xl">
                Ready to Start Your Mentorship Journey?
              </h2>
              <p className="max-w-[700px] text-pink-100 md:text-xl">
                Join thousands of professionals growing their careers. Sign up today and find your perfect match.
              </p>
              <div className="flex flex-col gap-3 min-[400px]:flex-row">
                <Link href="/auth/signup?role=mentee">
                  <Button size="lg" className="bg-white text-pink-500 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-shadow">
                    Find My Mentor
                  </Button>
                </Link>
                <Link href="/auth/signup?role=mentor">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-pink-600 hover:border-pink-600 shadow-sm hover:shadow-md transition-shadow">
                    Become a Mentor
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t bg-white py-8">
        <div className="container mx-auto flex flex-col items-center justify-between gap-6 px-4 text-center md:flex-row md:text-left md:px-6">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-pink-500" />
            <span className="text-lg font-semibold text-gray-700">MentorMatch</span>
          </div>
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} MentorMatch. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="text-sm text-gray-500 hover:text-pink-500 transition-colors">
              Terms of Service
            </Link>
            <Link href="/privacy" className="text-sm text-gray-500 hover:text-pink-500 transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}