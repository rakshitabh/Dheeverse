import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Undo2, Trash2, Archive, Lock } from 'lucide-react';
import { useJournal } from '@/lib/journal-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { userAPI } from '@/lib/api';
import { toast } from 'sonner';

export default function ArchivePage() {
  const { entries, restoreEntry, deleteEntry, loading } = useJournal();
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [verifying, setVerifying] = useState(false);

  const archived = entries.filter((e) => e.isArchived);

  useEffect(() => {
    const checkProtection = async () => {
      try {
        const res = await userAPI.getSettings();
        if (res.hasArchivePassword) {
          // Always ask on each visit if archive is protected
          setRequiresPassword(true);
        } else {
          setRequiresPassword(false);
        }
      } catch (err) {
        console.error('Failed to load settings', err);
      }
    };
    checkProtection();
  }, []);

  const handleVerify = async () => {
    if (!password.trim()) return;
    setVerifying(true);
    try {
      const res = await userAPI.verifyArchivePassword(password.trim());
      if (res.valid) {
        setRequiresPassword(false);
        setPassword('');
      } else {
        toast.error('Incorrect archive password');
      }
    } catch (err) {
      toast.error('Failed to verify archive password');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Archive</h1>
          <p className="text-muted-foreground">
            {loading ? 'Loading...' : `${archived.length} archived entries`}
          </p>
        </div>
      </div>

      {requiresPassword ? (
        <Card className="border-dashed">
          <CardContent className="py-8 space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Lock className="h-5 w-5" />
              <p className="text-sm font-medium">Archive is protected</p>
            </div>
            <Input
              type="password"
              placeholder="Enter archive password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button onClick={handleVerify} disabled={verifying || !password.trim()}>
              {verifying ? 'Verifying...' : 'Unlock Archive'}
            </Button>
          </CardContent>
        </Card>
      ) : archived.length === 0 && !loading ? (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center space-y-3">
            <Archive className="w-8 h-8 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">No archived entries yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {archived.map((entry) => (
            <Card key={entry.id} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-sm font-semibold">
                    {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" onClick={() => restoreEntry(entry.id)}>
                      <Undo2 className="h-4 w-4 mr-1" />
                      Restore
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => deleteEntry(entry.id)}>
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{entry.content}</p>
                {entry.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {entry.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
