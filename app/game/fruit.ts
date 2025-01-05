import { Observable } from '@nativescript/core';

export class Fruit extends Observable {
  private _x: number;
  private _y: number;
  private _type: string;
  private _sliced: boolean;

  constructor(type: string, x: number, y: number) {
    super();
    this._type = type;
    this._x = x;
    this._y = y;
    this._sliced = false;
  }

  get x(): number { return this._x; }
  set x(value: number) {
    if (this._x !== value) {
      this._x = value;
      this.notifyPropertyChange('x', value);
    }
  }

  get y(): number { return this._y; }
  set y(value: number) {
    if (this._y !== value) {
      this._y = value;
      this.notifyPropertyChange('y', value);
    }
  }

  get type(): string { return this._type; }
  get sliced(): boolean { return this._sliced; }

  slice() {
    this._sliced = true;
    this.notifyPropertyChange('sliced', true);
  }
}