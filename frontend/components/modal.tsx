import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Edit, Plus } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

const entranceAnim =
  "animate-in fade-in slide-in-from-bottom-4 duration-400 ease-out fill-mode-both";

export function Modal({
  open,
  onOpenChange,
  children,
  address,
  title,
  description,
}: {
  open: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
  children: React.ReactNode;
  address: boolean;
  title: string;
  description: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {address ? (
          <button className="inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
            <Edit className="w-4 h-4" />
            Edit
          </button>
        ) : (
          <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 font-medium delay-300 z-2">
            <Plus className="w-5 h-5" />
            Add New Address
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700] p-8">
        <DialogHeader>
          <DialogTitle className="text-xl">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
