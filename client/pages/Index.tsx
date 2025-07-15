import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  UserPlus,
  ClipboardCheck,
  BarChart3,
  Phone,
  MapPin,
  Calendar,
  TrendingUp,
  CheckCircle,
  Upload,
  FileText,
  Download,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface Participant {
  phone: string;
  name: string;
  gender: "male" | "female";
  county: string;
  attendanceCount: number;
}

const COUNTIES = [
  "Nairobi",
  "Mombasa",
  "Kisumu",
  "Nakuru",
  "Eldoret",
  "Thika",
  "Malindi",
  "Kitale",
  "Garissa",
  "Kakamega",
  "Meru",
  "Nyeri",
  "Machakos",
  "Kericho",
  "Embu",
  "Migori",
  "Bungoma",
  "Lamu",
  "Naivasha",
  "Voi",
  "Wajir",
  "Marsabit",
  "Isiolo",
  "Mandera",
  "Moyale",
  "Kapenguria",
  "Homa Bay",
  "Siaya",
  "Busia",
  "Kilifi",
  "Kwale",
  "Taita Taveta",
  "Tana River",
  "Samburu",
  "Trans Nzoia",
  "Uasin Gishu",
  "Elgeyo Marakwet",
  "Nandi",
  "Baringo",
  "Laikipia",
  "Nyandua",
  "Kirinyaga",
  "Murang'a",
  "Kiambu",
  "Turkana",
  "West Pokot",
  "Bomet",
  "Kajiado",
  "Makueni",
  "Kitui",
];

