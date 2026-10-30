import { Briefcase, Mail, Phone, MapPin } from 'lucide-react';
import { FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

export function Footer() {
  return (
    <footer className="bg-brand-green text-brand-cream/80">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-orange text-brand-green">
                <Briefcase className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Luggage<span className="text-brand-orange">Ease</span>
              </span>
            </div>
            <p className="mt-4 text-sm text-brand-cream/60">You Travel. We Handle Your Luggage.</p>
            <div className="mt-6 flex gap-4">
              <FaTwitter className="h-5 w-5 hover:text-brand-orange cursor-pointer transition-colors" />
              <FaInstagram className="h-5 w-5 hover:text-brand-orange cursor-pointer transition-colors" />
              <FaLinkedin className="h-5 w-5 hover:text-brand-orange cursor-pointer transition-colors" />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Company</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="hover:text-brand-orange cursor-pointer transition-colors">About Us</li>
              <li className="hover:text-brand-orange cursor-pointer transition-colors">Careers</li>
              <li className="hover:text-brand-orange cursor-pointer transition-colors">Press</li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Support</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="hover:text-brand-orange cursor-pointer transition-colors">Help Center</li>
              <li className="hover:text-brand-orange cursor-pointer transition-colors">Safety</li>
              <li className="hover:text-brand-orange cursor-pointer transition-colors">Cancellation Policy</li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Contact</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-center gap-3"><Mail className="h-4 w-4 text-brand-orange" /> hello@luggag ease.com</li>
              <li className="flex items-center gap-3"><Phone className="h-4 w-4 text-brand-orange" /> +1 (800) LUGGAGE</li>
              <li className="flex items-center gap-3"><MapPin className="h-4 w-4 text-brand-orange" /> Lagos • London • NYC</li>
            </ul>
          </div>
        </div>
        {/* <div className="mt-12 border-t border-brand-cream/10 pt-8 text-center text-xs text-brand-cream/40">
          © {new Date().getFullYear()} LuggageEase. All rights reserved.
        </div> */}
      </div>
    </footer>
  );
}