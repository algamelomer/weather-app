"use client";

import Script from "next/script";
import { useEffect } from "react";

/**
 * Usage:
 * <Adsense client="ca-pub-XXXX" slot="YYYY" />
 *
 * Notes:
 * - Put client id in env: NEXT_PUBLIC_ADSENSE_CLIENT
 * - Put slots per placement.
 */
export default function Adsense({ slot }: { slot: string }) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

  useEffect(() => {
    // @ts-ignore
    if (typeof window !== "undefined") (window.adsbygoogle = window.adsbygoogle || []).push({});
  }, []);

  if (!client) return null; // hides ads in dev until you set env var

  return (
    <>
      <ins
        className="adsbygoogle block"
        style={{ display: "block" }}
        data-ad-client={client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </>
  );
}