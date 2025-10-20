import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Lightbox, { Slide } from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { UploadCloud } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

const BUCKET = "ivana-nikola";

const Gallery = () => {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const [lightboxIndex, setLightboxIndex] = useState<number>(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const fetchImages = async () => {
    const { data, error } = await supabase
      .from("photos")
      .select("url")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching images from DB:", error.message);
      return;
    }

    setImageUrls(data?.map((d) => d.url) || []);
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    setUploading(true);
    const files = Array.from(e.target.files);

    for (const file of files) {
      const fileName = `${uuidv4()}_${file.name.replace(/\s+/g, "_")}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(fileName, file);

      if (uploadError) {
        console.error("Upload failed:", uploadError.message);
        continue;
      }

      const { data: publicData } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(fileName);

      const publicUrl = publicData?.publicUrl;
      if (!publicUrl) continue;

      const { error: dbError } = await supabase
        .from("photos")
        .insert({ url: publicUrl });

      if (dbError) {
        console.error("DB insert failed:", dbError.message);
        continue;
      }

      setImageUrls((prev) => [publicUrl, ...prev]);
    }

    setUploading(false);

    e.target.value = "";
  };

  const slides: Slide[] = imageUrls.map((url) => ({ src: url }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-white to-rose-100 p-6">
      <div className="w-full p-8 flex flex-col items-center">
        <UploadCloud className="w-14 h-14 mb-4 text-rose-500" />
        <h2 className="text-3xl font-bold mb-2 text-rose-600">
          Podelite svoje slike
        </h2>

        <label
          htmlFor="file-upload"
          className="flex flex-col items-center justify-center border-2 border-dashed border-rose-300 rounded-xl p-8 cursor-pointer hover:border-rose-400 transition-all bg-rose-50/50 w-full max-w-lg">
          <span className="text-sm text-rose-600">
            Kliknite ili prevucite slike ovde
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
          <p className="mt-4 text-rose-500 animate-pulse">Učitavanje...</p>
        )}
      </div>

      {imageUrls.length > 0 ? (
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
                className="object-cover w-full h-60"
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center mt-10 text-rose-400">
          Budite prvi koji ćete okačiti sliku.
        </p>
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
