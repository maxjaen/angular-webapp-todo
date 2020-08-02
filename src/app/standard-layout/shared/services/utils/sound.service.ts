import { Injectable } from '@angular/core';

const MP3_DIR = 'assets/mp3/';
const MP3_EXTENSION = '.mp3';

@Injectable({
  providedIn: 'root',
})
export class SoundService {
  constructor() {}

  public playSound(fileName: string): void {
    new Audio(MP3_DIR + fileName + MP3_EXTENSION).play();
  }
}