export default function Index() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [activeTab, setActiveTab] = useState("dashboard");

  // Registration form state
  const [regForm, setRegForm] = useState({
    phone: "",
    name: "",
    gender: "" as "male" | "female" | "",
    county: "",
  });

  // Attendance form state
  const [attendanceForm, setAttendanceForm] = useState({
    phone: "",
    sessions: "1",
  });

  // CSV upload state
  const [csvData, setCsvData] = useState<Participant[]>([]);
  const [showCsvPreview, setShowCsvPreview] = useState(false);
  const [csvErrors, setCsvErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("attendanceData");
    if (saved) {
      setParticipants(JSON.parse(saved));
    }
  }, []);

  // Save data to localStorage whenever participants change
  useEffect(() => {
    localStorage.setItem("attendanceData", JSON.stringify(participants));
  }, [participants]);

  const handleRegister = () => {
    if (!regForm.phone || !regForm.name || !regForm.gender || !regForm.county) {
      toast.error("Please fill in all fields");
      return;
    }

    const phoneExists = participants.find((p) => p.phone === regForm.phone);
    if (phoneExists) {
      toast.error("Phone number already registered");
      return;
    }

    const newParticipant: Participant = {
      phone: regForm.phone,
      name: regForm.name,
      gender: regForm.gender,
      county: regForm.county,
      attendanceCount: 0,
    };

    setParticipants([...participants, newParticipant]);
    setRegForm({
      phone: "",
      name: "",
      gender: "" as "male" | "female" | "",
      county: "",
    });
    toast.success(`${regForm.name} registered successfully!`);
  };

  const handleAttendance = () => {
    if (!attendanceForm.phone || !attendanceForm.sessions) {
      toast.error("Please fill in all fields");
      return;
    }

    const participant = participants.find(
      (p) => p.phone === attendanceForm.phone,
    );
    if (!participant) {
      toast.error("Phone number not registered. Please register first.");
      return;
    }

    const sessions = parseInt(attendanceForm.sessions);
    if (sessions <= 0) {
      toast.error("Number of sessions must be greater than 0");
      return;
    }

    setParticipants(
      participants.map((p) =>
        p.phone === attendanceForm.phone
          ? { ...p, attendanceCount: p.attendanceCount + sessions }
          : p,
      ),
    );

    setAttendanceForm({ phone: "", sessions: "1" });
    toast.success(
      `Attendance recorded: ${sessions} session(s) for ${participant.name}`,
    );
  };

  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast.error("Please upload a CSV file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      parseCsvData(text);
    };
    reader.readAsText(file);
  };

  const parseCsvData = (csvText: string) => {
    const lines = csvText.trim().split("\n");
    const errors: string[] = [];
    const parsed: Participant[] = [];

    // Skip header row if it exists
    const startIndex = lines[0]?.toLowerCase().includes("phone") ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const [phone, name, gender, county] = line
        .split(",")
        .map((cell) => cell.trim().replace(/"/g, ""));

      // Validate required fields
      if (!phone || !name || !gender || !county) {
        errors.push(`Row ${i + 1}: Missing required fields`);
        continue;
      }

      // Validate gender
      if (
        gender.toLowerCase() !== "male" &&
        gender.toLowerCase() !== "female"
      ) {
        errors.push(`Row ${i + 1}: Gender must be 'male' or 'female'`);
        continue;
      }

      // Validate county
      if (!COUNTIES.includes(county)) {
        errors.push(`Row ${i + 1}: Invalid county '${county}'`);
        continue;
      }

      // Check for duplicate phone numbers in current data
      if (parsed.find((p) => p.phone === phone)) {
        errors.push(`Row ${i + 1}: Duplicate phone number in CSV`);
        continue;
      }

      // Check if phone already exists in system
      if (participants.find((p) => p.phone === phone)) {
        errors.push(`Row ${i + 1}: Phone number ${phone} already registered`);
        continue;
      }

      parsed.push({
        phone,
        name,
        gender: gender.toLowerCase() as "male" | "female",
        county,
        attendanceCount: 0,
      });
    }

    setCsvData(parsed);
    setCsvErrors(errors);
    setShowCsvPreview(true);
  };

  const handleCsvImport = () => {
    if (csvData.length === 0) {
      toast.error("No valid data to import");
      return;
    }

    setParticipants([...participants, ...csvData]);
    toast.success(`Successfully imported ${csvData.length} participants!`);

    // Reset states
    setCsvData([]);
    setCsvErrors([]);
    setShowCsvPreview(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const downloadCsvTemplate = () => {
    const csvContent =
      "phone,name,gender,county\n+254700000000,John Doe,male,Nairobi\n+254700000001,Jane Smith,female,Mombasa";
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "participants_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Statistics calculations
  const totalParticipants = participants.length;
  const maleCount = participants.filter((p) => p.gender === "male").length;
  const femaleCount = participants.filter((p) => p.gender === "female").length;
  const totalSessions = participants.reduce(
    (sum, p) => sum + p.attendanceCount,
    0,
  );

  const countyStats = participants.reduce(
    (acc, p) => {
      acc[p.county] = (acc[p.county] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const topCounties = Object.entries(countyStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-primary mb-2">
            AttendanceTracker
          </h1>
          <p className="text-muted-foreground text-lg">
            Simple and efficient participant attendance management
          </p>
        </div>

        {/* Main Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4 lg:w-fit lg:grid-cols-4 mx-auto">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="register" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Register
            </TabsTrigger>
            <TabsTrigger value="attendance" className="flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4" />
              Attendance
            </TabsTrigger>
            <TabsTrigger
              value="participants"
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Participants
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Total Participants
                  </CardTitle>
                  <Users className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {totalParticipants}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border-emerald-200 dark:border-emerald-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                    Total Sessions
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                    {totalSessions}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950 dark:to-pink-900 border-pink-200 dark:border-pink-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-pink-700 dark:text-pink-300">
                    Female Participants
                  </CardTitle>
                  <Users className="h-4 w-4 text-pink-700 dark:text-pink-300" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-pink-900 dark:text-pink-100">
                    {femaleCount}
                  </div>
                  <p className="text-xs text-pink-600 dark:text-pink-400">
                    {totalParticipants > 0
                      ? `${Math.round((femaleCount / totalParticipants) * 100)}%`
                      : "0%"}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950 dark:to-cyan-900 border-cyan-200 dark:border-cyan-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-cyan-700 dark:text-cyan-300">
                    Male Participants
                  </CardTitle>
                  <Users className="h-4 w-4 text-cyan-700 dark:text-cyan-300" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-cyan-900 dark:text-cyan-100">
                    {maleCount}
                  </div>
                  <p className="text-xs text-cyan-600 dark:text-cyan-400">
                    {totalParticipants > 0
                      ? `${Math.round((maleCount / totalParticipants) * 100)}%`
                      : "0%"}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Top Counties */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Top Counties by Participation
                </CardTitle>
                <CardDescription>
                  Counties with the most registered participants
                </CardDescription>
              </CardHeader>
              <CardContent>
                {topCounties.length > 0 ? (
                  <div className="space-y-3">
                    {topCounties.map(([county, count], index) => (
                      <div
                        key={county}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <Badge
                            variant="outline"
                            className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs"
                          >
                            {index + 1}
                          </Badge>
                          <span className="font-medium">{county}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-secondary rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{
                                width: `${(count / totalParticipants) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium w-8 text-right">
                            {count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No participants registered yet
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Register Tab */}
          <TabsContent value="register" className="space-y-6">
            {/* Individual Registration */}
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" />
                  Register Individual Participant
                </CardTitle>
                <CardDescription>
                  Add a single participant to the attendance tracking system
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      placeholder="+254 700 000 000"
                      value={regForm.phone}
                      onChange={(e) =>
                        setRegForm({ ...regForm, phone: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={regForm.name}
                      onChange={(e) =>
                        setRegForm({ ...regForm, name: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={regForm.gender}
                      onValueChange={(value: "male" | "female") =>
                        setRegForm({ ...regForm, gender: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="county">County</Label>
                    <Select
                      value={regForm.county}
                      onValueChange={(value) =>
                        setRegForm({ ...regForm, county: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select county" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTIES.map((county) => (
                          <SelectItem key={county} value={county}>
                            {county}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleRegister} className="w-full" size="lg">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Register Participant
                </Button>
              </CardContent>
            </Card>

            {/* Separator */}
            <div className="flex items-center gap-4 max-w-2xl mx-auto">
              <Separator className="flex-1" />
              <span className="text-sm text-muted-foreground">OR</span>
              <Separator className="flex-1" />
            </div>

            {/* Bulk CSV Upload */}
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Bulk Import via CSV
                </CardTitle>
                <CardDescription>
                  Upload a CSV file to register multiple participants at once
                  (perfect for 50+ people)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Template Download */}
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-blue-900 dark:text-blue-100">
                        CSV Format Required
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                        Your CSV file should have columns: phone, name, gender,
                        county
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 border-blue-200 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900"
                        onClick={downloadCsvTemplate}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Template
                      </Button>
                    </div>
                  </div>
                </div>

                {/* File Upload */}
                <div className="space-y-2">
                  <Label htmlFor="csvFile">Select CSV File</Label>
                  <Input
                    id="csvFile"
                    type="file"
                    accept=".csv"
                    ref={fileInputRef}
                    onChange={handleCsvUpload}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum file size: 10MB. Supported format: CSV
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-6">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5" />
                  Record Attendance
                </CardTitle>
                <CardDescription>
                  Mark attendance for registered participants
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="attendancePhone">Phone Number</Label>
                    <Input
                      id="attendancePhone"
                      placeholder="+254 700 000 000"
                      value={attendanceForm.phone}
                      onChange={(e) =>
                        setAttendanceForm({
                          ...attendanceForm,
                          phone: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sessions">Number of Sessions</Label>
                    <Input
                      id="sessions"
                      type="number"
                      min="1"
                      placeholder="1"
                      value={attendanceForm.sessions}
                      onChange={(e) =>
                        setAttendanceForm({
                          ...attendanceForm,
                          sessions: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <Button onClick={handleAttendance} className="w-full" size="lg">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Record Attendance
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Participants Tab */}
          <TabsContent value="participants" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  All Participants
                </CardTitle>
                <CardDescription>
                  Complete list of registered participants and their attendance
                </CardDescription>
              </CardHeader>
              <CardContent>
                {participants.length > 0 ? (
                  <div className="space-y-4">
                    {participants.map((participant) => (
                      <div
                        key={participant.phone}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <p className="font-medium">{participant.name}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {participant.phone}
                            </p>
                          </div>
                          <div>
                            <Badge
                              variant={
                                participant.gender === "male"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {participant.gender}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-sm flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {participant.county}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline" className="bg-accent/10">
                              {participant.attendanceCount} sessions
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No participants registered yet
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setActiveTab("register")}
                    >
                      Register First Participant
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* CSV Preview Dialog */}
        <Dialog open={showCsvPreview} onOpenChange={setShowCsvPreview}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                CSV Import Preview
              </DialogTitle>
              <DialogDescription>
                Review the participants before importing. {csvData.length} valid
                entries found.
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-hidden flex flex-col gap-4">
              {/* Errors Section */}
              {csvErrors.length > 0 && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <h4 className="font-medium text-destructive">
                      {csvErrors.length} Error(s) Found
                    </h4>
                  </div>
                  <div className="max-h-24 overflow-y-auto">
                    {csvErrors.map((error, index) => (
                      <p key={index} className="text-sm text-destructive">
                        • {error}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview Table */}
              {csvData.length > 0 && (
                <div className="flex-1 overflow-hidden">
                  <h4 className="font-medium mb-2">
                    Valid Participants ({csvData.length})
                  </h4>
                  <div className="border rounded-lg overflow-auto max-h-64">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Phone Number</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Gender</TableHead>
                          <TableHead>County</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {csvData.map((participant, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-mono text-sm">
                              {participant.phone}
                            </TableCell>
                            <TableCell>{participant.name}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  participant.gender === "male"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {participant.gender}
                              </Badge>
                            </TableCell>
                            <TableCell>{participant.county}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCsvPreview(false);
                  setCsvData([]);
                  setCsvErrors([]);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCsvImport}
                disabled={csvData.length === 0}
                className="min-w-32"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import {csvData.length} Participants
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
