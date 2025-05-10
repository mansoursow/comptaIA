import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface UserToggleProps {
  value: boolean;
  onChange: () => void;
}

export default function UserToggle({ value, onChange }: UserToggleProps) {
  return (
    <div className="bg-white p-2 rounded-lg shadow-md flex items-center space-x-3">
      <Label htmlFor="user-type-toggle" className={`text-sm ${!value ? 'font-bold text-primary' : 'text-gray-500'}`}>
        Client
      </Label>
      <Switch
        id="user-type-toggle"
        checked={value}
        onCheckedChange={onChange}
      />
      <Label htmlFor="user-type-toggle" className={`text-sm ${value ? 'font-bold text-primary' : 'text-gray-500'}`}>
        Comptable
      </Label>
    </div>
  );
}
