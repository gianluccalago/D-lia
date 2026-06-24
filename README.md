# Dália — site de pré-lançamento

Landing page institucional da **Dália**, marca de skincare íntimo externo feminino
(sérum hidratante de uso externo, cosmético — não medicamento, sem hormônios e
sem fragrância). Objetivo central do site: **captar a lista de espera** do
pré-lançamento.

Site estático, responsivo (mobile-first), sem build. Identidade visual fiel ao
`DESIGN.md` fornecido (paleta, tipografia, espaçamento, raios, superfícies e
componentes).

## Estrutura

```
.
├── index.html            # página principal (hero + 7 seções)
├── privacidade.html      # política de privacidade (LGPD)
├── termos.html           # termos de uso
├── styles/
│   └── styles.css        # design system + componentes
├── scripts/
│   └── main.js           # nav mobile, vídeo reduced-motion, validação/envio do form
└── assets/
    ├── dalia-hero.mp4         # vídeo da flor de dália desabrochando (fundo do hero)
    ├── dalia-hero-poster.jpg  # poster/fallback estático (também usado em Open Graph)
    └── favicon.svg
```

## Como visualizar

É um site estático — basta abrir `index.html` no navegador, ou servir a pasta:

```bash
python3 -m http.server 8000
# acesse http://localhost:8000
```

## ⚙️ Configurar a captura da lista de espera (IMPORTANTE)

O dado da lista de espera é o ativo mais importante do site. O formulário **não**
usa `mailto` nem `localStorage` — ele envia para um serviço real de captura.

Ponto único de configuração: o atributo `action` do `<form id="waitlist-form">`
em `index.html`.

1. Crie um formulário no [Formspree](https://formspree.io) (ou serviço equivalente:
   Getform, Basin, Brevo, Tally…).
2. Substitua o placeholder pelo seu endpoint:

   ```html
   <form id="waitlist-form" action="https://formspree.io/f/SEU_ENDPOINT_AQUI" method="POST">
   ```

   Troque `SEU_ENDPOINT_AQUI` pelo ID real do seu form.

3. Pronto. O envio é feito via `fetch` (`Accept: application/json`), com estado de
   sucesso, validação amigável e proteção honeypot anti-spam.

> **Modo de demonstração:** enquanto o `action` ainda contiver `SEU_ENDPOINT_AQUI`,
> o JS detecta automaticamente (`DEMO_MODE`) e apenas exibe a tela de sucesso, **sem
> enviar nem armazenar dados**. Assim o site pode ser testado antes da configuração.

Os nomes dos campos enviados são: `nome`, `email`, `whatsapp`, `faixa_etaria`,
`motivacao`, `consentimento`.

## Vídeo do hero

- `assets/dalia-hero.mp4` é exibido em loop, mudo, autoplay e `playsinline`
  (funciona no celular), com `assets/dalia-hero-poster.jpg` como poster/fallback.
- Em `prefers-reduced-motion: reduce`, o vídeo é pausado/oculto e o poster estático
  permanece visível.

## Placeholders a preencher

Marcados visualmente com a etiqueta **placeholder** e/ou comentários no código:

- Nome e credencial da fundadora (médica ginecologista).
- Ativos da fórmula e lista de ingredientes (a confirmar até o lançamento).
- Imagens do produto.
- E-mail de contato e Instagram da marca.
- CNPJ, responsável técnico e notificação ANVISA.
- Endpoint real do formulário (ver acima).

## Conformidade de linguagem

Toda a copy segue linguagem **estritamente cosmética** (hidrata, conforto, cuidado,
pele íntima externa, bem-estar) e **uso externo** sempre explícito. Não há promessa
terapêutica, depoimentos, estatísticas, selos ou preço. A médica é apresentada como
**origem** da marca, nunca como prescrição.
