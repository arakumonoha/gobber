import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  lat: z.number(),
  lng: z.number(),
  category: z.string().optional(),
});

const GATEWAY = "https://connector-gateway.lovable.dev/google_maps";

// Curated fallback imagery per category, used when Google Places has no photo.
const FALLBACK: Record<string, string> = {
  Dinner: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80",
  Adventure: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1200&q=80",
  Coworking: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&q=80",
  Wellness: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&q=80",
  Food: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80",
  Nightlife: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1200&q=80",
};

export const getLocationPhoto = createServerFn({ method: "POST" })
  .inputValidator((v: unknown) => Input.parse(v))
  .handler(async ({ data }): Promise<{ url: string; source: "google" | "fallback" }> => {
    const lovableKey = process.env.LOVABLE_API_KEY;
    const gmKey = process.env.GOOGLE_MAPS_API_KEY;
    const fallbackUrl =
      FALLBACK[data.category ?? ""] ??
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=80";

    if (!lovableKey || !gmKey) return { url: fallbackUrl, source: "fallback" };

    try {
      // 1. Find the closest interesting place with a photo.
      const nearbyRes = await fetch(`${GATEWAY}/places/v1/places:searchNearby`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableKey}`,
          "X-Connection-Api-Key": gmKey,
          "Content-Type": "application/json",
          "X-Goog-FieldMask": "places.id,places.displayName,places.photos",
        },
        body: JSON.stringify({
          maxResultCount: 5,
          locationRestriction: {
            circle: {
              center: { latitude: data.lat, longitude: data.lng },
              radius: 250,
            },
          },
        }),
      });

      if (!nearbyRes.ok) return { url: fallbackUrl, source: "fallback" };
      const nearby = (await nearbyRes.json()) as {
        places?: { photos?: { name: string }[] }[];
      };
      const photoName = nearby.places?.find((p) => p.photos?.length)?.photos?.[0]?.name;
      if (!photoName) return { url: fallbackUrl, source: "fallback" };

      // 2. Resolve the photo media URL.
      const mediaRes = await fetch(
        `${GATEWAY}/places/v1/${photoName}/media?maxWidthPx=1200&skipHttpRedirect=true`,
        {
          headers: {
            Authorization: `Bearer ${lovableKey}`,
            "X-Connection-Api-Key": gmKey,
          },
        },
      );
      if (!mediaRes.ok) return { url: fallbackUrl, source: "fallback" };
      const media = (await mediaRes.json()) as { photoUri?: string };
      if (!media.photoUri) return { url: fallbackUrl, source: "fallback" };

      return { url: media.photoUri, source: "google" };
    } catch {
      return { url: fallbackUrl, source: "fallback" };
    }
  });
