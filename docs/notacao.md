# Notação de taiko: fichas, PDF e reprodução

Motor de notação do Grupo Kodon Amazon Taiko. O instrutor escreve a música em texto, do jeito que o grupo já escreve as fichas, e o motor devolve a ficha desenhada (tela e impressão), o PDF e a reprodução com o cursor acompanhando cada sílaba.

É uma biblioteca independente de framework: não usa roteador, não busca dados, não depende de Next nem de Vite. Autenticação, banco e gravação de fichas ficam fora dela.

| Onde                       | O quê                                                                                |
| -------------------------- | ------------------------------------------------------------------------------------ |
| `src/lib/notacao/`         | modelo, parser, serializador, regra de duração, linha do tempo, layout, PDF e player |
| `src/lib/notacao/musicas/` | ICHIGO e Miyake escritas no formato                                                  |
| `src/components/notacao/`  | componentes React: ficha em SVG, controles do player, tudo junto                     |
| `src/**/__tests__/`        | testes Vitest (`npm test`)                                                           |

## 1. Como os grupos de taiko escrevem as músicas

### Kuchi shōga

O taiko se ensina cantando. Cada golpe tem uma sílaba, e quem sabe cantar a frase sabe tocar. Esse canto se chama kuchi shōga (口唱歌). Não existe vocabulário oficial: as sílabas vêm do silabário japonês e mudam de região para região e de grupo para grupo [1][3]. O núcleo, porém, é o mesmo em quase toda parte:

| Sílaba           | Golpe                                          | Fonte        |
| ---------------- | ---------------------------------------------- | ------------ |
| don              | batida cheia no centro do couro; vale um tempo | [1][2][3][5] |
| do               | batida curta no centro; metade do don          | [1][2]       |
| doko, dogo, doro | duas batidas rápidas                           | [1][2][3]    |
| kon, ko          | o mesmo que don e do, com a mão esquerda       | [1][2]       |
| tsu              | batida leve                                    | [1][2][3][5] |
| tsuku            | duas batidas leves, direita e esquerda         | [1][2][3]    |
| ka               | batida seca na borda (fuchi)                   | [1][2][3][5] |
| kara             | duas batidas na borda, direita e esquerda      | [1][2][3]    |
| su               | pausa falada                                   | [2][3][5]    |

A regra das mãos aparece escrita na Wikipedia: direita canta don, do, tsu, ka; esquerda canta kon, ko, ku, ra [1]. O dicionário do Tatsumaki Taiko mostra que cada instrumento tem o seu vocabulário: o taiko canta don e doko, o shime canta ten e teke, o atarigane canta chan e chiki [2].

As pausas também se cantam. Além do su, usam-se palavras gritadas, como "sore" e "iya". Dar voz ao silêncio é o kakegoe [1].

O valor das notas é aproximado. O próprio dicionário avisa que a notação "não é exata comparada ao método ocidental" [2]. É a voz de quem ensina que fixa o ritmo.

### No papel

Encontrei três formas de escrever:

1. **Texto corrido.** As sílabas na ordem em que se canta, uma frase por linha, com "x2" ao lado. É como a Shangö Percussion escreve a Miyake [6] e é o que o Kodon usa.
2. **Grade.** Uma coluna por contagem (1 a 8 no topo), a palavra dentro da coluna e as mãos na linha de baixo. O Tatsumaki Taiko escreve os rudimentos assim [4], e a apostila da Shangö Percussion escreve Matsuri e Renshu assim [5]. Uma coluna pode ter uma palavra de duas sílabas (kara, doko), que então divide a contagem.
3. **Partitura ocidental.** Para peças publicadas, com uma pauta por tambor. Pela busca, é como saem as peças editadas (Row-Loff, Alfred) e as partituras que o Kodo distribui. Não li esses materiais; ficam aqui só como registro de que existem.

O suíngue se escreve reto e se toca balançado. Os rudimentos do Tatsumaki dizem que o compasso é contado em colcheias iguais e "tocado com sensação de suíngue", pensado como tercina, com a batida forte no 1 e a leve no 3 [4]. O mesmo texto cita o estilo Miyake como exemplo.

### Instrumentos e base

O nagado-daiko (ou chū-daiko) é o tambor de corpo longo e couro pregado que toca as frases. O shime-daiko é o pequeno e agudo, e o atarigane é o sino de mão: os dois costumam fazer a base. O ōdaiko é o maior do conjunto, e o okedo é o tambor de aduelas com couro amarrado [2][5].

A base se chama ji-uchi: o padrão que marca o tempo e sustenta a música [2][5]. No vocabulário do Kodon, é a **marcação**.

### Ferramentas e formatos que já existem

Procurei um editor de fichas de kuchi shōga, aberto ou não, e não achei nenhum. O que existe e chega perto:

| Formato                            | O que é                                                                                   | Por que não serve como está                                                          |
| ---------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| TJA                                | texto dos simuladores de Taiko no Tatsujin (identificado por busca, não estudado a fundo) | é formato de jogo: um tambor só, notas "don" e "ka" numa trilha, sem frases nem mãos |
| Tablatura de bateria em ASCII      | uma linha por peça, um caractere por subdivisão                                           | boa para grade, mas não é como a ficha do grupo é escrita                            |
| TUBS (caixas por unidade de tempo) | a grade usada em percussão africana                                                       | é a mesma ideia da grade do item 2 acima                                             |
| ABC, LilyPond, MuseScore           | notação ocidental em texto ou editor                                                      | exigem ler partitura, e a ficha do grupo é canto                                     |

