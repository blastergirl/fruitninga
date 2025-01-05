import { EventData, Page, PanGestureEventData } from '@nativescript/core';
import { GameViewModel } from './game/game-view-model';

let gameViewModel: GameViewModel;

export function navigatingTo(args: EventData) {
  const page = <Page>args.object;
  gameViewModel = new GameViewModel();
  page.bindingContext = gameViewModel;
}

export function onPan(args: PanGestureEventData) {
  gameViewModel.handleSwipe(args.x, args.y);
}