"use client";

import { useParams } from "next/navigation";
import { EffortSubnav } from "@/components/efforts/effort-subnav";
import { MediaGallery } from "@/components/efforts/media-gallery";

export default function EffortMediaGalleryPage() {
  const params = useParams();
  const slug = params.slug as string;
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-4">
          <EffortSubnav slug={slug} />
        </div>
        <h1 className="text-2xl font-bold mb-2">Media Gallery</h1>
        <p className="text-gray-600 mb-6">See and share photos from this effort, as contributed by participants on the ground.</p>
        <MediaGallery slug={slug} />
      </div>
    </div>
  );
}