Tablatura, TUBS, ABC, LilyPond e MuseScore entram aqui por conhecimento geral: não foram pesquisados a fundo nesta tarefa.

A conclusão é que não havia o que reaproveitar: o que o grupo precisa é a ficha dele, e não achei ferramenta que a escreva.

### A ficha do Kodon

Dois documentos do próprio grupo [11] fecharam a questão: a ficha da música ICHIGO e a chamada do teste de habilidades do nível intermediário. A ficha mostra:

- **Não é uma grade de tempos.** É uma tabela por seção (VERSO A, REFRÃO, VERSO B).
- Cada linha da tabela é uma **frase**, numerada na coluna da direita, com a repetição ao lado do número: `1 (x2)`.
- O texto é **kuchi shōga corrido**, com espaços e hifens: `DON KONDON KONDON-KON`, `DONdo-KONko-DON`, `DON- KA- KA KA KA KA`.
- **Maiúscula é batida forte, minúscula é fraca** (do, ko). **Sublinhado é acento.**
- O **kakegoe** vem em itálico entre parênteses: `(HA!)`, `(SORE!)`, `(SA-SA-SA-SA!)`.
- Repetição dentro da linha: `(X8)`, `(X3)`, `(X4 CRESCENTE)`.
- Uma linha de explicação entre parênteses, que não se toca: `(do kon, Do Kon, DO KON , DON KON)`.
- No VERSO B, as linhas alternam **azul e laranja**.
- No fim, a **SEQUÊNCIA**: `VERSO A > REFRÃO > VERSO B > VERSO A > REFRÃO`.
- Cabeçalho: título, Composição, Digitação.

O teste de habilidades dá o nome do grupo (Grupo Kodon Amazon Taiko), o repertório (Buchi Awase, Miyake, Chichibu Yatai-Bayashi) e os termos da casa: "Música Base", "Marcação", "Iri", "Kaiten", "Troca de Tsukudons", "Troca de Marcação". As competências avaliadas incluem cantar a melodia e os kakegoe enquanto toca, o que confirma que a ficha é, antes de tudo, o canto.

## 2. O que foi adotado e por quê

**A ficha do Kodon é o formato.** O texto que o instrutor escreve e o PDF principal reproduzem aquela tabela: seções, frases numeradas, repetições, cores e sequência. É o que o grupo já usa e reconhece, e trocar por uma grade obrigaria todo mundo a reaprender a ler.

**A grade é derivada, não escrita.** O player precisa saber quanto dura cada sílaba, e a ficha não diz isso com números. A duração sai do texto por uma regra simples (seção 4), com ajuste fino quando o texto não basta. A grade de tempos existe como visão alternativa: mostra em que instante cada sílaba cai, e serve para o instrutor conferir como a ficha foi lida.

**Mão e borda saem da sílaba.** É a convenção do kuchi shōga e é como a ficha do grupo já funciona: DON é direita, KON é esquerda, KA é borda. Não há marca separada para a mão.

**Suíngue é sensação, não escrita.** A música se escreve reta e leva `suingue: sim`. Quem balança é o player, como na tradição [4].

**Sem partitura ocidental.** A ficha e o teste de habilidades do grupo trabalham com o canto, não com a pauta.

**Hipóteses registradas.** Três leituras da ficha da ICHIGO são suposição minha e estão marcadas no arquivo da música:

- As faixas azul e laranja são dois **grupos ou lados** que se alternam (pergunta e resposta). O formato trata a cor como "grupo/lado". A ficha não explica a cor.
- O hífen é **ligação**: junta palavras da mesma frase e não muda a duração. A exceção possível é o hífen solto no fim da palavra (`DON- KA-`), que parece indicar nota longa.
- Sublinhado com negrito (`DON` no fim de "DON (HA!) – DON (HA!)") é um acento mais forte que o sublinhado simples.

## 3. O formato de texto

O arquivo tem três partes: cabeçalho, seções e sequência. Linhas em branco são livres. Uma linha que começa com `#` é comentário: o parser ignora e ela **não** volta na serialização.

```
título: ICHIGO
composição: Chad Nakagawa & Taishoji Taiko
digitação: Andrey Viana
bpm: 120
compasso: 4/4

[VERSO A]
1 (x2):
  >DON (HA!) – >>DON (HA!)
  DON KONDON KONDON-KON
2:
  DO KON (X4 CRESCENTE)
  obs: do kon, Do Kon, DO KON , DON KON

[VERSO B]
1 @azul: DONKON (X8)
2 @laranja: DONKON (X8)

sequência: VERSO A > VERSO B > VERSO A
```

### Cabeçalho

Uma linha `chave: valor` por informação, antes da primeira seção. As chaves aceitam maiúsculas e a falta de acento (`titulo`, `TÍTULO`).

