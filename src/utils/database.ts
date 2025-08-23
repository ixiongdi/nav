import Dexie from 'dexie';
import type { Table } from 'dexie';
import type { StoredBookmarkNode } from '../types/bookmark';
import type { ViewBookmarkNode } from '../types/bookmark';

// 创建数据库类
class BookmarkDatabase extends Dexie {
  // 定义表
  bookmarks!: Table<StoredBookmarkNode, string>;

  constructor() {
    super('MyNavBookmarks');
    this.version(1).stores({
      bookmarks: 'id, parentId, type, index', // 主键和索引
    });
  }
}

// 实例化数据库
const db = new BookmarkDatabase();

/**
 * 增加书签节点
 * @param node 要添加的书签节点
 * @returns 添加后的节点
 */
async function addBookmarkNode(node: StoredBookmarkNode): Promise<StoredBookmarkNode> {
  await db.bookmarks.add(node);
  return node;
}

/**
 * 根据 ID 查询书签节点
 * @param id 节点 ID
 * @returns 找到的节点或 undefined
 */
async function getBookmarkNodeById(id: string): Promise<StoredBookmarkNode | undefined> {
  return db.bookmarks.get(id);
}

/**
 * 查询所有书签节点
 * @returns 所有节点的数组
 */
async function getAllBookmarkNodes(): Promise<StoredBookmarkNode[]> {
  return db.bookmarks.toArray();
}

/**
 * 根据父节点 ID 查询子节点
 * @param parentId 父节点 ID
 * @returns 子节点数组
 */
async function getBookmarkNodesByParentId(parentId: string | null): Promise<StoredBookmarkNode[]> {
  if (parentId === null) {
    // 查询 parentId 为 null 的节点（顶级节点）
    return db.bookmarks.toArray();
  } else {
    // 正常查询
    return db.bookmarks.where('parentId').equals(parentId).sortBy('index');
  }
}

/**
 * 更新书签节点
 * @param node 要更新的节点（必须包含 id）
 * @returns 更新后的节点
 */
async function updateBookmarkNode(node: StoredBookmarkNode): Promise<StoredBookmarkNode> {
  await db.bookmarks.put(node);
  return node;
}

/**
 * 删除书签节点
 * @param id 要删除的节点 ID
 * @returns 是否删除成功
 */
async function deleteBookmarkNode(id: string): Promise<void> {
  return await db.bookmarks.delete(id); // 如果删除了1条记录，则返回true
}

/**
 * 删除所有书签节点
 * @returns 是否删除成功
 */
async function deleteAllBookmarkNodes(): Promise<void> {
  return await db.bookmarks.clear();
}

/**
 * 获取带层级结构的书签树
 * @param parentId 父节点 ID，默认为 null（根节点）
 * @returns 带层级结构的书签节点
 */
async function getBookmarkTree(parentId: string | null = null): Promise<ViewBookmarkNode[]> {
  // 查询父节点为parentId的所有节点，并按index排序
  const nodes = await getBookmarkNodesByParentId(parentId);

  // 递归构建树结构
  const treeNodes: ViewBookmarkNode[] = [];
  for (const node of nodes) {
    const treeNode: ViewBookmarkNode = { ...node };

    // 如果是文件夹，则递归获取其子节点
    if (node.type === 'folder') {
      treeNode.children = await getBookmarkTree(node.id);
    }

    treeNodes.push(treeNode);
  }

  return treeNodes;
}

export {
  getBookmarkTree,
  addBookmarkNode,
  getBookmarkNodeById,
  getAllBookmarkNodes,
  getBookmarkNodesByParentId,
  updateBookmarkNode,
  deleteBookmarkNode,
  deleteAllBookmarkNodes,
};
