import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { LogOut, Plus, Trash2, Edit, Check, X, Layout } from "lucide-react";

interface Table {
  id: string;
  name: string;
  capacity: number;
  created_at: string | null;
}

interface RSVP {
  id: string;
  contact_info: string;
  guest_count: number;
  guest_names: string[];
  created_at: string;
}

interface GuestAssignment {
  id: string;
  table_id: string;
  rsvp_id: string;
  guest_name: string;
  seat_number: number;
  created_at: string | null;
}

const AdminTables = () => {
  const navigate = useNavigate();

  const [tables, setTables] = useState<Table[]>([]);
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [assignments, setAssignments] = useState<GuestAssignment[]>([]);

  const [newTableName, setNewTableName] = useState("");
  const [newTableCapacity, setNewTableCapacity] = useState(4);

  const [selectedTable, setSelectedTable] = useState<string>("");
  const [selectedGuestId, setSelectedGuestId] = useState<string>("");
  const [guestName, setGuestName] = useState("");

  const [assignmentSearch, setAssignmentSearch] = useState("");

  const [editTableId, setEditTableId] = useState<string | null>(null);
  const [editTableName, setEditTableName] = useState("");
  const [editTableCapacity, setEditTableCapacity] = useState(0);

  const goToGuests = () => {
    navigate("/admin");
  };

  useEffect(() => {
    checkAuth();
    fetchTables();
    fetchRSVPs();
    fetchAssignments();
  }, []);

  useEffect(() => {
    if (!selectedGuestId) {
      setGuestName("");
      return;
    }
    const [rsvpId, idxStr] = selectedGuestId.split("__");
    const idx = Number(idxStr);
    const rsvp = rsvps.find((r) => r.id === rsvpId);
    if (rsvp) setGuestName(rsvp.guest_names[idx] || "");
  }, [selectedGuestId, rsvps]);

  const checkAuth = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) navigate("/admin/login");
  };

  const fetchTables = async () => {
    const { data, error } = await supabase.from("tables").select("*");
    if (error)
      toast({
        title: "Greška",
        description: error.message,
        variant: "destructive",
      });
    else setTables(data || []);
  };

  const fetchRSVPs = async () => {
    const { data, error } = await supabase.from("rsvps").select("*");
    if (error)
      toast({
        title: "Greška",
        description: error.message,
        variant: "destructive",
      });
    else setRsvps(data || []);
  };

  const fetchAssignments = async () => {
    const { data, error } = await supabase
      .from("guest_assignments")
      .select("*");
    if (error)
      toast({
        title: "Greška",
        description: error.message,
        variant: "destructive",
      });
    else setAssignments(data || []);
  };

  const createTable = async () => {
    if (!newTableName || newTableCapacity <= 0) {
      toast({
        title: "Greška",
        description: "Unesite validan naziv i kapacitet",
        variant: "destructive",
      });
      return;
    }
    const { data, error } = await supabase
      .from("tables")
      .insert([{ name: newTableName, capacity: newTableCapacity }])
      .select();
    if (error)
      toast({
        title: "Greška",
        description: error.message,
        variant: "destructive",
      });
    else if (data?.length) {
      setTables([...tables, data[0]]);
      setNewTableName("");
      setNewTableCapacity(4);
    }
  };

  const assignGuestToTable = async () => {
    if (!selectedTable || !selectedGuestId) {
      toast({
        title: "Greška",
        description: "Popunite sve podatke za dodelu gosta",
        variant: "destructive",
      });
      return;
    }

    const [rsvpId, idxStr] = selectedGuestId.split("__");
    const idx = Number(idxStr);
    const rsvp = rsvps.find((r) => r.id === rsvpId);

    if (!rsvp) {
      toast({
        title: "Greška",
        description: "RSVP nije pronađen",
        variant: "destructive",
      });
      return;
    }

    const guestNameToAssign = rsvp.guest_names[idx];
    console.log(rsvp.guest_names[idx]);
    if (!guestNameToAssign) {
      toast({
        title: "Greška",
        description: "Ime gosta nije pronađeno",
        variant: "destructive",
      });
      return;
    }

    if (assignments.some((a) => a.guest_name === guestNameToAssign)) {
      toast({
        title: "Greška",
        description: "Ovaj gost je već dodeljen nekom stolu",
        variant: "destructive",
      });
      return;
    }

    const { data, error } = await supabase
      .from("guest_assignments")
      .insert([
        {
          table_id: selectedTable,
          rsvp_id: rsvpId,
          guest_name: guestNameToAssign,
          seat_number: idx,
        },
      ])
      .select();

    if (error) {
      toast({
        title: "Greška",
        description: error.message,
        variant: "destructive",
      });
    } else if (data?.length) {
      setAssignments((prev) => [...prev, data[0]]);
      setSelectedGuestId("");
    }
  };

  const deleteAssignment = async (id: string) => {
    const { error } = await supabase
      .from("guest_assignments")
      .delete()
      .eq("id", id);
    if (error)
      toast({
        title: "Greška",
        description: error.message,
        variant: "destructive",
      });
    else setAssignments(assignments.filter((a) => a.id !== id));
  };

  const deleteTable = async (id: string) => {
    const { error } = await supabase.from("tables").delete().eq("id", id);
    if (error)
      toast({
        title: "Greška",
        description: error.message,
        variant: "destructive",
      });
    else setTables(tables.filter((t) => t.id !== id));
  };

  const startEditTable = (table: Table) => {
    setEditTableId(table.id);
    setEditTableName(table.name);
    setEditTableCapacity(table.capacity);
  };

  const saveEditTable = async () => {
    if (!editTableId || !editTableName || editTableCapacity <= 0) {
      toast({
        title: "Greška",
        description: "Unesite validne podatke",
        variant: "destructive",
      });
      return;
    }
    const { error } = await supabase
      .from("tables")
      .update({ name: editTableName, capacity: editTableCapacity })
      .eq("id", editTableId);
    if (error)
      toast({
        title: "Greška",
        description: error.message,
        variant: "destructive",
      });
    else {
      setTables(
        tables.map((t) =>
          t.id === editTableId
            ? { ...t, name: editTableName, capacity: editTableCapacity }
            : t
        )
      );
      setEditTableId(null);
    }
  };

  const availableGuests = useMemo(() => {
    return rsvps
      .flatMap((rsvp) =>
        rsvp.guest_names.map((name, idx) => ({
          value: `${rsvp.id}__${idx}`,
          label: `${name} (${rsvp.contact_info})`,
          rsvpId: rsvp.id,
          guestName: name,
          guestIdx: idx,
        }))
      )
      .filter(
        (guest) =>
          !assignments.some(
            (a) =>
              a.rsvp_id === guest.rsvpId && a.seat_number === guest.guestIdx
          )
      );
  }, [rsvps, assignments]);

  return (
    <div className="min-h-screen p-6 md:p-10 bg-gray-50">
      <div className="max-w-full">
        <div className="flex justify-between items-center mb-2">
          <h1
            className="text-4xl font-bold"
            style={{ color: "hsl(var(--wedding-rose))" }}>
            Upravljanje stolovima
          </h1>

          <div className="flex space-x-2">
            <Button onClick={goToGuests} variant="outline">
              <Layout className="mr-2 h-4 w-4" />
              Spisak gostiju
            </Button>
            <Button variant="outline" onClick={() => navigate("/")}>
              <LogOut className="mr-2 h-4 w-4" /> Odjava
            </Button>
          </div>
        </div>

        <Card className="mb-10 mt-10">
          <CardHeader>
            <CardTitle>Stolovi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4 flex-wrap">
              <Input
                placeholder="Naziv stola"
                value={newTableName}
                onChange={(e) => setNewTableName(e.target.value)}
              />
              <Input
                type="text"
                placeholder="Kapacitet"
                value={newTableCapacity}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  setNewTableCapacity(Number(val));
                }}
              />

              <Button onClick={createTable}>
                <Plus className="mr-2 h-4 w-4" /> Dodaj sto
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tables.map((table) => (
                <div
                  key={table.id}
                  className="p-4 bg-white border rounded-lg shadow-sm flex flex-col justify-between">
                  {editTableId === table.id ? (
                    <div className="flex flex-col gap-2">
                      <Input
                        value={editTableName}
                        onChange={(e) => setEditTableName(e.target.value)}
                      />

                      <Input
                        type="number"
                        value={editTableCapacity}
                        onChange={(e) =>
                          setEditTableCapacity(Number(e.target.value))
                        }
                      />
                      <div className="flex gap-2 justify-end">
                        <Button onClick={saveEditTable}>
                          <Check className="mr-2" /> Sačuvaj
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setEditTableId(null)}>
                          <X className="mr-2" /> Otkaži
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <h3 className="font-semibold text-lg">{table.name}</h3>
                        <p className="text-gray-600">
                          Kapacitet: {table.capacity}
                        </p>
                      </div>
                      <div className="flex gap-2 justify-end mt-3">
                        <Button
                          size="icon"
                          onClick={() => startEditTable(table)}>
                          <Edit />
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          onClick={() => deleteTable(table.id)}>
                          <Trash2 />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sekcija 2 - Dodela gosta stolu */}
        <Card className="mb-10">
          <CardHeader>
            <CardTitle>Dodeli gosta stolu</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Select
              options={tables.map((table) => ({
                value: table.id,
                label: `${table.name} (Kapacitet: ${table.capacity})`,
              }))}
              value={
                selectedTable
                  ? {
                      value: selectedTable,
                      label:
                        tables.find((t) => t.id === selectedTable)?.name || "",
                    }
                  : null
              }
              onChange={(option) => setSelectedTable(option?.value || "")}
              isSearchable
              placeholder="Pretraži i izaberite sto"
            />
            <Select
              options={availableGuests}
              value={
                selectedGuestId
                  ? availableGuests.find((g) => g.value === selectedGuestId) ||
                    null
                  : null
              }
              onChange={(option) => setSelectedGuestId(option?.value || "")}
              isSearchable
              placeholder="Pretraži i izaberite gosta"
            />
            <Button onClick={assignGuestToTable}>
              <Plus className="mr-2 h-4 w-4" /> Dodeli gosta
            </Button>
          </CardContent>
        </Card>

        {/* Sekcija 3 - Dodele stolova */}
        <Card>
          <CardHeader>
            <CardTitle>Dodele stolova</CardTitle>
            <Input
              placeholder="Pretraži gosta..."
              value={assignmentSearch}
              onChange={(e) => setAssignmentSearch(e.target.value)}
            />
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tables.map((table) => {
              const tableAssignments = assignments
                .filter((a) => a.table_id === table.id)
                .filter((a) =>
                  a.guest_name
                    .toLowerCase()
                    .includes(assignmentSearch.toLowerCase())
                );

              if (tableAssignments.length === 0) return null;

              return (
                <div
                  key={table.id}
                  className="bg-white border rounded-lg p-4 shadow-sm">
                  <h3 className="text-lg font-semibold mb-2">{table.name}</h3>
                  <ul className="space-y-2">
                    {tableAssignments.map((a) => (
                      <li
                        key={a.id}
                        className="flex justify-between items-center bg-gray-50 p-2 rounded">
                        <span>{a.guest_name}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500"
                          onClick={() => deleteAssignment(a.id)}>
                          <Trash2 />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminTables;
