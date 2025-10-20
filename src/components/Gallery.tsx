import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Lightbox, { Slide } from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { UploadCloud } from "lucide-react";

const Gallery = () => {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const [lightboxIndex, setLightboxIndex] = useState<number>(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const fetchImages = async () => {
    const { data, error } = await supabase.storage
      .from("wedding-photos")
      .list("", {
        limit: 100,
        sortBy: { column: "created_at", order: "desc" },
      });

    if (error) {
      console.error("Error fetching images:", error.message);
      return;
    }

    const urls = data
      .filter((file) => file.name !== ".emptyFolderPlaceholder")
      .map((file) => {
        const { data: publicData } = supabase.storage
          .from("wedding-photos")
          .getPublicUrl(file.name);
        return publicData?.publicUrl || "";
      })
      .filter(Boolean);

    setImageUrls(urls);
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    setUploading(true);
    const files = Array.from(e.target.files);

    for (const file of files) {
      const fileName = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
      const { error } = await supabase.storage
        .from("wedding-photos")
        .upload(fileName, file);

      if (error) {
        console.error("Upload failed:", error.message);
      }
    }

    setUploading(false);
    fetchImages();
  };

  const slides: Slide[] = imageUrls.map((url) => ({ src: url }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-rose-100 p-6">
      <div className="w-full from-rose-50 p-8 flex flex-col items-center">
        <UploadCloud className="w-14 h-14 mb-4 text-rose-500" />
        <h2 className="text-3xl font-bold mb-2 text-rose-600">
          Podelite svoje slike
        </h2>
        <label
          htmlFor="file-upload"
          className="flex flex-col items-center justify-center border-2 border-dashed border-rose-300 rounded-xl p-8 cursor-pointer hover:border-rose-400 transition-all bg-rose-50/50 w-full max-w-lg">
          <span className="text-sm text-rose-600">
            Kliknite ili prevucite sliku ovde
          </span>
          <input
            id="file-upload"
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </label>

        {uploading && (
          <p className="mt-4 text-rose-500 animate-pulse">Uploading...</p>
        )}
      </div>

      {imageUrls.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 justify-center mt-10 max-w-7xl mx-auto">
          {imageUrls.map((src, index) => (
            <div
              key={index}
              className="relative overflow-hidden rounded-lg shadow-lg cursor-pointer hover:scale-105 transition-transform duration-200"
              onClick={() => {
                setLightboxIndex(index);
                setLightboxOpen(true);
              }}>
              <img
                src={src}
                alt={`upload-${index}`}
                loading="lazy"
                className="object-cover w-full h-60"
              />
            </div>
          ))}
        </div>
      )}

      <Lightbox
        slides={slides}
        open={lightboxOpen}
        index={lightboxIndex}
        close={() => setLightboxOpen(false)}
      />
    </div>
  );
};

export default Gallery;
