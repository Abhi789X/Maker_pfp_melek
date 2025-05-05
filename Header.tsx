import React from "react";
import { Link } from "wouter";
import Logo from "@/assets/Logo";

interface HeaderProps {}

const Header: React.FC<HeaderProps> = () => {
  return (
    <header className="bg-secondary py-4 px-6 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/">
          <div className="flex items-center space-x-2 cursor-pointer">
            <Logo size={32} />
            <h1 className="text-2xl font-bold text-primary">Succinctlab PFP Maker</h1>
          </div>
        </Link>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link href="/">
                <a className="hover:text-primary transition-colors">Home</a>
              </Link>
            </li>
            <li>
              <Link href="/#gallery">
                <a className="hover:text-primary transition-colors">Gallery</a>
              </Link>
            </li>
            <li>
              <Link href="/#features">
                <a className="hover:text-primary transition-colors">About</a>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
