import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ExperimentLayout } from '@/components/experiment/ExperimentLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useExperiment } from '@/contexts/ExperimentContext';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const formSchema = z.object({
  age: z.number().min(18, 'Você precisa ter 18 anos ou mais').max(120, 'Idade inválida'),
  sex: z.enum(['female', 'male', 'prefer_not_to_say'], {
    required_error: 'Selecione uma opção',
  }),
  education: z.enum(['high_school', 'undergraduate_incomplete', 'undergraduate_complete', 'postgraduate'], {
    required_error: 'Selecione sua escolaridade',
  }),
  profession: z.string().min(2, 'Informe sua profissão ou área de atuação').max(100, 'Máximo de 100 caracteres'),
  socioeconomicLevel: z.enum(['A', 'B', 'C', 'DE'], {
    required_error: 'Selecione uma opção',
  }),
  aiExperience: z.boolean({
    required_error: 'Selecione uma opção',
  }),
});

type FormData = z.infer<typeof formSchema>;

export default function SociodemographicScreen() {
  const navigate = useNavigate();
  const { setSociodemographic, recordScreenStart, recordScreenEnd, setCurrentStep } = useExperiment();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      profession: '',
    },
  });

  useEffect(() => {
    recordScreenStart('sociodemographic');
    setCurrentStep(2);
  }, []);

  const onSubmit = (data: FormData) => {
    setSociodemographic(data as any);
    recordScreenEnd('sociodemographic');
    navigate('/experimento/intro-aut');
  };

  return (
    <ExperimentLayout>
      <div className="card-academic">
        <h2 className="font-heading text-xl sm:text-2xl text-foreground mb-2">
          Dados Sociodemográficos
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Estas informações nos ajudam a compreender melhor o perfil dos participantes.
          Nenhum dado identificável será coletado.
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Age */}
            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Idade</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={18}
                      max={120}
                      placeholder="Ex: 25"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                      className="max-w-32"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Sex */}
            <FormField
              control={form.control}
              name="sex"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sexo</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex flex-wrap gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="female" />
                        <Label htmlFor="female" className="cursor-pointer">Feminino</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="male" id="male" />
                        <Label htmlFor="male" className="cursor-pointer">Masculino</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="prefer_not_to_say" id="prefer_not_to_say" />
                        <Label htmlFor="prefer_not_to_say" className="cursor-pointer">Prefiro não informar</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Education */}
            <FormField
              control={form.control}
              name="education"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Escolaridade</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="max-w-md">
                        <SelectValue placeholder="Selecione sua escolaridade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="high_school">Ensino Médio Completo</SelectItem>
                      <SelectItem value="undergraduate_incomplete">Ensino Superior Incompleto</SelectItem>
                      <SelectItem value="undergraduate_complete">Ensino Superior Completo</SelectItem>
                      <SelectItem value="postgraduate">Pós-graduação</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Profession */}
            <FormField
              control={form.control}
              name="profession"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profissão ou área de atuação</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: Engenheiro de Software, Estudante de Psicologia..."
                      {...field}
                      className="max-w-md"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Socioeconomic Level */}
            <FormField
              control={form.control}
              name="socioeconomicLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nível socioeconômico aproximado</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="max-w-md">
                        <SelectValue placeholder="Selecione uma opção" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="A">Classe A</SelectItem>
                      <SelectItem value="B">Classe B</SelectItem>
                      <SelectItem value="C">Classe C</SelectItem>
                      <SelectItem value="DE">Classe D ou E</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* AI Experience */}
            <FormField
              control={form.control}
              name="aiExperience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Você já teve contato prévio com Inteligência Artificial?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(val) => field.onChange(val === 'true')}
                      value={field.value !== undefined ? String(field.value) : undefined}
                      className="flex gap-6"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="true" id="ai_yes" />
                        <Label htmlFor="ai_yes" className="cursor-pointer">Sim</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="false" id="ai_no" />
                        <Label htmlFor="ai_no" className="cursor-pointer">Não</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="pt-4">
              <Button type="submit" className="w-full sm:w-auto h-12 px-8 text-base font-medium">
                Continuar
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </ExperimentLayout>
  );
}