| Chave        | Valor                                             | Se faltar                   |
| ------------ | ------------------------------------------------- | --------------------------- |
| `título`     | nome da música                                    | erro: é obrigatório         |
| `composição` | quem compôs                                       | não aparece                 |
| `digitação`  | quem escreveu a ficha                             | não aparece                 |
| `bpm`        | tempos por minuto, de 20 a 400                    | 100                         |
| `compasso`   | `4/4`, `6/8`... ou `livre`                        | livre                       |
| `suingue`    | `sim` ou `não`                                    | não                         |
| `partes`     | `Nome (instrumento), Nome (instrumento)`          | uma parte: `Taiko (nagado)` |
| `grupos`     | `azul = Lado direito, laranja = Lado esquerdo`    | as cores funcionam sem nome |
| `obs`        | observação impressa no fim da ficha; pode repetir | nenhuma                     |

Um **tempo** é uma palavra escrita (seção 4). O `bpm` conta esses tempos.

O `compasso` só serve ao metrônomo (acento no primeiro tempo) e às barras da grade. Músicas de frase irregular, como a Miyake, ficam em `livre`.

Instrumentos: `nagado`, `shime`, `okedo`, `odaiko`, `atarigane`. Cores de grupo: `azul`, `laranja`.

### Seções e frases

`[NOME]` abre uma seção. Logo abaixo, se a música tiver mais de uma parte, `parte: Nome` diz quem toca a seção. Sem essa linha, toca a primeira parte declarada.

Cada frase começa com o número e dois pontos:

```
# frase de uma linha
1: DON KON
# frase de várias linhas, tocada duas vezes
2 (x2):
  DON DON
  KA KA
# frase do grupo azul
3 @azul: DONKON (X8)
# repetição e grupo juntos
4 (x2) @laranja: DON
```

O número é só para quem lê: a ficha numera pela posição, então inserir uma frase no meio não obriga a renumerar o resto.

### O texto da frase

| Escrita                    | Significado                                                                    |
| -------------------------- | ------------------------------------------------------------------------------ |
| `DON`                      | batida forte (maiúsculas)                                                      |
| `do`                       | batida fraca (minúsculas)                                                      |
| `DONKON`, `DONdo`, `tsuku` | sílabas coladas: dividem um tempo                                              |
| `>DON`                     | acento: sai sublinhado                                                         |
| `>>DON`                    | acento mais forte: sublinhado e negrito                                        |
| `(HA!)`                    | kakegoe ou contagem: falado, não tocado; sai em itálico                        |
| `>(SA-SA-SA-SA!)`          | kakegoe em destaque: itálico e negrito                                         |
| `(X8)` no fim da linha     | repete a linha 8 vezes                                                         |
| `(X4 CRESCENTE)`           | repete com uma indicação; CRESCENTE e DECRESCENTE mudam o volume na reprodução |
| `obs: texto`               | linha de explicação: sai entre parênteses, não é tocada nem falada             |

Quatro formas de juntar palavras, todas preservadas como foram escritas e nenhuma mudando a duração:

| Escrita               | Exemplo                                                         |
| --------------------- | --------------------------------------------------------------- |
| espaço                | `DON KON`                                                       |
| hífen colado          | `DON-KON`                                                       |
| travessão com espaços | `DON – KON` (um `-` entre espaços vira travessão, como no Word) |
| hífen e espaço        | `DON- KA`                                                       |

As sílabas são separadas por regra, não por lista: consoantes, vogais e um "n" final opcional. `KONDON` é KON + DON, `tsuteteko` é tsu + te + te + ko. Por isso o vocabulário de qualquer grupo funciona. Uma sílaba que o motor não conhece gera um aviso e toca como batida no centro.

### Vocabulário reconhecido

| Sílabas         | Mão               | Onde   | Observação                               |
| --------------- | ----------------- | ------ | ---------------------------------------- |
| don, do         | direita           | centro |                                          |
| kon, ko, go, ro | esquerda          | centro |                                          |
| tsu, zu         | direita           | centro | leves mesmo em maiúsculas                |
| ku              | esquerda          | centro | leve mesmo em maiúsculas                 |
| ka              | direita           | borda  |                                          |
| ra, ta          | esquerda          | borda  |                                          |
| ten, te         | direita           | centro | vocabulário do shime                     |
| ke, re          | esquerda          | centro | vocabulário do shime                     |
| chan            | direita           | centro | atarigane, batida aberta                 |
| chi, ki         | direita, esquerda | borda  | atarigane, batida abafada                |
| su, un          |                   |        | pausa falada: aparece na ficha, não toca |

A lista vive em `src/lib/notacao/syllables.ts`. Acrescentar uma sílaba é acrescentar uma linha ali.

### Ajuste fino

Duas marcas mudam a duração sem aparecer na ficha impressa. Elas aparecem na grade.

| Escrita     | Significado                                                  |
| ----------- | ------------------------------------------------------------ |
| `DON:2`     | a palavra dura 2 tempos (aceita `2`, `1/2`, `0.5`, `3/4`)    |
| `(SORE!):2` | o kakegoe inteiro dura 2 tempos                              |
| `_`         | pausa silenciosa de um tempo                                 |
| `_ko`       | pausa colada na palavra: meio tempo de silêncio, depois o ko |

### Sequência

`sequência:` fecha o arquivo, na mesma linha ou na linha de baixo, como na ficha do grupo.

```
sequência: VERSO A > REFRÃO > VERSO B > VERSO A > REFRÃO
```

Com repetição, andamento e seções tocadas juntas:

```
sequência: MARCAÇÃO (x8) > MÚSICA BASE + MARCAÇÃO (x4, 80 bpm)
```

