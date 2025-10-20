import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Plus, Minus, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const RSVPForm = () => {
  const [contactInfo, setContactInfo] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  const [guestNames, setGuestNames] = useState<string[]>([""]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGuestCountChange = (newCount: number) => {
    if (newCount < 1 || newCount > 20) return;

    setGuestCount(newCount);
    const newGuestNames = [...guestNames];

    if (newCount > guestNames.length) {
      for (let i = guestNames.length; i < newCount; i++) {
        newGuestNames.push("");
      }
    } else {
      newGuestNames.splice(newCount);
    }

    setGuestNames(newGuestNames);
  };

  const updateGuestName = (index: number, name: string) => {
    const newGuestNames = [...guestNames];
    newGuestNames[index] = name;
    setGuestNames(newGuestNames);
  };

  const removeGuest = (index: number) => {
    if (guestCount <= 1) return;

    const newGuestNames = guestNames.filter((_, i) => i !== index);
    setGuestNames(newGuestNames);
    setGuestCount(guestCount - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!contactInfo.trim()) {
      toast({
        title: "Greška",
        description: "Molimo unesite kontakt informacije",
        variant: "destructive",
      });
      return;
    }

    const filledNames = guestNames.filter((name) => name.trim() !== "");
    if (filledNames.length === 0) {
      toast({
        title: "Greška",
        description: "Molimo unesite najmanje jedno ime gosta",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("rsvps").insert({
        contact_info: contactInfo.trim(),
        guest_count: filledNames.length,
        guest_names: filledNames,
      });

      if (error) throw error;

      toast({
        title: "Uspešno potvrđeno!",
        description: `Hvala što ste potvrdili prisustvo za ${
          filledNames.length
        } ${filledNames.length === 1 ? "osobu" : "osobe/osoba"}!`,
      });

      setContactInfo("");
      setGuestCount(1);
      setGuestNames([""]);
    } catch (error: any) {
      toast({
        title: "Greška",
        description: error.message || "Došlo je do greške pri potvrđivanju",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="section-card max-w-2xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <Users
          className="w-16 h-16 mx-auto mb-4"
          style={{ color: "hsl(var(--wedding-rose))" }}
        />
        <h2
          className="text-3xl md:text-4xl font-bold mb-2"
          style={{ color: "hsl(var(--wedding-rose))" }}>
          Potvrdite prisustvo
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="contact" className="text-base">
            Kontakt informacije
          </Label>
          <Input
            id="contact"
            type="text"
            placeholder="Vaš broj telefona"
            value={contactInfo}
            onChange={(e) => setContactInfo(e.target.value)}
            className="text-base"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-base">Broj osoba</Label>
          <div className="flex items-center justify-center gap-4">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => handleGuestCountChange(guestCount - 1)}
              disabled={guestCount <= 1}
              className="h-12 w-12">
              <Minus className="h-5 w-5" />
            </Button>

            <div
              className="text-4xl font-bold w-20 text-center"
              style={{ color: "hsl(var(--wedding-rose))" }}>
              {guestCount}
            </div>

            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => handleGuestCountChange(guestCount + 1)}
              disabled={guestCount >= 20}
              className="h-12 w-12">
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-base">Imena gostiju</Label>
          {guestNames.map((name, index) => (
            <div key={index} className="flex gap-2">
              <Input
                type="text"
                placeholder={`Ime ${index + 1}. gosta`}
                value={name}
                onChange={(e) => updateGuestName(index, e.target.value)}
                className="flex-1"
              />
              {guestCount > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeGuest(index)}
                  className="flex-shrink-0">
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        <Button
          type="submit"
          className="w-full text-lg py-6"
          disabled={isSubmitting}>
          {isSubmitting ? "Šalje se..." : "Potvrdi prisustvo"}
        </Button>
      </form>
    </div>
  );
};

export default RSVPForm;
