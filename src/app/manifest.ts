import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Visual Mindmap Task Manager",
    short_name: "VisualMindmap",
    description: "A visual task manager using mindmaps for better productivity",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: "/file.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/window.svg",
        sizes: "192x192",
        type: "image/svg+xml",
      },
      {
        src: "/globe.svg",
        sizes: "512x512",
        type: "image/svg+xml",
      },
    ],
  };
}