- `>` separa os passos, na ordem em que se toca.
- `(x4)` repete o passo. `(80 bpm)` muda o andamento só naquele passo.
- `+` junta seções **tocadas ao mesmo tempo**. A primeira manda na duração; as outras repetem em laço por baixo dela. É assim que se escreve a marcação sob a frase.
- Os nomes ignoram maiúsculas e acentos: `refrao` encontra `REFRÃO`.
- Sem sequência, a música toca cada seção uma vez, na ordem escrita.

### Erros e forma canônica

`parseSong` lança `NotationError` com todos os problemas de uma vez, cada um com linha, coluna e mensagem em português. `safeParseSong` devolve o mesmo sem lançar, mais os avisos.

```
linha 3: duração inválida depois de ":" (ex.: DON:2, doko:1/2)
linha 5: a sequência cita a seção "B", que não existe (seções: A)
```

`serializeSong` escreve sempre do mesmo jeito: chaves com acento, `(X8)` com espaço antes, frações no lugar de decimais, frases de várias linhas recuadas. Ler o que ela escreve devolve o mesmo modelo, e a ICHIGO e a Miyake voltam idênticas ao texto original (sem os comentários).

## 4. A regra de duração

A ficha não traz números de tempo. A grade sai do texto por estas regras:

1. **Cada palavra vale um tempo.** Palavra é o que está escrito sem espaço nem hífen no meio.
2. **Sílabas coladas dividem o tempo em partes iguais.** `DON` é um tempo; `DONKON` são duas colcheias; `dokodoko` são quatro semicolcheias.
3. **Espaço, hífen e travessão só separam palavras.** O hífen é ligação: diz que as palavras são da mesma frase. Não acrescenta nem tira tempo.
4. **Um kakegoe vale um tempo por palavra falada.** `(HA!)` é um tempo; `(SA-SA-SA-SA!)` são quatro.
5. **O ajuste fino manda quando existe.** `DON:2`, `_`, `(SORE!):2`.
6. **Com suíngue, o meio do tempo atrasa para o último terço.** Uma palavra de duas sílabas toca longo e curto. O resto do tempo acompanha na mesma proporção.

| Escrito                    | Tempos | Como soa                                           |
| -------------------------- | ------ | -------------------------------------------------- |
| `DON KON DON`              | 3      | três semínimas                                     |
| `DON KONDON KONDON-KON`    | 4      | semínima, duas colcheias, duas colcheias, semínima |
| `DONKON (X8)`              | 8      | dezesseis colcheias                                |
| `DONdo-KONko-DON`          | 3      | quatro colcheias e uma semínima                    |
| `DON:2- KA:2- KA KA KA KA` | 8      | duas mínimas e quatro semínimas                    |

A regra foi testada contra a própria ICHIGO. O VERSO B estreita a pergunta e resposta de 8 em 8, depois 4, depois 2, depois 1: com "palavra = um tempo", cada troca dura exatamente 8, 4, 2 e 1 tempos. Essa conta não depende de nenhuma suposição. Já os totais das seções (64, 48 e 68 tempos, compassos inteiros de 4/4) dependem das pausas e durações que assumi na seção 8.

O que a regra não resolve sozinha: pausas que a ficha deixa implícitas (o tempo de silêncio depois de `DON-KON-DONKON`), notas longas e kakegoe que ocupam mais de um tempo por palavra. Para isso existe o ajuste fino.

## 5. O modelo

`src/lib/notacao/model.ts` define o modelo com zod. `songSchema` valida qualquer objeto, venha do parser ou de um editor visual, com as mesmas regras e as mesmas mensagens.

```
Song
  title, composer?, transcriber?, bpm, meter?, swing
  parts[]      { name, instrument }
  groups[]     { color, label }
  notes[]      observações impressas
  sections[]   { name, part?, phrases[] }
    phrases[]  { repeat, group?, lines[] }
      lines[]  { kind: "notes", tokens[], repeat? } ou { kind: "remark", text }
        tokens[]  { kind: "word", units[], accent, sep?, duration? }
                  { kind: "voice", text, emphasis, sep?, duration? }
          units[]  { kind: "syllable", text, weak } ou { kind: "rest" }
  sequence[]   { sections[], repeat, bpm? }
```

O que o enunciado pedia em cada célula está aqui, em parte guardado e em parte derivado:

| Pedido                | Onde está                                               |
| --------------------- | ------------------------------------------------------- |
| sílaba                | `unit.text`, sempre em minúsculas                       |
| batida forte ou fraca | `unit.weak`                                             |
| acento                | `token.accent` (0, 1 ou 2), vale para a palavra inteira |
| pausa                 | `unit.kind === "rest"` ou sílaba `su`                   |
| kakegoe               | `token.kind === "voice"`                                |
| mão e borda           | derivadas da sílaba por `syllableInfo`                  |

`timeLine(linha)` devolve a grade: cada célula com início e duração em tempos, mão (`right`, `left`), zona (`center`, `rim`), força, acento e tipo (`hit`, `rest`, `voice`). `buildTimeline(song)` desenrola a sequência inteira em segundos, com repetições, camadas, andamentos e suíngue já aplicados.

O modelo é JSON puro: `JSON.stringify` e `JSON.parse` devolvem a mesma música. Para guardar uma ficha, há duas opções:

- **Guardar o texto.** Preserva os comentários `#` e é o que o instrutor escreveu. Recomendado se o editor for uma caixa de texto.
- **Guardar o JSON.** Mais fácil para um editor visual. Valide com `songSchema` na entrada e use `serializeSong` para mostrar o texto.

