import Dexie from 'dexie';
import type { Table } from 'dexie';
import type { BookmarkTreeNode } from '../types/bookmark';

// 创建数据库类
class BookmarkDatabase extends Dexie {
    // 定义表
    bookmarks!: Table<BookmarkTreeNode, string>;

    constructor() {
        super('MyBookmarks');
        this.version(1).stores({
            bookmarks: 'id, parentId, type, index', // 主键和索引
        });
    }
}

// 实例化数据库
const db = new BookmarkDatabase();

export { db };
