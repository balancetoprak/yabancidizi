"use client";

import BackButton from "@/components/ui/button/BackButton";
import { siteConfig } from "@/config/site";
import { cn, isEmpty } from "@/utils/helpers";
import { Button, Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@heroui/react";
import { useWindowScroll } from "@mantine/hooks";
import Link from "next/link";
import { usePathname } from "next/navigation";
import FullscreenToggleButton from "../button/FullscreenToggleButton";
import UserProfileButton from "../button/UserProfileButton";
import SearchInput from "../input/SearchInput";
import ThemeSwitchDropdown from "../input/ThemeSwitchDropdown";
import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search } from "@/utils/icons";
import SearchFilter from "@/components/sections/Search/Filter";
import SearchList from "@/components/sections/Search/List";

const TopNavbar = () => {
  const pathName = usePathname();
  const [{ y }] = useWindowScroll();
  const opacity = Math.min((y / 1000) * 5, 1);
  const hrefs = siteConfig.navItems.map((item) => item.href);
  const show = hrefs.includes(pathName);
  const tv = pathName.includes("/tv/");
  const auth = pathName.includes("/auth");
  const hidden = auth;

  return (
    <>
      {!hidden && (
        <Navbar
          disableScrollHandler
          isBlurred={true}
          position="sticky"
          maxWidth="full"
          classNames={{ wrapper: "px-2 md:px-4" }}
          className={cn("bg-background/40 inset-0 h-min backdrop-blur-md", {
            "bg-background/70": show,
          })}
        >
          {!show && (
            <div
              className="border-background bg-background absolute inset-0 h-full w-full border-b"
              style={{ opacity: opacity }}
            />
          )}

          <NavbarBrand>
            {show ? (
              <Link
                href="/"
                className="bg-gradient-to-br from-[#0d6efd] to-[#00d4ff] bg-clip-text text-2xl font-bold text-transparent"
              >
                Yabancıdizi
              </Link>
            ) : (
              <BackButton href={tv ? "/?content=tv" : "/"} />
            )}
          </NavbarBrand>

          {show && (
            <NavbarContent className="hidden w-full max-w-lg gap-6 md:flex">
              <NavbarItem>
                <Link href="/" className="hover:text-primary transition">
                  Ana Sayfa
                </Link>
              </NavbarItem>
              <NavbarItem>
                <Link href="?content=tv" className="hover:text-primary transition">
                  Diziler
                </Link>
              </NavbarItem>
              <NavbarItem>
                <Link href="/" className="hover:text-primary transition">
                  Filmler
                </Link>
              </NavbarItem>
              <NavbarItem>
                <Link href="/library" className="hover:text-primary transition">
                  Favorilerim
                </Link>
              </NavbarItem>
            </NavbarContent>
          )}

          <NavbarContent justify="end">
            {show && !pathName.startsWith("/search") && (
              <NavbarItem className="w-full">
                <SearchList />
              </NavbarItem>
            )}
            <NavbarItem>
              <UserProfileButton />
            </NavbarItem>
          </NavbarContent>
        </Navbar>
      )}
    </>
  );
};

export default TopNavbar;
