import type { BookmarkTreeNode, CreateDetails } from '../types/bookmark';
import { v7 } from 'uuid';
import { db } from './database';

/**
 * 书签操作接口，提供对书签的创建、获取、修改、删除等操作
 */
interface Bookmarks {
    /**
     * 创建新的书签或文件夹
     * @param node - 创建书签的详细信息，包括父节点ID、索引、标题、URL和类型等
     * @returns 返回创建的书签节点
     */
    create(node: CreateDetails): Promise<BookmarkTreeNode>;

    /**
     * 根据ID获取一个或多个书签节点
     * @param idOrIdList - 单个书签ID或多个书签ID组成的数组
     * @returns 返回匹配的书签节点数组
     */
    get(idOrIdList: string | [string, ...string[]]): Promise<BookmarkTreeNode[]>;

    /**
     * 获取指定文件夹的子节点
     * @param id - 文件夹的ID
     * @returns 返回该文件夹下的所有子节点
     */
    getChildren(id: string): Promise<BookmarkTreeNode[]>;

    /**
     * 获取最近使用的书签
     * @param numberOfItems - 要获取的最近使用书签的数量
     * @returns 返回最近使用的书签数组
     */
    getRecent(numberOfItems: number): Promise<BookmarkTreeNode[]>;

    /**
     * 获取指定节点及其所有子节点组成的树结构
     * @param id - 节点ID
     * @returns 返回以该节点为根的子树
     */
    getSubTree(id: string): Promise<BookmarkTreeNode[]>;

    /**
     * 获取整个书签树
     * @returns 返回完整的书签树结构
     */
    getTree(): Promise<BookmarkTreeNode[]>;

    /**
     * 移动书签到指定位置
     * @param id - 要移动的书签ID
     * @param destination - 目标位置信息，包括父节点ID和索引等
     * @returns 返回移动后的书签节点
     */
    move(id: string, destination: object): Promise<BookmarkTreeNode>;

    /**
     * 删除指定的书签
     * @param id - 要删除的书签ID
     * @returns 无返回值
     */
    remove(id: string): Promise<void>;

    /**
     * 删除指定节点及其所有子节点
     * @param id - 要删除的节点ID
     * @returns 无返回值
     */
    removeTree(id: string): Promise<void>;

    /**
     * 搜索书签
     * @param query - 搜索查询条件，可以是字符串或包含搜索参数的对象
     * @returns 返回匹配的书签节点数组
     */
    search(query: string | object): Promise<BookmarkTreeNode[]>;

    /**
     * 更新书签的属性
     * @param id - 要更新的书签ID
     * @param changes - 要更新的属性及其新值
     * @returns 返回更新后的书签节点
     */
    update(id: string, changes: object): Promise<BookmarkTreeNode>;
}

class MyBookmarks implements Bookmarks {
    async create(node: CreateDetails): Promise<BookmarkTreeNode> {
        const id = v7();
        const now = Date.now(); // 1000;
        const bookmark: BookmarkTreeNode = {
            id,
            parentId: node.parentId,
            index: node.index,
            title: node.title || 'untitled',
            url: node.url,
            type: node.type || 'bookmark',
            dateAdded: now,
            dateGroupModified: now,
        };
        await db.bookmarks.add(bookmark);
        return bookmark;
    }

    async get(idOrIdList: string | [string, ...string[]]): Promise<BookmarkTreeNode[]> {
        if (typeof idOrIdList === 'string') {
            const node = await db.bookmarks.get(idOrIdList);
            return node ? [node] : [];
        } else {
            return db.bookmarks.bulkGet(idOrIdList).then(results => results.filter((result): result is BookmarkTreeNode => result !== undefined));
        }
    }

    async getChildren(id: string): Promise<BookmarkTreeNode[]> {
        return db.bookmarks.where('parentId').equals(id).toArray();
    }

    async getRecent(numberOfItems: number): Promise<BookmarkTreeNode[]> {
        return db.bookmarks
            .where('dateLastUsed')
            .above(0)
            .reverse()
            .sortBy('dateLastUsed')
            .then((arr) => arr.slice(0, numberOfItems));
    }

    async getSubTree(id: string): Promise<BookmarkTreeNode[]> {
        const root = await db.bookmarks.get(id);
        if (!root) return [];
        const children = await this.getChildren(id);
        const subTree = await Promise.all(children.map((child) => this.getSubTree(child.id)));
        root.children = subTree.flat();
        return [root];
    }

    async getTree(): Promise<BookmarkTreeNode[]> {
        const all = await db.bookmarks.toArray();
        const map = new Map<string, BookmarkTreeNode>();
        all.forEach((node) => map.set(node.id, { ...node, children: [] }));
        const roots: BookmarkTreeNode[] = [];
        map.forEach((node) => {
            if (node.parentId && map.has(node.parentId)) {
                map.get(node.parentId)!.children!.push(node);
            } else {
                roots.push(node);
            }
        });
        return roots;
    }

    async move(
        id: string,
        destination: { parentId: string; index?: number }
    ): Promise<BookmarkTreeNode> {
        await db.bookmarks.update(id, { parentId: destination.parentId, index: destination.index });
        const node = await db.bookmarks.get(id);
        if (!node) throw new Error('Node not found');
        return node;
    }

    async remove(id: string): Promise<void> {
        await db.bookmarks.delete(id);
    }

    async removeTree(id: string): Promise<void> {
        const children = await this.getChildren(id);
        for (const child of children) {
            await this.removeTree(child.id);
        }
        await this.remove(id);
    }

    async search(query: string | object): Promise<BookmarkTreeNode[]> {
        if (typeof query === 'string') {
            return db.bookmarks
                .filter(
                    (node) => node.title.includes(query) || (node.url && node.url.includes(query))
                )
                .toArray();
        } else {
            // 简单对象条件匹配
            return db.bookmarks
                .filter((node) => {
                    return Object.entries(query).every(
                        ([key, value]) => (node as any)[key] === value
                    );
                })
                .toArray();
        }
    }

    async update(id: string, changes: object): Promise<BookmarkTreeNode> {
        await db.bookmarks.update(id, changes);
        const node = await db.bookmarks.get(id);
        if (!node) throw new Error('Node not found');
        return node;
    }
}
