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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Logging Time Correctly</DialogTitle>
          <DialogDescription>
            To ensure the timesheet is as accurate as possible, ensure you do
            the following.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <p className="font-medium">All Entries</p>
          <ul className="text-sm list-disc px-4">
            <li>Add a description.</li>
          </ul>
          <p className="font-medium">Client Work</p>
          <ul className="text-sm list-disc px-4">
            <li>Click the billable icon - $.</li>
            <li>
              Prefix the description with the client code. For example,
              "abc00001 - Configuration work".
            </li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HelpDialog;
