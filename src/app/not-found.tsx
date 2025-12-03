"use client";

import { siteConfig } from "@/config/site";
import { useDocumentTitle } from "@mantine/hooks";
import { Button } from "@heroui/react";
import Link from "next/link";

export default function NotFound() {
  useDocumentTitle(`404 | ${siteConfig.name}`);

  return (
    <div className="absolute-center text-center">
      <h1>404</h1>
      <h4>Sayfa Yok</h4>
      <p>Aradığınız sayfa mevcut değil.</p>
      <Button as={Link} href="/" className="mt-8">
        Ana Sayfa
      </Button>
    </div>
  );
}
