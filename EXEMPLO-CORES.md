# Exemplo de Uso - Cores Customizáveis dos Controles

Este documento mostra como personalizar as cores dos controles de vídeo ao usar a biblioteca.

## Uso Básico

### 1. VideoRecorder SEM cores customizadas (usa cores nativas)

```tsx
import { VideoRecorder, JobType } from '@sua-biblioteca/video';

function App() {
  return (
    <VideoRecorder
      jobType={JobType.COMPANY}
      maxDurationSeconds={180}
      allowReRecord={true}
      onRecordingComplete={(blob) => {
        console.log('Vídeo gravado!', blob);
      }}
      // Sem prop colors - usa cores nativas do sistema de design (wkp-primary-*)
    />
  );
}
```

**Resultado**: Usa as cores nativas do sistema de design (classes `wkp-primary-dark`, `wkp-primary-lighter`, etc.).

---

### 2. VideoRecorder COM cores customizadas

```tsx
import { VideoRecorder, JobType } from '@sua-biblioteca/video';

function App() {
  return (
    <VideoRecorder
      jobType={JobType.COMPANY}
      maxDurationSeconds={180}
      allowReRecord={true}
      onRecordingComplete={(blob) => {
        console.log('Vídeo gravado!', blob);
      }}
      colors={{
        controlBarBg: '#E9D5FF',      // Roxo claro para fundo
        controlColor: '#7C3AED',      // Roxo forte para controles
        controlColorHover: '#6D28D9', // Roxo mais escuro no hover
        progressFill: '#7C3AED',      // Roxo forte para barra de progresso
        progressBg: '#D1D5DB',        // Cinza claro para fundo da barra
      }}
    />
  );
}
```

**Resultado**: Usa as cores personalizadas fornecidas.

---

### 3. VideoPlayer SEM cores customizadas (usa cores nativas)

```tsx
import { VideoPlayer, JobType } from '@sua-biblioteca/video';

function App() {
  return (
    <VideoPlayer
      src="/video.mp4"
      poster="/poster.jpg"
      jobType={JobType.COMPANY}
      // Sem prop colors - usa cores nativas do sistema de design (wkp-primary-*)
    />
  );
}
```

**Resultado**: Usa as cores nativas do sistema de design (classes `wkp-primary-dark`, `wkp-primary-lighter`, etc.).

---

### 4. VideoPlayer COM cores customizadas

```tsx
import { VideoPlayer, JobType } from '@sua-biblioteca/video';

function App() {
  return (
    <VideoPlayer
      src="/video.mp4"
      poster="/poster.jpg"
      jobType={JobType.COMPANY}
      colors={{
        controlBarBg: '#DBEAFE',      // Azul claro
        controlColor: '#2563EB',      // Azul forte
        controlColorHover: '#1D4ED8', // Azul mais escuro
        progressFill: '#2563EB',
        progressBg: '#D1D5DB',
      }}
    />
  );
}
```

**Resultado**: Usa as cores personalizadas fornecidas (azul neste exemplo).

## Exemplos de Paletas de Cores Customizadas

### Roxo (Exemplo de cor customizada)
```tsx
colors={{
  controlBarBg: '#E9D5FF',
  controlColor: '#7C3AED',
  controlColorHover: '#6D28D9',
  progressFill: '#7C3AED',
  progressBg: '#D1D5DB',
}}
```

### Azul
```tsx
colors={{
  controlBarBg: '#DBEAFE',
  controlColor: '#2563EB',
  controlColorHover: '#1D4ED8',
  progressFill: '#2563EB',
  progressBg: '#D1D5DB',
}}
```

### Verde
```tsx
colors={{
  controlBarBg: '#D1FAE5',
  controlColor: '#10B981',
  controlColorHover: '#059669',
  progressFill: '#10B981',
  progressBg: '#D1D5DB',
}}
```

### Rosa
```tsx
colors={{
  controlBarBg: '#FCE7F3',
  controlColor: '#EC4899',
  controlColorHover: '#DB2777',
  progressFill: '#EC4899',
  progressBg: '#D1D5DB',
}}
```

### Vermelho
```tsx
colors={{
  controlBarBg: '#FEE2E2',
  controlColor: '#EF4444',
  controlColorHover: '#DC2626',
  progressFill: '#EF4444',
  progressBg: '#D1D5DB',
}}
```

