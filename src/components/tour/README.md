# Sistema de Tours e Atualizações

Este sistema gerencia tours guiados e notificações de atualizações da plataforma.

## Componentes

### TourButton
Botão no header que permite ao usuário iniciar o tour manualmente. Mostra um badge quando há novidades disponíveis.

### GuidedTour
Componente principal que renderiza o tour guiado usando react-joyride. Suporta dois modos:
- **Tour Completo**: Mostra todas as funcionalidades da plataforma
- **Tour de Novidades**: Mostra apenas as novas funcionalidades adicionadas

### UpdatesModal
Modal que aparece automaticamente quando há atualizações (melhorias, correções de bugs) para mostrar ao usuário.

## Como Adicionar Novas Funcionalidades ao Tour

### 1. Para adicionar ao tour completo:
Edite o array `fullTourSteps` em `GuidedTour.tsx` e adicione novos steps:

```typescript
{
  target: '[data-tour="nova-feature"]',
  content: (
    <div className="space-y-3">
      <h3 className="font-light text-lg tracking-wide text-center">Nova Feature</h3>
      <p className="text-sm leading-relaxed text-center">
        Descrição da nova feature
      </p>
    </div>
  ),
  placement: 'bottom',
}
```

Não esqueça de adicionar o atributo `data-tour="nova-feature"` no componente correspondente.

### 2. Para criar um tour de novidades (via banco de dados):
Execute SQL no backend:

```sql
INSERT INTO public.tour_versions (version, type, title, description, steps, active)
VALUES (
  2, -- incrementar versão
  'update',
  'Novas Funcionalidades - Versão 2.0',
  'Conheça as novidades desta atualização',
  '[
    {
      "target": "body",
      "content": "<div class=\"space-y-4 text-center\"><h2 class=\"text-2xl font-light tracking-wide\">Novidades da Versão 2.0</h2><p class=\"text-sm text-muted-foreground leading-relaxed\">Veja o que há de novo</p></div>",
      "placement": "center",
      "disableBeacon": true
    },
    {
      "target": "[data-tour=\"nova-feature\"]",
      "content": "<div class=\"space-y-3\"><h3 class=\"font-light text-lg tracking-wide text-center\">Nova Feature</h3><p class=\"text-sm leading-relaxed text-center\">Descrição breve</p></div>",
      "placement": "bottom"
    }
  ]'::jsonb,
  true
);
```

## Como Adicionar Atualizações (Melhorias e Correções)

Para notificar usuários sobre melhorias e correções de bugs (sem adicionar ao tour):

```sql
INSERT INTO public.updates_log (version, title, description, changes, published)
VALUES (
  1, -- incrementar versão
  'Melhorias e Correções - Janeiro 2025',
  'Fizemos várias melhorias para tornar sua experiência ainda melhor.',
  '{
    "improvements": [
      "Performance aprimorada no carregamento de gráficos",
      "Interface mais responsiva em dispositivos móveis",
      "Melhor organização do menu de configurações"
    ],
    "fixes": [
      "Corrigido erro ao salvar trades em horários específicos",
      "Resolvido problema de sincronização com exchange",
      "Corrigido bug visual no modo escuro"
    ],
    "features": [
      "Novo filtro avançado no histórico de trades"
    ]
  }'::jsonb,
  true
);
```

## Fluxo de Funcionamento

1. **Primeira visita do usuário**: Após completar o onboarding e fazer o primeiro upload, o tour completo é exibido automaticamente.

2. **Usuário retorna**: Se houver:
   - **Novas funcionalidades** (tour de novidades): Badge aparece no botão de tour, usuário pode clicar para ver
   - **Melhorias/correções**: Modal de atualizações aparece automaticamente na primeira visita

3. **Acesso manual**: Usuário sempre pode iniciar o tour completo ou ver novidades através do botão no header.

## Campos do Banco de Dados

### user_settings
- `guided_tour_completed`: Se o usuário completou o tour inicial
- `tour_version_completed`: Última versão do tour que o usuário viu
- `last_seen_updates_version`: Última versão de atualizações que o usuário viu

### tour_versions
- `version`: Número da versão (incrementar sempre)
- `type`: 'full' ou 'update'
- `title`: Título do tour
- `description`: Descrição breve
- `steps`: Array JSON com os passos do tour
- `active`: Se está ativo (apenas um de cada tipo deve estar ativo)

### updates_log
- `version`: Número da versão
- `title`: Título da atualização
- `description`: Descrição geral
- `changes`: Objeto JSON com improvements, fixes, features
- `published`: Se está publicada

## Boas Práticas

1. **Sempre confirme** com o admin antes de adicionar novas funcionalidades ao tour
2. **Mantenha descrições curtas** e objetivas
3. **Use linguagem clara** e sem emojis
4. **Teste os data-tour attributes** antes de publicar
5. **Incremente as versões** sequencialmente
6. **Agrupe mudanças** relacionadas em uma única atualização
