const SOUNDTRACK_DIRECTORY = 'assets/mp3/';

/**
 * New audio soundtrack will be created and played.
 *
 * @param fileName The name of the sound file to be played.
 */
export const playSound = (fileName: string) =>
    new Audio(SOUNDTRACK_DIRECTORY + fileName).play();
