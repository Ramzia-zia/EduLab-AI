 import { TitrationScreen } from './ui/titration-screen.js';

export class TitrationFeature {
  constructor(container, params, onEvent) {
    this.screen = new TitrationScreen(container, params, onEvent);
  }
}