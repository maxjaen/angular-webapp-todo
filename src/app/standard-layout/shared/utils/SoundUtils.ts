const SOUNDTRACK_DIRECTORY = 'assets/mp3/';

/**
 * For future reference
 * https://stackoverflow.com/questions/32790311/how-to-structure-utility-class/37659978#37659978
 *
 * New audio soundtrack will be created and played
 * @param fileName name of the sound file
 */
export function playSound(fileName: string): void {
  new Audio(SOUNDTRACK_DIRECTORY + fileName).play();
}
