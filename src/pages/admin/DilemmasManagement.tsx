import { useState } from 'react';
import { Plus, Edit2, Trash2, GripVertical } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import type { EthicalDilemma } from '@/types/experiment';

// Mock data
const initialDilemmas: EthicalDilemma[] = [
  {
    id: '1',
    dilemmaText: 'Uma inteligência artificial deveria ter permissão para tomar decisões médicas críticas sem supervisão humana, se estatisticamente ela tiver uma taxa de acerto maior que médicos humanos.',
    likertScale: '1-5',
    displayOrder: 1,
    versionTag: 'DILEMMA_v1.0',
    isActive: true,
  },
  {
    id: '2',
    dilemmaText: 'Empresas deveriam ser obrigadas a revelar quando um conteúdo (texto, imagem ou vídeo) foi gerado por inteligência artificial.',
    likertScale: '1-5',
    displayOrder: 2,
    versionTag: 'DILEMMA_v1.0',
    isActive: true,
  },
];

export default function DilemmasManagement() {
  const [dilemmas, setDilemmas] = useState<EthicalDilemma[]>(initialDilemmas);
  const [editingDilemma, setEditingDilemma] = useState<EthicalDilemma | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    dilemmaText: '',
    versionTag: '',
    isActive: true,
  });

  const handleOpenDialog = (dilemma?: EthicalDilemma) => {
    if (dilemma) {
      setEditingDilemma(dilemma);
      setFormData({
        dilemmaText: dilemma.dilemmaText,
        versionTag: dilemma.versionTag || '',
        isActive: dilemma.isActive,
      });
    } else {
      setEditingDilemma(null);
      setFormData({
        dilemmaText: '',
        versionTag: '',
        isActive: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.dilemmaText.trim()) {
      toast({
        title: 'Erro',
        description: 'O texto do dilema é obrigatório.',
        variant: 'destructive',
      });
      return;
    }

    if (editingDilemma) {
      setDilemmas(prev =>
        prev.map(d =>
          d.id === editingDilemma.id
            ? { ...d, ...formData, likertScale: '1-5' as const }
            : d
        )
      );
      toast({ title: 'Dilema atualizado com sucesso!' });
    } else {
      const newDilemma: EthicalDilemma = {
        id: Date.now().toString(),
        ...formData,
        likertScale: '1-5',
        displayOrder: dilemmas.length + 1,
      };
      setDilemmas(prev => [...prev, newDilemma]);
      toast({ title: 'Dilema criado com sucesso!' });
    }

    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setDilemmas(prev => prev.filter(d => d.id !== id));
    toast({ title: 'Dilema removido.' });
  };

  const toggleActive = (id: string) => {
    setDilemmas(prev =>
      prev.map(d =>
        d.id === id ? { ...d, isActive: !d.isActive } : d
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl text-foreground mb-2">
            Dilemas Éticos
          </h2>
          <p className="text-muted-foreground">
            Gerencie os cenários da tarefa de Dilemas Éticos
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Dilema
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingDilemma ? 'Editar Dilema' : 'Novo Dilema Ético'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="dilemmaText">Texto do Dilema *</Label>
                <Textarea
                  id="dilemmaText"
                  value={formData.dilemmaText}
                  onChange={(e) =>
                    setFormData({ ...formData, dilemmaText: e.target.value })
                  }
                  placeholder="Descreva o cenário ético para avaliação..."
                  rows={5}
                />
              </div>

              <div className="space-y-2">
                <Label>Escala de Resposta</Label>
                <div className="p-3 bg-muted rounded-lg text-sm text-muted-foreground">
                  Likert 1-5 (Discordo totalmente → Concordo totalmente)
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="version">Version Tag</Label>
                <Input
                  id="version"
                  value={formData.versionTag}
                  onChange={(e) =>
                    setFormData({ ...formData, versionTag: e.target.value })
                  }
                  placeholder="Ex: DILEMMA_v1.0"
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

      <div className="space-y-3">
        {dilemmas.map((dilemma, index) => (
          <Card
            key={dilemma.id}
            className={!dilemma.isActive ? 'opacity-60' : ''}
          >
            <CardContent className="flex items-start gap-4 p-4">
              <div className="flex items-center gap-2 text-muted-foreground pt-1">
                <GripVertical className="h-5 w-5 cursor-move" />
                <span className="text-sm font-medium w-6">{index + 1}</span>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-foreground leading-relaxed">
                  {dilemma.dilemmaText}
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span>Likert 1-5</span>
                  {dilemma.versionTag && <span>• {dilemma.versionTag}</span>}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={dilemma.isActive}
                  onCheckedChange={() => toggleActive(dilemma.id)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleOpenDialog(dilemma)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDelete(dilemma.id)}
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
