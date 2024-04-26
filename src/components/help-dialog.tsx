import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const HelpDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link">Clockify Requirements</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <div className="space-y-4">
            <DialogTitle>Logging Time Correctly</DialogTitle>
            <DialogDescription>
              This tool expects your time entries to be in an exact format. To
              avoid incorrect or missing time entries, please ensure you do the
              following.
            </DialogDescription>
          </div>
        </DialogHeader>
        <div className="space-y-2">
          <p className="font-medium">All Time Entries</p>
          <ul className="text-sm list-disc px-4">
            <li>Enter a detailed description</li>
            <li>Select a project</li>
          </ul>
          <p className="font-medium">Paid Client Work</p>
          <ul className="text-sm list-disc px-4">
            <li>Click the billable icon - $</li>
            <li>
              Prefix the description with the call number, i.e. &quot;abc00001 -
              Inspection form building&quot;
            </li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HelpDialog;
