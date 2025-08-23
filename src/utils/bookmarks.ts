import type { BookmarkTreeNode, CreateDetails } from '../types/bookmark';
import Dexie from 'dexie';

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
  private db: Dexie;

  constructor() {
    // 初始化数据库
    this.db = new Dexie('MyBookmarks');
    this.db.version(1).stores({
      bookmarks: 'id, parentId, title, type', // 定义索引字段
    });
  }

  async create(node: CreateDetails): Promise<BookmarkTreeNode> {
    // 实现创建书签的逻辑
    return {} as BookmarkTreeNode;
  }

  async get(idOrIdList: string | [string, ...string[]]): Promise<BookmarkTreeNode[]> {
    // 实现获取书签的逻辑
    return [];
  }

  async getChildren(id: string): Promise<BookmarkTreeNode[]> {
    // 实现获取子节点的逻辑
    return [];
  }

  async getRecent(numberOfItems: number): Promise<BookmarkTreeNode[]> {
    // 实现获取最近使用书签的逻辑
    return [];
  }

  async getSubTree(id: string): Promise<BookmarkTreeNode[]> {
    // 实现获取子树的逻辑
    return [];
  }

  async getTree(): Promise<BookmarkTreeNode[]> {
    // 实现获取整个书签树的逻辑
    return [];
  }

  async move(id: string, destination: object): Promise<BookmarkTreeNode> {
    // 实现移动书签的逻辑
    return {} as BookmarkTreeNode;
  }

  async remove(id: string): Promise<void> {
    // 实现删除书签的逻辑
  }

  async removeTree(id: string): Promise<void> {
    // 实现删除子树的逻辑
  }

  async search(query: string | object): Promise<BookmarkTreeNode[]> {
    // 实现搜索书签的逻辑
    return [];
  }

  async update(id: string, changes: object): Promise<BookmarkTreeNode> {
    // 实现更新书签属性的逻辑
    return {} as BookmarkTreeNode;
  }
}
