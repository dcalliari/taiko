import { parseSong } from "../parser";

/**
 * MIYAKE (Miyake-jima Kamitsuki Mikoshi Daiko), in the group's vocabulary:
 * MARCAÇÃO is the ji-uchi played on the back head (ura) and MÚSICA BASE is
 * the fixed phrase played on the front head (omote), whose first line is the
 * "tsukudon". Sources and reasoning are in docs/notacao.md.
 *
 * This is a reference transcription, not the group's own sheet. It follows
 * the kuchi shōga published by Shangö Percussion (taught by the Kaoru
 * Watanabe Taiko Center) and the island's "tsuku DON tsuku DON tsuku DON
 * DON", with the note lengths measured on Shangö's practice recordings.
 * Every doubtful point is marked with a comment in the text below.
 */
export const miyakeSource = `título: MIYAKE
composição: Tradicional de Miyake-jima (Kamitsuki Mikoshi Daiko)
digitação: transcrição de referência, a conferir com o grupo
# incerto: andamento. A gravação de estudo medida está perto de 66 bpm; no
# palco a música começa lenta e acelera a cada troca.
bpm: 66
suingue: sim
partes: Música Base (nagado), Marcação (nagado)
obs: Postura baixa, taiko deitado e baixo, um tocador em cada couro: a música base na frente (omote) e a marcação atrás (ura).
obs: O teste de habilidades do grupo pede Música Base e Marcação, Troca de Tsukudons e Troca de Marcação. As trocas de tocador não estão escritas nesta ficha.
obs: Transcrição de referência, feita a partir de fichas e gravações de estudo de outros grupos. Conferir com o grupo antes de usar em aula.

[MARCAÇÃO]
parte: Marcação
# O ji-uchi se canta "do-DON, do-DON": batida fraca seguida de batida forte,
# com o intervalo curto entre as duas (medido: um terço do tempo).
# incerto: o encaixe com a música base. Aqui o DON cai no tempo e o "do" o
# antecede, no contratempo com suíngue.
1: DONdo

[MÚSICA BASE]
# Tsukudon: "tsuku" é falado para contar, o braço arma o golpe; só o DON soa.
# incerto: o kuchi shōga da ilha escreve o "tsuku" sem parênteses; pode ser
# que ele seja tocado de leve em vez de só falado.
1 (x2): (tsuku) DON (tsuku) DON (tsuku) DON DON
# "do-DON ko DON DON": o "ko" cai no contratempo do segundo tempo.
# incerto: a força do "do" e do "ko" (escritos fracos aqui).
2: doDON _ko DON DON
# incerto: as mãos e a força de "tsu-te-te-ko".
3: tsute teko DON DON

# incerto: a ordem abaixo é a forma de palco mais comum (marcação sozinha,
# depois a música base em voltas cada vez mais rápidas, trocando de tocador a
# cada duas voltas). Solos, kiyari e final não estão transcritos.
sequência: MARCAÇÃO (x8) > MÚSICA BASE + MARCAÇÃO (x4) > MÚSICA BASE + MARCAÇÃO (x4, 80 bpm) > MÚSICA BASE + MARCAÇÃO (x4, 96 bpm)
`;

export const miyake = parseSong(miyakeSource);
