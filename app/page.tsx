import Link from 'next/link';
import { FiMapPin, FiTruck, FiCheckCircle } from 'react-icons/fi';
import { ArrowRight, Star, Shield, Clock, Package, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function Home() {
  return (
    <main>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-brand-green px-4 py-24 sm:px-6 lg:px-8">
        {/* Subtle Grid Background */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        
        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <h1 className="font-serif text-5xl font-normal leading-[1.1] tracking-tight text-brand-cream sm:text-6xl lg:text-7xl">
              You travel.<br />
              <span className="text-brand-orange italic">We handle your luggage.</span>
            </h1>
            <p className="mt-8 max-w-xl text-lg text-brand-cream/80 leading-relaxed">
              Door-to-door luggage collection and delivery. Skip the check-in queues, the heavy lifting and the lost-bag anxiety.
            </p>
            
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link href="/booking/new">
                <Button size="lg" className="w-full sm:w-auto gap-2 text-base font-semibold shadow-lg shadow-brand-orange/20">
                  Get an instant quote <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/track">
                <Button variant="outline" size="lg" className="w-full sm:w-auto border-brand-cream/20 text-brand-cream hover:bg-brand-cream/10">
                  Track a booking
                </Button>
              </Link>
            </div>

            {/* Social Proof */}
            <div className="mt-12 flex items-center gap-6 text-sm text-brand-cream/80">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-brand-orange text-brand-orange" />
                <span><strong className="text-white">4.9</strong> avg. rating</span>
              </div>
              <div className="h-4 w-px bg-brand-cream/20"></div>
              <div>
                <strong className="text-white">120k+</strong> bags delivered
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Image Placeholder Area (Simulating the bottom of screenshot) */}
      <div className="h-64 w-full bg-slate-200 relative">
         <div className="absolute inset-0 flex items-center justify-center text-slate-400 font-medium">
            [ Image of driver/luggage van goes here ]
         </div>
      </div>

      {/* How It Works */}
      <section id="how-it-works" className="bg-brand-cream px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center font-serif text-4xl text-brand-green">How LuggageEase Works</h2>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
             // then in your array:
{ icon: FiMapPin, title: 'Book Pickup', desc: '...' },
{ icon: FiTruck, title: 'We Transport', desc: '...' },
{ icon: FiCheckCircle, title: 'Delivered Safely', desc: '...' },
            ].map((item, i) => (
              <div key={i} className="rounded-2xl bg-white p-8 shadow-sm border border-brand-green/5 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-green/5">
                  <item.icon className="h-6 w-6 text-brand-green" />
                </div>
                <h3 className="mt-6 text-xl font-semibold text-brand-green">{item.title}</h3>
                <p className="mt-3 text-brand-green/70">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}