/**
 * For future reference
 * https://stackoverflow.com/questions/32790311/how-to-structure-utility-class/37659978#37659978
 *
 * New audio soundtrack will be created and played
 * @param fileName name of the sound file without extension
 */
export function playSound(fileName: string): void {
  const soundtrackExtension = '.mp3';
  const soundtrackDirectory = 'assets/mp3/';

  new Audio(soundtrackDirectory + fileName + soundtrackExtension).play();
}
