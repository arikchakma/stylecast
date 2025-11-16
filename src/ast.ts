import type { Position } from './token';

export type Declaration = {
  type: 'declaration';
  property: string;
  value: string;
  start: Position;
  end: Position;
};

export type Comment = {
  type: 'comment';
  value: string;
  start: Position;
  end: Position;
};

export type Node = Declaration | Comment;
