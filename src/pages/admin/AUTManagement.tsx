import { useState } from 'react';
import { Plus, Edit2, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { AUTStimulus } from '@/types/experiment';

// Mock data
const initialStimuli: AUTStimulus[] = [
  {
    id: '1',
    objectName: 'Tijolo',
    instructionText: 'Liste todos os usos alternativos que você consegue imaginar para um tijolo comum.',
    suggestedTimeSeconds: 180,
    displayOrder: 1,
    versionTag: 'AUT_v1.0',
    isActive: true,
  },
  {
    id: '2',
    objectName: 'Clipe de Papel',
    instructionText: 'Liste todos os usos alternativos que você consegue imaginar para um clipe de papel.',
    suggestedTimeSeconds: 180,
    displayOrder: 2,
    versionTag: 'AUT_v1.0',
    isActive: true,
  },
];

export default function AUTManagement() {
  const [stimuli, setStimuli] = useState<AUTStimulus[]>(initialStimuli);
  const [editingStimulus, setEditingStimulus] = useState<AUTStimulus | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    objectName: '',
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
        instructionText: stimulus.instructionText,
        suggestedTimeSeconds: stimulus.suggestedTimeSeconds,
        versionTag: stimulus.versionTag || '',
        isActive: stimulus.isActive,
      });
    } else {
      setEditingStimulus(null);
      setFormData({
        objectName: '',
        instructionText: '',
        suggestedTimeSeconds: 180,
        versionTag: '',
        isActive: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.objectName.trim() || !formData.instructionText.trim()) {
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
      const newStimulus: AUTStimulus = {
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
          <DialogContent className="max-w-lg">
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
                  onChange={(e) =>
                    setFormData({ ...formData, objectName: e.target.value })
                  }
                  placeholder="Ex: Tijolo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instructionText">Texto de Instrução *</Label>
                <Textarea
                  id="instructionText"
                  value={formData.instructionText}
                  onChange={(e) =>
                    setFormData({ ...formData, instructionText: e.target.value })
                  }
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
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        suggestedTimeSeconds: parseInt(e.target.value) || 180,
                      })
                    }
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
                    placeholder="Ex: AUT_v1.0"
                  />
                </div>
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

      <div className="space-y-3">
        {stimuli.map((stimulus, index) => (
          <Card
            key={stimulus.id}
            className={!stimulus.isActive ? 'opacity-60' : ''}
          >
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <GripVertical className="h-5 w-5 cursor-move" />
                <span className="text-sm font-medium w-6">{index + 1}</span>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground">{stimulus.objectName}</h3>
                <p className="text-sm text-muted-foreground truncate">
                  {stimulus.instructionText}
                </p>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span>{Math.floor(stimulus.suggestedTimeSeconds / 60)} min</span>
                  {stimulus.versionTag && <span>• {stimulus.versionTag}</span>}
                </div>
              </div>

              <div className="flex items-center gap-2">
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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