## 6. Renderização

### Um layout, dois destinos

`layoutSong(song, visão)` calcula a ficha uma vez só e devolve páginas de primitivas (retângulo, linha, texto com posição e largura). O SVG da tela e o PDF desenham as mesmas primitivas. O que se vê é o que se imprime, e não há duas implementações para sair do sincronismo.

As larguras de texto vêm das métricas da Helvetica, embutidas em `layout/metrics.ts`. Arial e Liberation Sans foram desenhadas com as mesmas larguras, e o SVG ainda ajusta cada trecho de texto à largura calculada, então a ficha na tela ocupa o mesmo espaço que a do PDF. Conferi a tabela contra o que o Poppler mede no PDF gerado: nas sete palavras que comparei, os valores batem até a terceira casa decimal.

Duas visões:

- **`ficha`** (padrão): a tabela do Kodon. Cabeçalho com o nome do grupo, título, Composição, Digitação e Andamento; uma tabela por seção; faixas de cor; SEQUÊNCIA; observações; legenda.
- **`grade`**: uma caixa por tempo, cada sílaba no instante em que soa, a mão embaixo (D ou E), `×` para a borda e `·` para a pausa. Linhas longas quebram a cada 8 tempos.

A legenda é montada a partir da música: só entram as sílabas e as convenções que ela usa.

### Na tela e na impressão

`TaikoSheet` desenha um `<svg>` por página A4. É um componente puro, sem estado e sem hooks, o que permite desenhá-lo no servidor. Isso foi testado com `renderToStaticMarkup`; como Server Component do Next não foi testado, porque nenhuma página do site monta o componente ainda. Recebe `activeKeys` para pintar o cursor do player.

Ao imprimir pelo navegador, o componente declara o tamanho do papel da ficha e margem zero, e cada SVG ocupa exatamente uma folha. Conferi no Chromium: a ICHIGO imprime em 2 páginas A4, iguais às do PDF. A regra de página vale para o documento inteiro enquanto houver uma ficha na tela, então o que estiver em volta deve levar `print:hidden` (os controles do player já levam).

### PDF: jsPDF

`songToPdf(song, { view })` devolve os bytes do PDF. A mesma função roda no navegador e no servidor.

Escolhi o **jsPDF** (licença MIT) por estes motivos:

- **Roda nos dois lados sem configuração.** O pacote traz um build para Node e outro para navegador, escolhidos pelo `exports`. Os testes geram o PDF em Node; o download foi verificado no Chrome.
- **É maduro e está vivo.** Está no npm desde 2015 e continua recebendo versões: a 4.0 saiu em janeiro de 2026 e a 4.2.1, usada aqui, em março de 2026.
- **A API é a que o layout precisa.** Retângulo, linha e texto em coordenadas. Como o layout já resolve tudo, a camada de PDF tem cerca de 100 linhas.
- **Sem arquivos de fonte.** Usa as fontes padrão do PDF. A ICHIGO pesa 5 kB.

O que descartei:

| Biblioteca              | Motivo                                                                                                               |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------- |
| pdf-lib                 | API boa, mas a última versão (1.17.1) é de novembro de 2021                                                          |
| PDFKit                  | feita para Node; no navegador exige polyfills de `stream` e `Buffer` ou o build avulso, que brigam com o empacotador |
| @react-pdf/renderer     | traz motor de layout próprio e obriga a reescrever a ficha nos componentes dele: seriam duas fichas para manter      |
| imprimir pelo navegador | não roda no servidor                                                                                                 |

Não testei as alternativas neste projeto. As datas vêm do registro do npm; os outros motivos vêm do que conheço do desenho de cada uma.

**Limite conhecido.** As fontes padrão cobrem o alfabeto latino com acentos. Um título em japonês sai com `?` no lugar dos caracteres. Para suportar kana seria preciso embutir uma fonte; o layout já mede esses caracteres, falta só a fonte.

O jsPDF não entra no pacote de quem só mostra a ficha: `pdf.ts` não é reexportado pelo `index.ts`, e `downloadSongPdf` o carrega sob demanda.

## 7. Reprodução

`TaikoPlayer` (em `player/engine.ts`) toca a linha do tempo com Web Audio. Não depende de React.

- **Agendamento.** Um temporizador acorda a cada 25 ms e agenda no relógio do áudio as batidas dos próximos 150 ms. O instante de cada golpe é o do relógio do áudio, não o do temporizador, então o ritmo não treme com a interface ocupada. Medido no Chrome: cada batida foi agendada entre 60 e 140 ms antes de soar.
- **Andamento.** De 0,25 a 2 vezes o bpm escrito, ajustável durante a música.
- **Loop de seção.** Repete um passo da sequência até mandar parar.
- **Metrônomo.** Um clique por tempo, mais agudo no primeiro tempo do compasso ou no começo de cada linha quando o compasso é livre.
- **Mudo e solo por parte**, e **mudo por grupo**. Os grupos saem levemente para lados opostos no estéreo, para a pergunta e resposta ficar audível.
- **Cursor.** O player publica as células que estão soando; a ficha pinta. Funciona nas duas visões.
- **Dinâmica.** Minúscula toca mais fraco, acento mais forte, tsu e ku sempre leves. `CRESCENTE` e `DECRESCENTE` numa repetição mudam o volume de volta em volta.
- **Kakegoe e pausas não soam.** O cursor passa por eles.

