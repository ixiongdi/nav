// 书签树节点的类型
// - bookmark: 表示一个书签
// - folder: 表示一个文件夹
// - separator: 表示一个分隔符
type BookmarkTreeNodeType = 'bookmark' | 'folder' | 'separator';

// 书签树节点的不可修改状态
// - managed: 表示该节点被管理，不能被修改
type BookmarkTreeNodeUnmodifiable = 'managed';

// 文件夹的类型
// - bookmarks-bar: 书签栏
// - other: 其他书签
// - mobile: 移动设备书签
// - managed: 被管理的书签
type FolderType = 'bookmarks-bar' | 'other' | 'mobile' | 'managed';

// 创建书签时的配置选项接口
interface CreateDetails {
    parentId?: string; // 父节点ID
    index?: number; // 在父节点中的位置索引
    title?: string; // 书签标题
    url?: string; // 书签URL
    type?: BookmarkTreeNodeType; // 节点类型
}

// 书签树节点接口
interface BookmarkTreeNode {
    children?: BookmarkTreeNode[]; // 子节点数组，仅文件夹类型有此属性
    dateAdded?: number; // 添加日期的时间戳
    dateGroupModified?: number; // 组最后修改日期的时间戳
    id: string; // 节点唯一标识符
    index?: number; // 在父节点中的位置索引
    parentId?: string; // 父节点ID
    title: string; // 节点标题
    unmodifiable?: BookmarkTreeNodeUnmodifiable; // 节点是否可修改
    url?: string; // 书签URL，仅书签类型有此属性

    // Firefox特有字段
    type?: BookmarkTreeNodeType; // 节点类型

    // Chrome特有字段
    dateLastUsed?: number; // 最后使用日期的时间戳
    folderType?: FolderType; // 文件夹类型
    syncing?: boolean; // 是否正在同步
}

// 集中导出所有书签相关类型
export { type BookmarkTreeNode, type CreateDetails };
