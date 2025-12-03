"use client";

import { siteConfig } from "@/config/site";
import { cn } from "@/utils/helpers";
import { BreadcrumbItem, Breadcrumbs, Link } from "@heroui/react";
import { usePathname } from "next/navigation";
import { FaGithub } from "react-icons/fa6";

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className }) => {
  const pathName = usePathname();

  return (
    <footer className="mt-20 border-t border-[#2d2d2d] bg-[#0b0b0b] py-16">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 gap-10 text-center md:grid-cols-3 md:text-left">
          <div>
            <h1 className="text-xl leading-tight font-extrabold md:text-3xl">
              People shouldn't be afraid
              <br />
              of their
              <span className="text-primary"> government. </span>Governments should be afraid
              <br />
              of their people.
              <br />
            </h1>
          </div>

          <div className="flex flex-col items-center md:items-start">
            <nav className="flex flex-wrap justify-center gap-3 text-sm font-medium text-gray-400 md:justify-start md:gap-6">
              <Link href="/" className="hover:text-primary transition">
                Ana Sayfa
              </Link>
              <span className="text-gray-600">/</span>
              <Link href="/?content=tv" className="hover:text-primary transition">
                Diziler
              </Link>
              <span className="text-gray-600">/</span>
              <Link href="/?content=movie" className="hover:text-primary transition">
                Filmler
              </Link>
              <span className="text-gray-600">/</span>
              <Link href="/favorites" className="hover:text-primary transition">
                Favorilerim
              </Link>
            </nav>
          </div>

          <div className="space-y-6 text-center md:text-right">
            <div className="flex flex-wrap justify-center gap-4 text-xs font-medium text-gray-500 md:justify-end">
              <Link href="#" className="hover:text-primary transition">
                Privacy policy
              </Link>
              <Link href="#" className="hover:text-primary transition">
                Terms of service
              </Link>
              <Link href="#" className="hover:text-primary transition">
                Language
              </Link>
            </div>

            <p className="text-xs text-gray-500">© 2025 Yabancıdizi. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
