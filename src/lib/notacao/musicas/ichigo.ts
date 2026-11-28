import { parseSong } from "../parser";

/**
 * ICHIGO, transcribed from the group's own sheet (ICHIGO_10.pdf, typed by
 * Andrey Viana). Sections, phrases, repeats, underlines, kakegoe, row colors
 * and the sequence are exactly as printed there.
 *
 * What the printed sheet does not say, and is a hypothesis to confirm with
 * the group (each one is marked with a comment in the text below):
 * - bpm and meter;
 * - the silent beats (`_`) that complete the bar after a three-beat line;
 * - how long the kakegoe "(SORE!)" and "(SA-SA-SORE!)" last;
 * - "DON- KA-" read as two long notes of two beats each;
 * - the blue and orange rows read as two groups or sides taking turns.
 * None of these marks is printed: the sheet looks the same without them.
 */
export const ichigoSource = `título: ICHIGO
composição: Chad Nakagawa & Taishoji Taiko
digitação: Andrey Viana
# incerto: a ficha não traz andamento nem compasso.
bpm: 120
compasso: 4/4

[VERSO A]
1 (x2):
  >DON (HA!) – >>DON (HA!)
  DON KONDON KONDON-KON
  >DON (HA!) – >>DON (HA!)
  DON-KON-DON KON
2 (x2):
  DON KONDON KONDON-KON
  # incerto: pausa de um tempo para fechar o compasso.
  DON-KON-DONKON _
3:
  DO KON (X4 CRESCENTE)
  obs: do kon, Do Kon, DO KON , DON KON
4:
  DON – KON (X3)
  # incerto: "SORE!" ocupando os dois tempos que fecham a frase.
  (SORE!):2

[REFRÃO]
1 (x2):
  # incerto: pausa de um tempo depois de cada DONdo-KONko-DON.
  DONdo-KONko-DON _
  >(SA-SA-SA-SA!)
  DONdo-KONko-DON _
  # incerto: "SA-SA-SORE!" em quatro tempos, como o "SA-SA-SA-SA!".
  >(SA-SA-SORE!):4
2:
  DONdo-KONko-DON _
  DONdo-KONko-DON _
  # incerto: "DON-" e "KA-" como notas longas, de dois tempos cada.
  >DON:2- KA:2- KA KA KA KA

[VERSO B]
# incerto: azul e laranja lidos como dois grupos ou lados que se alternam.
1 @azul: DONKON (X8)
2 @laranja: DONKON (X8)
3 @azul: DONKON (X8)
4 @laranja: DONKON (X8)
5 @azul: DONKON (X4)
6 @laranja: DONKON (X4)
7 @azul: DONKON (X4)
8 @laranja: DONKON (X4)
9 @azul: DONKON (X2)
10 @laranja: DONKON (X2)
11 @azul: DONKON (X2)
12 @laranja: DONKON (X2)
13 @azul: DONKON
14 @laranja: >DON
15 @azul: DONKON
16 @laranja: >DON
17 @azul: >DON
18 @laranja: >DON
19 @azul: >DON
20 @laranja: >DON
21: (ICHI-NI-SO-RE!)

sequência: VERSO A > REFRÃO > VERSO B > VERSO A > REFRÃO
`;

export const ichigo = parseSong(ichigoSource);
