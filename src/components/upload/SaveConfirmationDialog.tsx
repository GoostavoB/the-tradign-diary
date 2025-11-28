import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface SaveConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  approvedCount: number;
  deletedCount: number;
  onConfirm: () => void;
}

export function SaveConfirmationDialog({
  open,
  onOpenChange,
  approvedCount,
  deletedCount,
  onConfirm,
}: SaveConfirmationDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-[#12161C] border-[#1E242C]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-[#EAEFF4]">Confirm Save</AlertDialogTitle>
          <AlertDialogDescription className="text-[#A6B1BB] space-y-3">
            <p>Please review the changes before saving:</p>
            
            <div className="space-y-2 p-4 rounded-lg bg-[#1A1F28] border border-[#2A3038]">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-400">Trades to save:</span>
                <span className="text-lg font-bold text-green-400">{approvedCount}</span>
              </div>
              
              {deletedCount > 0 && (
                <div className="flex items-center justify-between pt-2 border-t border-[#2A3038]">
                  <span className="text-sm font-medium text-red-400">Trades to skip:</span>
                  <span className="text-lg font-bold text-red-400">{deletedCount}</span>
                </div>
              )}
            </div>
            
            <p className="text-xs">
              {approvedCount === 0 
                ? 'No trades will be saved.' 
                : `${approvedCount} trade${approvedCount !== 1 ? 's' : ''} will be added to your trading history.`}
              {deletedCount > 0 && ` ${deletedCount} deleted trade${deletedCount !== 1 ? 's' : ''} will be skipped.`}
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl border-[#2A3038] text-[#EAEFF4] hover:bg-[#1A1F28]">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={approvedCount === 0}
            className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Confirm & Save
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
