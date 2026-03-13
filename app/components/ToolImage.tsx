"use client";

import Image, { ImageProps } from "next/image";

/**
 * Wrapper around next/image that handles both local and external images.
 * External URLs are rendered unoptimized to avoid hostname configuration issues.
 * Local uploads (starting with /) are optimized normally.
 */
export default function ToolImage(props: ImageProps) {
  const src = typeof props.src === "string" ? props.src : "";
  const isExternal = src.startsWith("http://") || src.startsWith("https://");

  return <Image {...props} unoptimized={isExternal} />;
}
