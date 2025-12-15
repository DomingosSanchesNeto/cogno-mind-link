import { useState } from 'react';
import { Download, FileJson, FileSpreadsheet, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

export default function ExportData() {
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [selectedData, setSelectedData] = useState({
    participants: true,
    sociodemographic: true,
    autResponses: true,
    fiqResponses: true,
    dilemmaResponses: true,
    timestamps: false,
  });
  const { toast } = useToast();

  const handleExport = () => {
    // In production, this would trigger a real export from the database
    toast({
      title: 'Exportação iniciada',
      description: `Os dados serão baixados no formato ${format.toUpperCase()}.`,
    });

    // Simulate download
    const mockData = {
      exportedAt: new Date().toISOString(),
      format,
      includedData: Object.entries(selectedData)
        .filter(([_, v]) => v)
        .map(([k]) => k),
      totalParticipants: 127,
    };

    const blob = new Blob(
      [format === 'json' ? JSON.stringify(mockData, null, 2) : 'data,value\ntest,1'],
      { type: format === 'json' ? 'application/json' : 'text/csv' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `experimento_dados_${new Date().toISOString().split('T')[0]}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleData = (key: keyof typeof selectedData) => {
    setSelectedData(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const anySelected = Object.values(selectedData).some(v => v);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl text-foreground mb-2">
          Exportar Dados
        </h2>
        <p className="text-muted-foreground">
          Baixe os dados coletados para análise externa
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Format Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Formato de Exportação</CardTitle>
            <CardDescription>
              Escolha o formato mais adequado para sua análise
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={format} onValueChange={(v) => setFormat(v as 'csv' | 'json')}>
              <div className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                <RadioGroupItem value="csv" id="csv" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="csv" className="flex items-center gap-2 cursor-pointer">
                    <FileSpreadsheet className="h-5 w-5 text-success" />
                    <span className="font-medium">CSV (Excel / SPSS)</span>
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Ideal para análise estatística em Excel, SPSS ou R
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer mt-2">
                <RadioGroupItem value="json" id="json" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="json" className="flex items-center gap-2 cursor-pointer">
                    <FileJson className="h-5 w-5 text-primary" />
                    <span className="font-medium">JSON</span>
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Formato estruturado para análise programática (Python, etc.)
                  </p>
                </div>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Data Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dados a Exportar</CardTitle>
            <CardDescription>
              Selecione os conjuntos de dados que deseja incluir
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
              <Checkbox
                checked={selectedData.participants}
                onCheckedChange={() => toggleData('participants')}
              />
              <div>
                <span className="font-medium">Participantes</span>
                <p className="text-xs text-muted-foreground">IDs, status, dispositivo, timestamps</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
              <Checkbox
                checked={selectedData.sociodemographic}
                onCheckedChange={() => toggleData('sociodemographic')}
              />
              <div>
                <span className="font-medium">Dados Sociodemográficos</span>
                <p className="text-xs text-muted-foreground">Idade, sexo, escolaridade, profissão</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
              <Checkbox
                checked={selectedData.autResponses}
                onCheckedChange={() => toggleData('autResponses')}
              />
              <div>
                <span className="font-medium">Respostas AUT</span>
                <p className="text-xs text-muted-foreground">Usos alternativos para cada objeto</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
              <Checkbox
                checked={selectedData.fiqResponses}
                onCheckedChange={() => toggleData('fiqResponses')}
              />
              <div>
                <span className="font-medium">Respostas FIQ</span>
                <p className="text-xs text-muted-foreground">Interpretações visuais</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
              <Checkbox
                checked={selectedData.dilemmaResponses}
                onCheckedChange={() => toggleData('dilemmaResponses')}
              />
              <div>
                <span className="font-medium">Respostas Dilemas</span>
                <p className="text-xs text-muted-foreground">Escala Likert e justificativas</p>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
              <Checkbox
                checked={selectedData.timestamps}
                onCheckedChange={() => toggleData('timestamps')}
              />
              <div>
                <span className="font-medium">Logs de Navegação</span>
                <p className="text-xs text-muted-foreground">Tempos por tela e duração</p>
              </div>
            </label>
          </CardContent>
        </Card>
      </div>

      {/* Export Button */}
      <Card>
        <CardContent className="flex items-center justify-between p-6">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Calendar className="h-5 w-5" />
            <span className="text-sm">
              Dados disponíveis de 01/01/2024 até hoje
            </span>
          </div>
          <Button
            onClick={handleExport}
            disabled={!anySelected}
            className="h-12 px-8"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar {format.toUpperCase()}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
