import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { LogOut, Search, Users, Trash2, Layout } from "lucide-react";

interface RSVP {
  id: string;
  contact_info: string;
  guest_count: number;
  guest_names: string[];
  created_at: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [filteredRsvps, setFilteredRsvps] = useState<RSVP[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const goToTables = () => {
    navigate("/admin/tables");
  };

  useEffect(() => {
    checkAuth();
    fetchRSVPs();
  }, []);

  useEffect(() => {
    filterRSVPs();
  }, [searchQuery, rsvps]);

  const checkAuth = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      navigate("/admin/login");
      return;
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .single();

    if (!roleData || roleData.role !== "admin") {
      toast({
        title: "Greška",
        description: "Nemate admin pristup",
        variant: "destructive",
      });
      await supabase.auth.signOut();
      navigate("/");
    }
  };

  const fetchRSVPs = async () => {
    try {
      const { data, error } = await supabase
        .from("rsvps")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setRsvps(data || []);
    } catch (error: any) {
      toast({
        title: "Greška",
        description: error.message || "Nije moguće učitati potvrđivanja",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterRSVPs = () => {
    if (!searchQuery.trim()) {
      setFilteredRsvps(rsvps);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = rsvps.filter(
      (rsvp) =>
        rsvp.contact_info.toLowerCase().includes(query) ||
        rsvp.guest_names.some((name) => name.toLowerCase().includes(query))
    );

    setFilteredRsvps(filtered);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Da li ste sigurni da želite da obrišete ovo potvrđivanje?")) {
      return;
    }

    try {
      const { error } = await supabase.from("rsvps").delete().eq("id", id);

      if (error) throw error;

      setRsvps(rsvps.filter((rsvp) => rsvp.id !== id));
      toast({
        title: "Uspešno obrisano",
        description: "Potvrđivanje je uklonjeno",
      });
    } catch (error: any) {
      toast({
        title: "Greška",
        description: error.message || "Nije moguće obrisati",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const totalGuests = rsvps.reduce((sum, rsvp) => sum + rsvp.guest_count, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Učitavanje...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1
              className="text-4xl font-bold mb-2"
              style={{ color: "hsl(var(--wedding-rose))" }}>
              Upravljanje potvrđivanjima prisustva
            </h1>
            <p className="wedding-subtitle"></p>
          </div>

          <div className="flex space-x-2">
            <Button onClick={goToTables} variant="outline">
              <Layout className="mr-2 h-4 w-4" />
              Raspored stolova
            </Button>

            <Button onClick={handleLogout} variant="outline">
              <LogOut className="mr-2 h-4 w-4" />
              Odjavi se
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Ukupno potvrđivanja</CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className="text-4xl font-bold"
                style={{ color: "hsl(var(--wedding-rose))" }}>
                {rsvps.length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ukupno gostiju</CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className="text-4xl font-bold"
                style={{ color: "hsl(var(--wedding-rose))" }}>
                {totalGuests}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Pretraga gostiju</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Pretražite goste..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {filteredRsvps.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "Nema rezultata pretrage"
                    : "Još nema potvrđenih gostiju"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredRsvps.map((rsvp) => (
              <Card key={rsvp.id} className="animate-fade-in">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Users
                          className="h-5 w-5"
                          style={{ color: "hsl(var(--wedding-rose))" }}
                        />
                        <span className="font-semibold text-lg">
                          {rsvp.guest_count}{" "}
                          {rsvp.guest_count === 1 ? "gost" : "gosta"}
                        </span>
                      </div>

                      <p className="text-sm text-muted-foreground mb-3">
                        Kontakt: {rsvp.contact_info}
                      </p>

                      <div className="space-y-1">
                        <p className="font-medium">Imena gostiju:</p>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          {rsvp.guest_names.map((name, idx) => (
                            <li key={idx}>{name}</li>
                          ))}
                        </ul>
                      </div>

                      <p className="text-xs text-muted-foreground mt-3">
                        Potvrđeno:{" "}
                        {new Date(rsvp.created_at).toLocaleDateString("sr-RS", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(rsvp.id)}
                      className="text-destructive hover:text-destructive">
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
