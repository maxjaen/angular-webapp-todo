import { Injectable } from "@angular/core";

const MP3_DIR: string = "assets/mp3/";
const MP3_EXTENSION: string = ".mp3";

@Injectable({
  providedIn: "root",
})
export class SoundService {
  constructor() {}

  playSound(fileName: string) {
    new Audio(MP3_DIR + fileName + MP3_EXTENSION).play();
  }
}
