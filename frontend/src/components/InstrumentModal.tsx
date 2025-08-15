import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "./ui/dialog";
import { Badge } from "./badge";
import { ALL_INSTRUMENTS } from "../types/instruments.types";
import { SecureInput } from "./ui/secure-form";

interface InstrumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstrumentSelected: (instrument: { id: number; label: string }) => void;
}

export const InstrumentModal: React.FC<InstrumentModalProps> = ({
  isOpen,
  onClose,
  onInstrumentSelected,
}) => {
  const [searchTerm, setSearchTerm] = React.useState("");

  React.useEffect(() => {
    if (!isOpen) setSearchTerm("");
  }, [isOpen]);

  const filteredInstruments = ALL_INSTRUMENTS.filter((inst) =>
    inst.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Instrument</DialogTitle>
          <DialogDescription>
            Search and select an instrument for this task.
          </DialogDescription>
        </DialogHeader>
        <SecureInput
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          placeholder="Search instruments..."
          autoFocus
        />
        <div className="flex flex-col gap-2 max-h-48 overflow-y-auto mb-2">
          {filteredInstruments.length > 0 ? (
            filteredInstruments.map((inst) => {
              return (
                <button
                  key={inst.id}
                  type="button"
                  onClick={() => {
                    onInstrumentSelected(inst);
                    onClose();
                  }}
                  className="focus:outline-none text-left"
                >
                  <Badge
                    variant="secondary"
                    className="h-5 px-3 py-2 rounded-md !hover:bg-none !hover:bg-transparent cursor-pointer select-none"
                  >
                    {inst.label}
                  </Badge>
                </button>
              );
            })
          ) : (
            <div className="text-muted-foreground text-sm">
              No instruments found.
            </div>
          )}
        </div>
        <DialogClose asChild>
          <button className="mt-4 w-full px-3 py-2 border border-border rounded-lg hover:bg-accent transition-colors">
            Cancel
          </button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};
