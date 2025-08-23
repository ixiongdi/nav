import type { BookmarkTreeNode } from '../types/bookmark';

function create(node: BookmarkTreeNode): Promise<BookmarkTreeNode> {}

function get(idOrIdList: string | [string, ...string[]]): Promise<BookmarkTreeNode[]>;

function getChildren(id: string): Promise<BookmarkTreeNode[]>;

function getRecent(numberOfItems: number): Promise<BookmarkTreeNode[]>;

function getSubTree(id: string): Promise<BookmarkTreeNode[]>;

function getTree(): Promise<BookmarkTreeNode[]>;

function move(id: string, destination: object): Promise<BookmarkTreeNode>;

function remove(id: string): Promise<void>;

function removeTree(id: string): Promise<void>;

function search(query: string | object): Promise<BookmarkTreeNode[]>;

function update(id: string, changes: object): Promise<BookmarkTreeNode>;