### Sons e licença

**Todos os sons são sintetizados** em `player/synth.ts`, com osciladores e ruído filtrado do próprio Web Audio. Não há amostra de áudio no repositório, portanto não há licença de terceiros a registrar: o código do sintetizador é do projeto.

Cada instrumento é um conjunto de parâmetros. Medi os sons renderizados no Chrome:

| Instrumento | Centro                           | Borda                          |
| ----------- | -------------------------------- | ------------------------------ |
| nagado      | 110 a 130 Hz, soa por uns 320 ms | estalo perto de 1,3 kHz, 35 ms |
| odaiko      | 80 a 100 Hz, uns 600 ms          | perto de 900 Hz                |
| okedo       | cerca de 190 Hz                  | perto de 1,6 kHz               |
| shime       | cerca de 480 Hz, 80 ms           | perto de 2,9 kHz               |
| atarigane   | sino perto de 3,4 kHz, 220 ms    | o mesmo sino, abafado em 50 ms |

A frequência é a dominante nos primeiros 100 ms; a duração é o tempo acima de 1% do volume máximo, na batida mais forte.

São aproximações para estudo, não gravações. Trocar por amostras no futuro é trocar a implementação de `PlayerAudio`; o resto do player não muda.

### Limites conhecidos

- Não há acelerando gradual: o andamento só muda de um passo da sequência para o outro.
- Em aba em segundo plano o navegador atrasa os temporizadores. O player passa a agendar 1,5 s à frente nesse caso, e mudo e andamento demoram esse tanto para valer. Esse caminho não foi medido no navegador.
- O ajuste de andamento continua valendo quando a música é trocada ou editada.

## 8. As músicas de exemplo

### ICHIGO

Transcrita da ficha do grupo (digitação de Andrey Viana). Seções, frases, repetições, sublinhados, kakegoe, cores e sequência estão como na ficha. O PDF gerado segue o desenho do original, também em duas páginas, com três acréscimos: o nome do grupo no topo, a linha de Andamento e a legenda no fim. A fonte é Helvetica, não a Calibri do original.

O que a ficha não diz e está marcado como `# incerto` em `musicas/ichigo.ts`:

| Ponto                                | O que assumi                                     |
| ------------------------------------ | ------------------------------------------------ |
| andamento e compasso                 | 120 bpm, 4/4                                     |
| `DON-KON-DONKON` e `DONdo-KONko-DON` | um tempo de pausa depois, para fechar o compasso |
| `(SORE!)` no fim do VERSO A          | dois tempos                                      |
| `(SA-SA-SORE!)`                      | quatro tempos, como o `(SA-SA-SA-SA!)`           |
| `DON- KA-`                           | duas notas longas, de dois tempos cada           |
| azul e laranja                       | dois grupos ou lados que se alternam             |

Nenhuma dessas marcas é impressa. Corrigir é mexer no texto.

### Miyake

**É uma transcrição de referência, não a ficha do grupo.** Não havia ficha do Kodon para a Miyake; montei esta a partir de material de outros grupos, e ela precisa ser conferida antes de ir para a aula.

**De onde vem a música.** O "Miyake" que o Kodo espalhou pelo mundo é o Miyake-jima Kamitsuki Mikoshi Daiko, o taiko que conduz o mikoshi no festival Gozu Tennō, na ilha de Miyake, desde 1820 [8]. O tambor fica deitado e baixo, e dois tocadores batem ao mesmo tempo, um em cada couro, em postura baixa: a frente (omote) e as costas (ura) [8][9]. A tradição tem só três ritmos básicos e dispensa partitura [8]. O Kamitsuki Kiyari Daiko é patrimônio folclórico imaterial de Tóquio desde 1970 [10].

**Os dois ritmos.** O artigo da Yamaha descreve o uchikomi como dois ritmos simultâneos, "como dois corações batendo": o ura constante, 「ドドン・ドドン・ドドン・ドドン」, e o omote com variação, 「ドンツク・ドンツク・ドンドン」 [9]. No palco, o omote repete a frase fixa enquanto o ura acompanha; depois de alguns ciclos, cada vez mais rápidos e trocando de lado, vêm os improvisos, e a volta ao ritmo base anuncia o fim [6].

**No vocabulário do grupo.** O teste de habilidades fala em "Música Base e Marcação", "Troca de Tsukudons" e "Troca de Marcação". A ficha segue esses nomes:

- **MARCAÇÃO** é o ji-uchi do ura.
- **MÚSICA BASE** é a frase do omote. A primeira linha é o **tsukudon**: a busca devolveu, de um blog japonês que já estava fora do ar, o kuchi shōga do taiko de Miyake como 「ツク・ドン・ツク・ドン・ツクドンドン」, "tsuku DON tsuku DON tsuku DON DON". Deve ser daí o nome que o grupo usa.

```
[MARCAÇÃO]
1: DONdo

[MÚSICA BASE]
1 (x2): (tsuku) DON (tsuku) DON (tsuku) DON DON
2: doDON _ko DON DON
3: tsute teko DON DON
```

**Como cheguei às durações.** A ficha de kuchi shōga da Shangö Percussion, aprendida com o Kaoru Watanabe Taiko Center, traz as sílabas e as mãos, mas não os valores [6]. Medi os ataques nas duas gravações de estudo da Shangö [7]:

