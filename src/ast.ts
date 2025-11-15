export type Declaration = {
  type: 'declaration';
  property: string;
  value: string;
};

export type Comment = {
  type: 'comment';
  value: string;
};

export type Node = Declaration | Comment;
