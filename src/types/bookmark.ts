/**
 * 表示一个书签条目（可以是链接或文件夹）
 */
interface BookmarkNode {
  // 公共字段
  addDate?: number; // ADD_DATE: Unix 时间戳（秒）
  lastModified?: number; // LAST_MODIFIED: Unix 时间戳（秒）
  type: 'link' | 'folder'; // 节点类型
  title: string; // 标题（链接显示标题或文件夹名称）
}

/**
 * 书签链接（URL）
 */
interface BookmarkLink extends BookmarkNode {
  href: string; // 网址
  icon?: string; // 可选：favicon 的 base64 数据（如 data:image/png;base64,...）
}

/**
 * 书签文件夹
 */
interface BookmarkFolder extends BookmarkNode {
  children: BookmarkItem[]; // 子节点列表（链接或子文件夹）
}

/**
 * 书签项的联合类型
 */
type BookmarkItem = BookmarkLink | BookmarkFolder;

/**
 * 整个书签文件的根结构
 */
interface BookmarkFile {
  // DOCTYPE 标识（虽然不是内容，但可用于验证）
  // 实际解析时通常忽略，但可以保留元信息
  metadata: {
    title: string; // <TITLE> 标签内容，默认为 "书签"
    rootName: string; // <H1> 标签内容，如 "书签菜单"
  };

  // 根节点列表（通常是一个 DL 列表下的所有 DT 项）
  bookmarks: BookmarkItem[];
}

/**
 * 存储在 IndexedDB 中的书签节点
 */
interface StoredBookmarkNode {
  // 主键：唯一标识符（推荐使用字符串 ID）
  id: string;

  // 节点类型
  type: 'link' | 'folder';

  // 基本信息
  title: string;
  parentId: string | null; // 指向父文件夹的 id；根节点为 null

  // 排序用：在父节点中的位置
  index: number;

  // 链接特有字段
  url?: string; // 仅 type === 'link' 时存在

  // 图标（可选）
  icon?: string; // base64 图标数据

  // 时间戳（秒）
  addDate: number;
  lastModified: number;

  // 可选：用于全文搜索的标签
  tags?: string[];
}

/**
 * 存储在 IndexedDB 中的书签节点
 */
interface ViewBookmarkNode extends StoredBookmarkNode {
  children?: ViewBookmarkNode[];
}

interface BookmarkTreeNode {
  children?: BookmarkTreeNode[];
  dateAdded?: number;
  dateGroupModified?: number;
  dateLastUsed?: number;
  index?: number;
  folderType?: 'bookmarks-bar' | 'other' | 'mobile' | 'managed';
  parentId?: string;
  title: string;
  url: string;
  unmodifiable?: 'managed';
  id: string;
  syncing: boolean;
}

// 集中导出所有书签相关类型
export {
  type BookmarkNode,
  type BookmarkLink,
  type BookmarkFolder,
  type BookmarkItem,
  type BookmarkFile,
  type StoredBookmarkNode,
  type ViewBookmarkNode,
  type BookmarkTreeNode,
};