- **Marcação.** As batidas vêm em pares, com 0,31 s dentro do par e 0,59 s até o par seguinte, num ciclo de 0,905 s. É a proporção 1 para 2: fraca, forte e um silêncio, em tercina. A segunda batida é a forte.
- **Frase.** Com o tempo valendo 0,886 s, os DON da primeira linha ficam a 2, 2, 1 e 2 tempos um do outro; os da segunda, a 2, 2, 1 e 1. A terceira linha ("do-don ko don don") bate em 0, meio, um e meio, 2 e 3. A quarta ("tsu-te-te-ko don don") em 0, meio, 1, um e meio, 2 e 3. O ciclo inteiro tem 22 tempos.

Girando o ciclo para começar no "tsuku", a frase fica regular: 7 + 7 + 4 + 4 tempos, e a primeira linha é exatamente o tsukudon. Na reprodução, a marcação sai com intervalos de 0,606 s e 0,303 s a 66 bpm, a mesma proporção medida.

**O que é incerto**, marcado como `# incerto` em `musicas/miyake.ts`:

| Ponto                                      | O que assumi                                                           | Por quê                                                                                                                                                                    |
| ------------------------------------------ | ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| encaixe da marcação com a frase            | o DON no tempo, o "do" antes dele                                      | as gravações são separadas, não dá para medir; é a leitura "ko-DON" da Shangö e do Tatsumaki [4][6]                                                                        |
| o "tsuku"                                  | falado, não tocado                                                     | na ficha da Shangö vem entre parênteses e a gravação não tem batida ali; o kuchi shōga japonês escreve o "tsuku" sem parênteses, então na ilha ele pode ser tocado de leve |
| força do "do", do "ko" e do "tsu-te-te-ko" | fracos                                                                 | convenção do kuchi shōga; na gravação a diferença é pequena                                                                                                                |
| contratempos                               | suíngue de tercina                                                     | medidos entre 0,43 e 0,67 do tempo, entre o reto e o tercinado                                                                                                             |
| andamento                                  | 66 bpm, depois 80 e 96                                                 | 66 é o da gravação; o arranjo da Shangö sugere lento, médio e rápido [6]                                                                                                   |
| sequência                                  | marcação sozinha, depois a música base em blocos cada vez mais rápidos | forma de palco descrita em [6]; a do Kodon pode ser outra                                                                                                                  |

**O que ficou de fora:** os solos, o kiyari cantado, o final e as trocas de tocador. As trocas são movimento de palco, não ritmo; a ficha só registra que o teste as pede.

## 9. Como usar

### Tudo junto

```tsx
import { TaikoSheetPlayer } from "@/components/notacao";
import { miyake } from "@/lib/notacao/musicas";

export function PaginaDaFicha() {
	return <TaikoSheetPlayer song={miyake} />;
}
```

`TaikoSheetPlayer` traz os controles, a troca entre ficha e grade, o botão de PDF e a ficha com o cursor. É um componente de cliente.

### Montando as peças

```tsx
"use client";

import {
	downloadSongPdf,
	TaikoPlayerControls,
	TaikoSheet,
	useTaikoPlayer,
} from "@/components/notacao";
import type { Song } from "@/lib/notacao";

export function Ensaio({ song }: { song: Song }) {
	const { player, snapshot } = useTaikoPlayer(song);
	return (
		<>
			<TaikoPlayerControls song={song} player={player} snapshot={snapshot} />
			<button type="button" onClick={() => downloadSongPdf(song)}>
				Baixar PDF
			</button>
			<TaikoSheet song={song} activeKeys={snapshot.activeKeys} />
		</>
	);
}
```

Os textos dos controles vêm em português e aceitam tradução pela propriedade `labels`. As opções de layout (`groupName`, `legend`, `labels`, tamanho da página) entram por `options`.

### Editor do instrutor

```tsx
"use client";

import { useMemo, useState } from "react";
import { TaikoSheetPlayer } from "@/components/notacao";
import { safeParseSong, type Song } from "@/lib/notacao";

export function EditorDeFicha({ inicial }: { inicial: string }) {
	const [texto, setTexto] = useState(inicial);
	const resultado = useMemo(() => safeParseSong(texto), [texto]);
	const [ultima, setUltima] = useState<Song | null>(null);
	if (resultado.ok && resultado.song !== ultima) setUltima(resultado.song);

	return (
		<>
			<textarea value={texto} onChange={(e) => setTexto(e.target.value)} />
			{!resultado.ok && (
				<ul>
					{resultado.issues.map((problema, indice) => (
						<li key={`${indice}:${problema.line}:${problema.column}`}>
							linha {problema.line}: {problema.message}
						</li>
					))}
				</ul>
			)}
			{ultima && <TaikoSheetPlayer song={ultima} />}
		</>
	);
}
```

Enquanto o texto tem erro, a última ficha válida continua na tela. Foi esse o fluxo verificado no Chrome.

### PDF no servidor

```ts
import { parseSong } from "@/lib/notacao";
import { songToPdf } from "@/lib/notacao/pdf";

export async function GET() {
	const song = parseSong(await carregarTextoDaFicha());
	return new Response(songToPdf(song), {
		headers: {
			"Content-Type": "application/pdf",
			"Content-Disposition": 'inline; filename="ficha.pdf"',
		},
	});
}
```

