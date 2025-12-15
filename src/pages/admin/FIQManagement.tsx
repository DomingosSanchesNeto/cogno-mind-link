import { useState } from 'react';
import { Plus, Edit2, Trash2, GripVertical, Upload, Link } from 'lucide-react';
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
import type { FIQStimulus } from '@/types/experiment';

// Mock data
const initialStimuli: FIQStimulus[] = [
  {
    id: '1',
    title: 'Padrão Abstrato 1',
    imageUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600',
    questionText: 'O que você vê nesta imagem? Descreva suas interpretações e associações.',
    displayOrder: 1,
    versionTag: 'FIQ_v1.0',
    isActive: true,
  },
  {
    id: '2',
    title: 'Padrão Abstrato 2',
    imageUrl: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=600',
    questionText: 'Que emoções ou pensamentos esta imagem evoca em você?',
    displayOrder: 2,
    versionTag: 'FIQ_v1.0',
    isActive: true,
  },
];

export default function FIQManagement() {
  const [stimuli, setStimuli] = useState<FIQStimulus[]>(initialStimuli);
  const [editingStimulus, setEditingStimulus] = useState<FIQStimulus | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [imageInputType, setImageInputType] = useState<'url' | 'upload'>('url');
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
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.title.trim() || !formData.imageUrl.trim() || !formData.questionText.trim()) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    if (editingStimulus) {
      setStimuli(prev =>
        prev.map(s =>
          s.id === editingStimulus.id
            ? { ...s, ...formData }
            : s
        )
      );
      toast({ title: 'Estímulo atualizado com sucesso!' });
    } else {
      const newStimulus: FIQStimulus = {
        id: Date.now().toString(),
        ...formData,
        displayOrder: stimuli.length + 1,
      };
      setStimuli(prev => [...prev, newStimulus]);
      toast({ title: 'Estímulo criado com sucesso!' });
    }

    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setStimuli(prev => prev.filter(s => s.id !== id));
    toast({ title: 'Estímulo removido.' });
  };

  const toggleActive = (id: string) => {
    setStimuli(prev =>
      prev.map(s =>
        s.id === id ? { ...s, isActive: !s.isActive } : s
      )
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In production, this would upload to storage
      // For now, create a local URL preview
      const url = URL.createObjectURL(file);
      setFormData({ ...formData, imageUrl: url });
      toast({ title: 'Imagem selecionada. Será enviada ao salvar.' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl text-foreground mb-2">
            Estímulos FIQ
          </h2>
          <p className="text-muted-foreground">
            Gerencie as imagens da tarefa de Interpretação Visual
          </p>
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
              <DialogTitle>
                {editingStimulus ? 'Editar Estímulo' : 'Novo Estímulo FIQ'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título Descritivo *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
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
                      onChange={(e) =>
                        setFormData({ ...formData, imageUrl: e.target.value })
                      }
                      placeholder="https://exemplo.com/imagem.jpg"
                    />
                  </TabsContent>
                  <TabsContent value="upload" className="mt-2">
                    <Input
                      type="file"
                      accept="image/png,image/jpeg"
                      onChange={handleFileChange}
                    />
                  </TabsContent>
                </Tabs>
                {formData.imageUrl && (
                  <div className="mt-2 p-2 bg-muted rounded-lg">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="max-h-32 mx-auto rounded object-contain"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="questionText">Pergunta Associada *</Label>
                <Textarea
                  id="questionText"
                  value={formData.questionText}
                  onChange={(e) =>
                    setFormData({ ...formData, questionText: e.target.value })
                  }
                  placeholder="O que você vê nesta imagem?"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="version">Version Tag</Label>
                <Input
                  id="version"
                  value={formData.versionTag}
                  onChange={(e) =>
                    setFormData({ ...formData, versionTag: e.target.value })
                  }
                  placeholder="Ex: FIQ_v1.0"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="active">Ativo</Label>
                <Switch
                  id="active"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked })
                  }
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>Salvar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {stimuli.map((stimulus, index) => (
          <Card
            key={stimulus.id}
            className={!stimulus.isActive ? 'opacity-60' : ''}
          >
            <CardContent className="p-4">
              <div className="aspect-video mb-3 rounded-lg overflow-hidden bg-muted">
                <img
                  src={stimulus.imageUrl}
                  alt={stimulus.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-muted-foreground">
                      #{index + 1}
                    </span>
                    <h3 className="font-medium text-foreground truncate">
                      {stimulus.title}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {stimulus.questionText}
                  </p>
                  {stimulus.versionTag && (
                    <span className="text-xs text-muted-foreground">
                      {stimulus.versionTag}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <Switch
                    checked={stimulus.isActive}
                    onCheckedChange={() => toggleActive(stimulus.id)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenDialog(stimulus)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(stimulus.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
