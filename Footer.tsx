import React from "react";
import Logo from "@/assets/Logo";
import { Link } from "wouter";

interface FooterProps {}

const Footer: React.FC<FooterProps> = () => {
  return (
    <footer className="bg-secondary border-t border-neutral-800 py-8 px-6">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Link href="/">
              <div className="flex items-center space-x-2 cursor-pointer">
                <Logo size={24} />
                <h2 className="text-lg font-bold text-primary">Succinctlab PFP Maker</h2>
              </div>
            </Link>
          </div>

          <div>
            <ul className="flex space-x-6">
              <li>
                <a href="#" className="text-neutral-400 hover:text-primary transition-colors">
                  Terms
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-400 hover:text-primary transition-colors">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#" className="text-neutral-400 hover:text-primary transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 text-center text-neutral-500 text-sm">
          <p>© {new Date().getFullYear()} Succinctlab PFP Maker. All rights reserved.</p>
          <p className="mt-1 text-primary">Powered by Melek</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
