
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useEvents } from "@/contexts/EventContext";

interface ImportEventsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ImportEventsModal: React.FC<ImportEventsModalProps> = ({ isOpen, onClose }) => {
  const [csvData, setCsvData] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const { importEvents } = useEvents();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
      toast({
        title: "Invalid file",
        description: "Please upload a CSV file.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setCsvData(event.target.result as string);
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!csvData.trim()) {
      toast({
        title: "No data to import",
        description: "Please upload a CSV file or paste CSV data.",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    try {
      await importEvents(csvData);
      onClose();
      setCsvData("");
    } catch (error) {
      console.error("Import error:", error);
      toast({
        title: "Import failed",
        description: "There was an error importing your events. Please check your CSV format.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Events from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file or paste CSV data directly. The CSV should have headers: title, description, date, location, category, imageUrl (optional), tags (optional, comma-separated).
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="csvFile" className="text-sm font-medium">
              Upload CSV File
            </label>
            <input
              id="csvFile"
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="cursor-pointer rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium"
            />
          </div>
          
          <div className="grid gap-2">
            <label htmlFor="csvData" className="text-sm font-medium">
              Or Paste CSV Data
            </label>
            <Textarea
              id="csvData"
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              placeholder="title,description,date,location,category,imageUrl,tags"
              className="min-h-32"
            />
          </div>
        </div>
        
        <DialogFooter className="flex sm:justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={isImporting || !csvData.trim()}>
            {isImporting ? "Importing..." : "Import Events"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportEventsModal;
