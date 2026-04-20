import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type AdminComposerProps = {
  disabled: boolean;
  onSend: (text: string, imageUrl: string) => Promise<boolean>;
};

export function AdminComposer({ disabled, onSend }: AdminComposerProps) {
  const [adminText, setAdminText] = useState('');
  const [adminImageUrl, setAdminImageUrl] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    setSending(true);
    const ok = await onSend(adminText, adminImageUrl);
    setSending(false);

    if (ok) {
      setAdminText('');
      setAdminImageUrl('');
    }
  };

  return (
    <div className="mt-4 space-y-3 border-t pt-4">
      <h3 className="text-sm font-bold tracking-tight">Manuelle Admin-Hilfe senden</h3>
      <Textarea
        value={adminText}
        onChange={(event) => setAdminText(event.target.value)}
        rows={4}
        placeholder="Nachricht an den Kunden verfassen..."
      />
      <Input
        type="url"
        value={adminImageUrl}
        onChange={(event) => setAdminImageUrl(event.target.value)}
        placeholder="Optionale Bild-URL (https://...)"
      />
      <Button onClick={handleSend} disabled={disabled || sending}>
        {sending ? 'Sende...' : 'Admin-Nachricht senden'}
      </Button>
    </div>
  );
}
