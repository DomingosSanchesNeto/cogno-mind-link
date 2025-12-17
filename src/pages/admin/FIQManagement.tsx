import { useState } from 'react';
import { Plus, Edit2, Trash2, Upload, Link, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useFIQStimuli, uploadToStorage } from '@/hooks/useSupabaseData';
import { validateFile } from '@/lib/security';
import type { FIQStimulus } from '@/types/experiment';

export default function FIQManagement() {
  const { stimuli, loading, fetchStimuli, saveStimulus, deleteStimulus } = useFIQStimuli();
  const [editingStimulus, setEditingStimulus] = useState<FIQStimulus | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [imageInputType, setImageInputType] = useState<'url' | 'upload'>('url');
  const [saving, setSaving] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    imageUrl: '',
    questionText: '',
    versionTag: '',
    isActive: true,
  });

  const handleOpenDialog = (stimulus?: FIQStimulus) => {
    if (stimulus) {
      setEditingStimulus(stimulus);
      setFormData({
        title: stimulus.title,
        imageUrl: stimulus.imageUrl,
        questionText: stimulus.questionText,
        versionTag: stimulus.versionTag || '',
        isActive: stimulus.isActive,
      });
    } else {
      setEditingStimulus(null);
      setFormData({
        title: '',
        imageUrl: '',
        questionText: '',
        versionTag: '',
        isActive: true,
      });
    }
    setPendingFile(null);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.imageUrl.trim() || !formData.questionText.trim()) {
      toast({ title: 'Erro', description: 'Preencha todos os campos obrigatórios.', variant: 'destructive' });
      return;
    }

    setSaving(true);

    try {
      let imageUrl = formData.imageUrl;

      if (pendingFile) {
        const uploadedUrl = await uploadToStorage(pendingFile, 'fiq-images');
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        } else {
          toast({ title: 'Erro', description: 'Falha ao enviar imagem.', variant: 'destructive' });
          setSaving(false);
          return;
        }
      }

      const { error } = await saveStimulus({
        id: editingStimulus?.id,
        title: formData.title,
        imageUrl,
        questionText: formData.questionText,
        displayOrder: editingStimulus?.displayOrder || stimuli.length + 1,
        versionTag: formData.versionTag || undefined,
        isActive: formData.isActive,
      });

      if (error) {
        toast({ title: 'Erro', description: 'Falha ao salvar estímulo.', variant: 'destructive' });
      } else {
        toast({ title: editingStimulus ? 'Estímulo atualizado!' : 'Estímulo criado!' });
        setIsDialogOpen(false);
        fetchStimuli();
      }
    } catch (err) {
      toast({ title: 'Erro', description: 'Erro inesperado.', variant: 'destructive' });
    }

    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await deleteStimulus(id);
    if (error) {
      toast({ title: 'Erro', description: 'Falha ao remover.', variant: 'destructive' });
    } else {
      toast({ title: 'Estímulo removido.' });
      fetchStimuli();
    }
  };

  const toggleActive = async (stimulus: FIQStimulus) => {
    await saveStimulus({ ...stimulus, isActive: !stimulus.isActive });
    fetchStimuli();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateFile(file, ['png', 'jpg', 'jpeg']);
    if (!validation.valid) {
      toast({ title: 'Erro', description: validation.error, variant: 'destructive' });
      return;
    }

    setPendingFile(file);
    setFormData({ ...formData, imageUrl: URL.createObjectURL(file) });
    toast({ title: 'Imagem selecionada.' });
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
          <h2 className="font-heading text-2xl text-foreground mb-2">Estímulos FIQ</h2>
          <p className="text-muted-foreground">Gerencie as imagens da tarefa de Interpretação Visual</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Estímulo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingStimulus ? 'Editar Estímulo' : 'Novo Estímulo FIQ'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título Descritivo *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Padrão Abstrato 1"
                />
              </div>

              <div className="space-y-2">
                <Label>Imagem do Estímulo *</Label>
                <Tabs value={imageInputType} onValueChange={(v) => setImageInputType(v as 'url' | 'upload')}>
                  <TabsList className="w-full">
                    <TabsTrigger value="url" className="flex-1">
                      <Link className="h-4 w-4 mr-2" />
                      URL Externa
                    </TabsTrigger>
                    <TabsTrigger value="upload" className="flex-1">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="url" className="mt-2">
                    <Input
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="https://exemplo.com/imagem.jpg"
                    />
                  </TabsContent>
                  <TabsContent value="upload" className="mt-2">
                    <Input type="file" accept="image/png,image/jpeg" onChange={handleFileChange} />
                  </TabsContent>
                </Tabs>
                {formData.imageUrl && (
                  <div className="mt-2 p-2 bg-muted rounded-lg">
                    <img src={formData.imageUrl} alt="Preview" className="max-h-32 mx-auto rounded object-contain" />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="questionText">Pergunta Associada *</Label>
                <Textarea
                  id="questionText"
                  value={formData.questionText}
                  onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                  placeholder="O que você vê nesta imagem?"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="version">Version Tag</Label>
                <Input
                  id="version"
                  value={formData.versionTag}
                  onChange={(e) => setFormData({ ...formData, versionTag: e.target.value })}
                  placeholder="Ex: FIQ_v1.0"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="active">Ativo</Label>
                <Switch id="active" checked={formData.isActive} onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Salvar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {stimuli.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <p>Nenhum estímulo cadastrado.</p>
            <Button variant="outline" className="mt-4" onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar primeiro estímulo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {stimuli.map((stimulus, index) => (
            <Card key={stimulus.id} className={!stimulus.isActive ? 'opacity-60' : ''}>
              <CardContent className="p-4">
                <div className="aspect-video mb-3 rounded-lg overflow-hidden bg-muted">
                  <img src={stimulus.imageUrl} alt={stimulus.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-muted-foreground">#{index + 1}</span>
                      <h3 className="font-medium text-foreground truncate">{stimulus.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{stimulus.questionText}</p>
                    {stimulus.versionTag && <span className="text-xs text-muted-foreground">{stimulus.versionTag}</span>}
                  </div>
                  <div className="flex items-center gap-1">
                    <Switch checked={stimulus.isActive} onCheckedChange={() => toggleActive(stimulus)} />
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(stimulus)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(stimulus.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