## Interface TypeScript

```typescript
interface VideoControlsColors {
  /** Cor de fundo dos controles (barra de controles) - opcional, se não fornecido usa cores nativas (wkp-primary-lighter) */
  controlBarBg?: string;
  /** Cor dos controles individuais (ícones, textos) - opcional, se não fornecido usa cores nativas (wkp-primary-dark) */
  controlColor?: string;
  /** Cor dos controles no estado hover - opcional, se não fornecido usa cores nativas (wkp-primary-darker) */
  controlColorHover?: string;
  /** Cor da barra de progresso preenchida - opcional, se não fornecido usa cores nativas */
  progressFill?: string;
  /** Cor de fundo da barra de progresso - opcional, se não fornecido usa cores nativas */
  progressBg?: string;
}
```

## Comparação: Com vs Sem Cores

### Exemplo Completo - Alternando entre padrão e customizado

```tsx
import { VideoRecorder, JobType } from '@sua-biblioteca/video';
import { useState } from 'react';

function App() {
  const [useCustomColors, setUseCustomColors] = useState(false);

  return (
    <div>
      <button onClick={() => setUseCustomColors(!useCustomColors)}>
        {useCustomColors ? 'Usar Cores Nativas' : 'Usar Cores Customizadas'}
      </button>

      <VideoRecorder
        jobType={JobType.COMPANY}
        maxDurationSeconds={180}
        onRecordingComplete={(blob) => console.log('Gravado!', blob)}
        // Condicionalmente passa cores apenas se useCustomColors for true
        {...(useCustomColors && {
          colors: {
            controlBarBg: '#DBEAFE',      // Azul claro
            controlColor: '#2563EB',      // Azul forte
            controlColorHover: '#1D4ED8', // Azul mais escuro
            progressFill: '#2563EB',
            progressBg: '#D1D5DB',
          },
        })}
      />
    </div>
  );
}
```

### Cores Nativas (quando não passa `colors`)

Quando você **não passa** a prop `colors`, o componente usa as **cores nativas do sistema de design**, definidas pelas classes Tailwind:

- `wkp-primary-dark` - Cor dos controles (ícones, textos)
- `wkp-primary-darker` - Cor dos controles no hover
- `wkp-primary-lighter` - Cor de fundo da barra de controles

Essas cores são definidas pelo sistema de design e não precisam ser especificadas manualmente.

## Interface TypeScript

```typescript
interface VideoControlsColors {
  /** Cor de fundo dos controles (barra de controles) - opcional, se não fornecido usa cores nativas (wkp-primary-lighter) */
  controlBarBg?: string;
  /** Cor dos controles individuais (ícones, textos) - opcional, se não fornecido usa cores nativas (wkp-primary-dark) */
  controlColor?: string;
  /** Cor dos controles no estado hover - opcional, se não fornecido usa cores nativas (wkp-primary-darker) */
  controlColorHover?: string;
  /** Cor da barra de progresso preenchida - opcional, se não fornecido usa cores nativas */
  progressFill?: string;
  /** Cor de fundo da barra de progresso - opcional, se não fornecido usa cores nativas */
  progressBg?: string;
}
```

## Notas Importantes

- ✅ **A prop `colors` é opcional**. Se não fornecida, o componente usa as **cores nativas do sistema de design** (classes `wkp-primary-*`).
- ✅ **Você pode passar apenas algumas cores**. As não fornecidas usarão os valores padrão definidos em `DEFAULT_CONTROLS_COLORS`.
- ✅ **As cores devem ser fornecidas em formato hexadecimal** (ex: `#7C3AED`).
- ✅ **As cores são aplicadas via CSS variables**, então são facilmente customizáveis e performáticas.
- ✅ **As cores são herdadas pelos componentes filhos**, então você só precisa passar `colors` no componente raiz (`VideoRecorder` ou `VideoPlayer`).
- ✅ **Não há necessidade de passar `colors` se você quiser usar as cores nativas do sistema de design**.
- ⚠️ **O roxo mostrado nos exemplos é uma cor customizada**, não a cor padrão. As cores padrão são as nativas do sistema (`wkp-primary-*`).
