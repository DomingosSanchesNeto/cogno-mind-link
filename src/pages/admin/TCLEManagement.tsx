import { useState, useEffect } from 'react';
import { Save, Upload, Link, FileText, Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useTCLE, uploadToStorage } from '@/hooks/useSupabaseData';
import { validateFile } from '@/lib/security';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function TCLEManagement() {
  const { tcle, loading, saveTCLE, fetchActiveTCLE } = useTCLE();
  const { toast } = useToast();
  const [fileInputType, setFileInputType] = useState<'url' | 'upload'>('url');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    content: '',
    fileUrl: '',
    versionTag: 'TCLE_v1.0',
    isActive: true,
  });

  useEffect(() => {
    if (tcle) {
      setFormData({
        content: tcle.content,
        fileUrl: tcle.fileUrl || '',
        versionTag: tcle.versionTag,
        isActive: tcle.isActive,
      });
    }
  }, [tcle]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateFile(file, ['pdf', 'docx'], 5);
    if (!validation.valid) {
      toast({
        title: 'Erro no upload',
        description: validation.error,
        variant: 'destructive',
      });
      e.target.value = '';
      return;
    }

    setPendingFile(file);
    toast({ title: 'Arquivo selecionado. Será enviado ao salvar.' });
  };

  const handleSave = async () => {
    if (!formData.content.trim()) {
      toast({
        title: 'Erro',
        description: 'O texto do TCLE é obrigatório.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.versionTag.trim()) {
      toast({
        title: 'Erro',
        description: 'A versão do TCLE é obrigatória.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);

    try {
      let fileUrl = formData.fileUrl;

      // Upload file if pending
      if (pendingFile) {
        const uploadedUrl = await uploadToStorage(pendingFile, 'tcle');
        if (uploadedUrl) {
          fileUrl = uploadedUrl;
        } else {
          toast({
            title: 'Erro no upload',
            description: 'Falha ao enviar o arquivo.',
            variant: 'destructive',
          });
          setSaving(false);
          return;
        }
      }

      const { error } = await saveTCLE({
        id: tcle?.id,
        content: formData.content,
        fileUrl: fileUrl || undefined,
        versionTag: formData.versionTag,
        isActive: formData.isActive,
      });

      if (error) {
        toast({
          title: 'Erro',
          description: 'Falha ao salvar o TCLE.',
          variant: 'destructive',
        });
      } else {
        toast({ title: 'TCLE salvo com sucesso!' });
        setPendingFile(null);
        fetchActiveTCLE();
      }
    } catch (err) {
      toast({
        title: 'Erro',
        description: 'Erro inesperado ao salvar.',
        variant: 'destructive',
      });
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl text-foreground mb-2">
            Gerenciamento do TCLE
          </h2>
          <p className="text-muted-foreground">
            Configure o Termo de Consentimento Livre e Esclarecido
          </p>
        </div>
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Visualizar
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Preview do TCLE</DialogTitle>
            </DialogHeader>
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-sm">
                {formData.content || 'Nenhum conteúdo definido.'}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Texto do TCLE
            </CardTitle>
            <CardDescription>
              Este texto será exibido integralmente na tela de consentimento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Digite o texto completo do TCLE aqui..."
              className="min-h-[400px] font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Use ## para títulos e ### para subtítulos.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configurações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="version">Versão do TCLE *</Label>
                <Input
                  id="version"
                  value={formData.versionTag}
                  onChange={(e) => setFormData({ ...formData, versionTag: e.target.value })}
                  placeholder="Ex: TCLE_v1.0"
                />
                <p className="text-xs text-muted-foreground">
                  Será registrada junto ao consentimento do participante
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Label htmlFor="active">TCLE Ativo</Label>
                <Switch
                  id="active"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Arquivo para Download</CardTitle>
              <CardDescription>
                PDF ou DOCX disponível para o participante baixar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={fileInputType} onValueChange={(v) => setFileInputType(v as 'url' | 'upload')}>
                <TabsList className="w-full">
                  <TabsTrigger value="url" className="flex-1">
                    <Link className="h-4 w-4 mr-2" />
                    URL
                  </TabsTrigger>
                  <TabsTrigger value="upload" className="flex-1">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="url" className="mt-3">
                  <Input
                    value={formData.fileUrl}
                    onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                    placeholder="https://exemplo.com/tcle.pdf"
                  />
                </TabsContent>
                <TabsContent value="upload" className="mt-3">
                  <Input
                    type="file"
                    accept=".pdf,.docx"
                    onChange={handleFileChange}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    PDF ou DOCX, máximo 5MB
                  </p>
                </TabsContent>
              </Tabs>
              {(formData.fileUrl || pendingFile) && (
                <div className="mt-3 p-2 bg-muted rounded text-xs text-muted-foreground truncate">
                  {pendingFile ? pendingFile.name : formData.fileUrl}
                </div>
              )}
            </CardContent>
          </Card>

          <Button onClick={handleSave} className="w-full h-12" disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Salvar TCLE
          </Button>
        </div>
      </div>
    </div>
  );
}
