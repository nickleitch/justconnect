import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

interface SMSSettings {
  provider: string;
  apiKey: string;
  fromNumber: string;
  recipients: string[];
}

interface SMSConfigProps {
  settings: SMSSettings;
  onSettingsChange: (settings: SMSSettings) => void;
}

const SMS_PROVIDERS = [
  { value: "twilio", label: "Twilio" },
  { value: "aws_sns", label: "AWS SNS" },
  { value: "clickatell", label: "Clickatell" },
  { value: "messagebird", label: "MessageBird" },
  { value: "nexmo", label: "Vonage (Nexmo)" },
];

export function SMSConfig({ settings, onSettingsChange }: SMSConfigProps) {
  const handleProviderChange = (provider: string) => {
    onSettingsChange({ ...settings, provider });
  };

  const handleApiKeyChange = (apiKey: string) => {
    onSettingsChange({ ...settings, apiKey });
  };

  const handleFromNumberChange = (fromNumber: string) => {
    onSettingsChange({ ...settings, fromNumber });
  };

  const handleAddRecipient = () => {
    onSettingsChange({ 
      ...settings, 
      recipients: [...settings.recipients, ""] 
    });
  };

  const handleRemoveRecipient = (index: number) => {
    const newRecipients = settings.recipients.filter((_, i) => i !== index);
    onSettingsChange({ ...settings, recipients: newRecipients });
  };

  const handleRecipientChange = (index: number, value: string) => {
    const newRecipients = [...settings.recipients];
    newRecipients[index] = value;
    onSettingsChange({ ...settings, recipients: newRecipients });
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
      <div className="space-y-2">
        <Label htmlFor="sms-provider">SMS Provider</Label>
        <Select value={settings.provider} onValueChange={handleProviderChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select SMS provider" />
          </SelectTrigger>
          <SelectContent>
            {SMS_PROVIDERS.map((provider) => (
              <SelectItem key={provider.value} value={provider.value}>
                {provider.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="api-key">API Key / Token</Label>
        <Input
          id="api-key"
          type="password"
          placeholder="Enter your SMS provider API key"
          value={settings.apiKey}
          onChange={(e) => handleApiKeyChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="from-number">From Number</Label>
        <Input
          id="from-number"
          placeholder="+1234567890"
          value={settings.fromNumber}
          onChange={(e) => handleFromNumberChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Recipients</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddRecipient}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>
        
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {settings.recipients.map((recipient, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                placeholder="+1234567890"
                value={recipient}
                onChange={(e) => handleRecipientChange(index, e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleRemoveRecipient(index)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
        
        {settings.recipients.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No recipients added. Click "Add" to add phone numbers.
          </p>
        )}
      </div>

      <div className="text-xs text-muted-foreground space-y-1">
        <p><strong>Setup Instructions:</strong></p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Twilio:</strong> Get API key from console.twilio.com</li>
          <li><strong>AWS SNS:</strong> Use AWS Access Key ID as API key</li>
          <li><strong>Clickatell:</strong> Get API key from portal.clickatell.com</li>
          <li><strong>MessageBird:</strong> Get API key from dashboard.messagebird.com</li>
          <li><strong>Vonage:</strong> Get API key from dashboard.nexmo.com</li>
        </ul>
      </div>
    </div>
  );
}
