import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, GripVertical, Upload, Link, Loader2 } from 'lucide-react';
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
import { useAUTStimuli, uploadToStorage } from '@/hooks/useSupabaseData';
import { validateFile } from '@/lib/security';
import type { AUTStimulus } from '@/types/experiment';

export default function AUTManagement() {
  const { stimuli, loading, fetchStimuli, saveStimulus, deleteStimulus } = useAUTStimuli();
  const [editingStimulus, setEditingStimulus] = useState<AUTStimulus | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [imageInputType, setImageInputType] = useState<'url' | 'upload'>('url');
  const [saving, setSaving] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    objectName: '',
    objectImageUrl: '',
    instructionText: '',
    suggestedTimeSeconds: 180,
    versionTag: '',
    isActive: true,
  });

  const handleOpenDialog = (stimulus?: AUTStimulus) => {
    if (stimulus) {
      setEditingStimulus(stimulus);
      setFormData({
        objectName: stimulus.objectName,
        objectImageUrl: stimulus.objectImageUrl || '',
        instructionText: stimulus.instructionText,
        suggestedTimeSeconds: stimulus.suggestedTimeSeconds,
        versionTag: stimulus.versionTag || '',
        isActive: stimulus.isActive,
      });
    } else {
      setEditingStimulus(null);
      setFormData({
        objectName: '',
        objectImageUrl: '',
        instructionText: '',
        suggestedTimeSeconds: 180,
        versionTag: '',
        isActive: true,
      });
    }
    setPendingFile(null);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.objectName.trim() || !formData.instructionText.trim()) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);

    try {
      let imageUrl = formData.objectImageUrl;

      if (pendingFile) {
        const uploadedUrl = await uploadToStorage(pendingFile, 'aut-images');
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
        objectName: formData.objectName,
        objectImageUrl: imageUrl || undefined,
        instructionText: formData.instructionText,
        suggestedTimeSeconds: formData.suggestedTimeSeconds,
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

  const toggleActive = async (stimulus: AUTStimulus) => {
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
    setFormData({ ...formData, objectImageUrl: URL.createObjectURL(file) });
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
          <h2 className="font-heading text-2xl text-foreground mb-2">
            Estímulos AUT
          </h2>
          <p className="text-muted-foreground">
            Gerencie os objetos da tarefa de Usos Alternativos
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Estímulo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingStimulus ? 'Editar Estímulo' : 'Novo Estímulo AUT'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="objectName">Nome do Objeto *</Label>
                <Input
                  id="objectName"
                  value={formData.objectName}
                  onChange={(e) => setFormData({ ...formData, objectName: e.target.value })}
                  placeholder="Ex: Tijolo"
                />
              </div>

              <div className="space-y-2">
                <Label>Imagem do Objeto</Label>
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
                      value={formData.objectImageUrl}
                      onChange={(e) => setFormData({ ...formData, objectImageUrl: e.target.value })}
                      placeholder="https://exemplo.com/imagem.jpg"
                    />
                  </TabsContent>
                  <TabsContent value="upload" className="mt-2">
                    <Input type="file" accept="image/png,image/jpeg" onChange={handleFileChange} />
                    <p className="text-xs text-muted-foreground mt-1">PNG ou JPG, máx. 5MB</p>
                  </TabsContent>
                </Tabs>
                {formData.objectImageUrl && (
                  <div className="mt-2 p-2 bg-muted rounded-lg">
                    <img src={formData.objectImageUrl} alt="Preview" className="max-h-32 mx-auto rounded object-contain" />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructionText">Texto de Instrução *</Label>
                <Textarea
                  id="instructionText"
                  value={formData.instructionText}
                  onChange={(e) => setFormData({ ...formData, instructionText: e.target.value })}
                  placeholder="Liste todos os usos alternativos..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="time">Tempo Sugerido (segundos)</Label>
                  <Input
                    id="time"
                    type="number"
                    value={formData.suggestedTimeSeconds}
                    onChange={(e) => setFormData({ ...formData, suggestedTimeSeconds: parseInt(e.target.value) || 180 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="version">Version Tag</Label>
                  <Input
                    id="version"
                    value={formData.versionTag}
                    onChange={(e) => setFormData({ ...formData, versionTag: e.target.value })}
                    placeholder="Ex: AUT_v1.0"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="active">Ativo</Label>
                <Switch
                  id="active"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
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
        <div className="space-y-3">
          {stimuli.map((stimulus, index) => (
            <Card key={stimulus.id} className={!stimulus.isActive ? 'opacity-60' : ''}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <GripVertical className="h-5 w-5 cursor-move" />
                  <span className="text-sm font-medium w-6">{index + 1}</span>
                </div>

                {stimulus.objectImageUrl && (
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <img src={stimulus.objectImageUrl} alt={stimulus.objectName} className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground">{stimulus.objectName}</h3>
                  <p className="text-sm text-muted-foreground truncate">{stimulus.instructionText}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span>{Math.floor(stimulus.suggestedTimeSeconds / 60)} min</span>
                    {stimulus.versionTag && <span>• {stimulus.versionTag}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch checked={stimulus.isActive} onCheckedChange={() => toggleActive(stimulus)} />
                  <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(stimulus)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(stimulus.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