`carregarTextoDaFicha` é de quem integra: de onde vier o texto guardado. `songToPdf(song, { view: "grade" })` exporta a grade.

### Sem React

```ts
import { parseSong, TaikoPlayer } from "@/lib/notacao";

const player = new TaikoPlayer(parseSong(texto));
player.subscribe(() => desenharCursor(player.getSnapshot().activeKeys));
player.setLoopStep(1);
await player.play();
```

`desenharCursor` é a função de quem integra. `play()` precisa vir de um gesto do usuário (um clique), porque os navegadores só liberam o áudio assim.

## 10. Testes e verificação

`npm test` roda o Vitest (mais de 190 testes):

| Arquivo               | O que prova                                                                   |
| --------------------- | ----------------------------------------------------------------------------- |
| `syllables.test.ts`   | separação de sílabas e vocabulário                                            |
| `parser.test.ts`      | cabeçalho, seções, texto corrido, sequência e as mensagens de erro com linha  |
| `roundtrip.test.ts`   | ICHIGO e Miyake vão e voltam idênticas; a ICHIGO confere com a ficha impressa |
| `model.test.ts`       | validação zod, inclusive do que quebraria a ida e volta                       |
| `timing.test.ts`      | a regra de duração e o tamanho de cada seção                                  |
| `timeline.test.ts`    | segundos, repetições, camadas, suíngue, crescendo, metrônomo                  |
| `layout.test.ts`      | a ficha (tabelas, cores, sublinhados, paginação) e a grade                    |
| `pdf.test.ts`         | o PDF relido com pdf.js: páginas, textos, acentos, opções                     |
| `player.test.ts`      | agendamento, andamento, loop, mudo, solo, pausa, com relógio de áudio falso   |
| `components.test.tsx` | os componentes renderizados no servidor                                       |

O que os testes não alcançam foi conferido num Chrome de verdade, com uma página temporária que não ficou no repositório:

- os sons de cada instrumento, renderizados e medidos;
- o áudio saindo durante a reprodução e as batidas agendadas com antecedência;
- o cursor andando no andamento certo, na ficha e na grade;
- solo da marcação da Miyake, loop de seção, andamento, pausa e parada;
- o editor mostrando erros com linha e voltando a desenhar ao corrigir;
- o PDF gerado pelo navegador, e a impressão em A4.

## 11. O que ficou de fora

- Autenticação, banco e gravação de fichas (outra tarefa).
- Página de demonstração: os componentes estão prontos para montar.
- Acento em só uma sílaba de uma palavra colada; hoje o acento vale para a palavra.
- Marca explícita de mão, para os casos em que a sílaba não basta.
- Kana na ficha e no PDF.
- Acelerando e oroshi (o rufo que acelera).
- As outras músicas do repertório: Buchi Awase (iri, kaiten) e Chichibu Yatai-Bayashi. O formato já comporta seções com esses nomes e uma base de shime por baixo da frase.

## Fontes

Consultadas em 26/11/2026.

1. Wikipedia, "Kuchi shōga". https://en.wikipedia.org/wiki/Kuchi_sh%C5%8Dga (CC BY-SA 4.0)
2. Tatsumaki Taiko, "Dictionary of Taiko Terminology", 2000. https://users.lmi.net/taikousa/dictionary.html
3. "Learn to Play Taiko!", módulo Kuchishoga. https://saltfie.github.io/intro-to-taiko/modules/kuchishoga/syllables (CC BY-SA 4.0)
4. Tatsumaki Taiko, "Taiko Rudiments". http://users.lmi.net/taikousa/taiko_rudiments.html
5. Kurt Griffith (Shangö Percussion), "Introduction to Japanese Taiko Drumming: Basic Techniques and Rhythms", março de 2020. https://shangopercussion.org/docs/TaikoWorkShop_BasicsHandout.pdf
6. Shangö Percussion: página de taiko, com citação de Benjamin Pachter (Esto Es Taiko) sobre a forma de palco, https://shangopercussion.org/taiko_page.html ; "Miyake Taiko Kuchishoga", 2019, https://shangopercussion.org/docs/Miyake_Taiko_Kuchishoga.pdf ; "Simple Miyake Daiko Arrangement for 2 Persons", 2019, https://shangopercussion.org/docs/Simple-Miyake-2-person.pages.pdf
7. Shangö Percussion, gravações de estudo usadas na medição: https://shangopercussion.org/audio/Miyake_Jichi_Practice.mp3 e https://shangopercussion.org/audio/Miyake_Main_Pattern.mp3
8. 三宅島芸能同志会 (Tsumura Akio), "三宅太鼓について". https://miyaketaiko.com/about/
9. 小野和哉, "復興の島に鳴り響く太鼓の音・三宅島の牛頭天王祭", Yamaha Sheet Music Store, 6 de agosto de 2025. https://sheetmusic.jp.yamaha.com/blogs/magazine/matsuri-13
10. 和太鼓 鼓太郎, "三宅島神着木遣り太鼓". http://www.wadaiko-kotaro.com/shoukai-miyake.htm
11. Documentos do grupo, recebidos do dono do projeto: ficha "ICHIGO" (composição de Chad Nakagawa e Taishoji Taiko, digitação de Andrey Viana) e "Teste de Habilidades" do Grupo Kodon Amazon Taiko.
