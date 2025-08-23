import type {
  BookmarkFile,
  BookmarkItem,
  BookmarkLink,
  BookmarkFolder,
  StoredBookmarkNode,
} from '../types/bookmark';

/**
 * 解析日期属性
 * @param dateStr 日期字符串
 * @returns Unix时间戳(秒)或undefined
 */
function parseDateAttribute(dateStr?: string): number | undefined {
  if (!dateStr) return undefined;
  const num = parseInt(dateStr, 10);
  return isNaN(num) ? undefined : num;
}

/**
 * 解析DT元素为BookmarkItem
 * @param dt DT元素
 * @returns BookmarkItem或null
 */
function parseDtElement(dt: HTMLElement): BookmarkItem | null {
  // 查找A标签 (链接)
  const aElement = dt.querySelector('a');
  if (aElement) {
    const link: BookmarkLink = {
      type: 'link',
      title: aElement.textContent?.trim() || '',
      href: aElement.getAttribute('href')?.trim() || '',
      addDate: parseDateAttribute(
        aElement.getAttribute('ADD_DATE') || aElement.getAttribute('add_date')
      ),
      lastModified: parseDateAttribute(
        aElement.getAttribute('LAST_MODIFIED') || aElement.getAttribute('last_modified')
      ),
    };

    // 处理图标
    const icon = aElement.getAttribute('icon');
    if (icon) {
      link.icon = icon.trim();
    }

    return link;
  }

  // 查找H3标签 (文件夹)
  const h3Element = dt.querySelector('h3');
  if (h3Element) {
    // 创建文件夹对象
    const folder: BookmarkFolder = {
      type: 'folder',
      title: h3Element.textContent?.trim() || '',
      addDate: parseDateAttribute(
        h3Element.getAttribute('ADD_DATE') || h3Element.getAttribute('add_date')
      ),
      lastModified: parseDateAttribute(
        h3Element.getAttribute('LAST_MODIFIED') || h3Element.getAttribute('last_modified')
      ),
      children: [],
    };

    // 查找后续的DD或DL元素
    let nextElement = dt.nextElementSibling;
    let subDl: HTMLElement | null = null;

    // 跳过p标签
    while (nextElement && nextElement.tagName.toLowerCase() === 'p') {
      nextElement = nextElement.nextElementSibling;
    }

    // 如果有DD元素，在其中查找DL
    if (nextElement && nextElement.tagName.toLowerCase() === 'dd') {
      subDl = nextElement.querySelector('dl');
      // 如果DD中没有DL，查找DD的下一个元素
      if (!subDl) {
        nextElement = nextElement.nextElementSibling;
      }
    }

    // 如果没有找到DL，继续查找下一个DL元素
    while (nextElement) {
      if (nextElement.tagName.toLowerCase() === 'dl') {
        subDl = nextElement as HTMLElement;
        break;
      }
      nextElement = nextElement.nextElementSibling;
    }

    // 如果找到DL，解析它
    if (subDl) {
      folder.children = parseDlElement(subDl);
    }

    return folder;
  }

  return null;
}

/**
 * 解析DL元素为BookmarkItem数组
 * @param dl DL元素
 * @returns BookmarkItem数组
 */
function parseDlElement(dl: HTMLElement): BookmarkItem[] {
  const items: BookmarkItem[] = [];
  let currentElement = dl.firstElementChild;

  while (currentElement) {
    // 处理p标签，它可能包含dt标签或紧跟在dl后面
    if (currentElement.tagName.toLowerCase() === 'p') {
      // 检查p标签内的所有dt标签
      const dtElements = currentElement.querySelectorAll('dt');
      dtElements.forEach((dt) => {
        const item = parseDtElement(dt as HTMLElement);
        if (item) {
          items.push(item);
        }
      });
    }
    // 直接处理dt标签
    else if (currentElement.tagName.toLowerCase() === 'dt') {
      const item = parseDtElement(currentElement as HTMLElement);
      if (item) {
        items.push(item);
      }
    }
    // 处理嵌套的dl标签（递归）
    else if (currentElement.tagName.toLowerCase() === 'dl') {
      const subItems = parseDlElement(currentElement as HTMLElement);
      items.push(...subItems);
    }

    currentElement = currentElement.nextElementSibling;
  }

  return items;
}

/**
 * 将HTML字符串转换为BookmarkFile对象
 * @param html HTML字符串
 * @returns 解析后的BookmarkFile对象
 */
export function parseHtmlToBookmarkFile(html: string): BookmarkFile {
  // 创建一个临时DOM元素来解析HTML
  const parser = new DOMParser();
  // 处理HTML中可能存在的转义字符和多余空格
  const cleanedHtml = html.replace(/`/g, '').trim();
  const doc = parser.parseFromString(cleanedHtml, 'text/html');

  const result: BookmarkFile = {
    metadata: {
      title: '书签',
      rootName: '书签菜单',
    },
    bookmarks: [],
  };

  // 提取标题
  const titleElement = doc.querySelector('title');
  if (titleElement) {
    result.metadata!.title = titleElement.textContent?.trim() || '书签';
  }

  // 提取根名称 (通常在H1标签中)
  const h1Element = doc.querySelector('h1');
  if (h1Element) {
    result.metadata!.rootName = h1Element.textContent?.trim() || '书签菜单';
  }

  // 找到第一个DL元素作为书签列表的根
  const rootDl = doc.querySelector('dl');
  if (rootDl) {
    result.bookmarks = parseDlElement(rootDl);
  }

  return result;
}

// 为浏览器环境外的测试提供DOMParser替代
if (typeof window === 'undefined') {
  // @ts-ignore
  global.DOMParser = require('xmldom').DOMParser;
}

/**
 * 将BookmarkFile转换为StoredBookmarkNode数组
 * @param bookmarkFile BookmarkFile对象
 * @returns StoredBookmarkNode数组
 */
export function convertToStoredBookmarkNodes(bookmarkFile: BookmarkFile): StoredBookmarkNode[] {
  const result: StoredBookmarkNode[] = [];

  // 处理根节点下的所有项
  bookmarkFile.bookmarks.forEach((item, index) => {
    processBookmarkItem(item, null, index, result);
  });

  return result;
}

/**
 * 递归处理BookmarkItem，将其转换为StoredBookmarkNode并添加到结果数组
 * @param item 要处理的BookmarkItem
 * @param parentId 父节点ID
 * @param index 在父节点中的索引
 * @param result 结果数组
 * @returns 生成的节点ID
 */
function processBookmarkItem(
  item: BookmarkItem,
  parentId: string | null,
  index: number,
  result: StoredBookmarkNode[]
): string {
  // 生成唯一ID
  const id = generateUniqueId();

  // 基础节点信息
  const baseNode: StoredBookmarkNode = {
    id,
    type: item.type,
    title: item.title.trim(),
    parentId,
    index,
    addDate: item.addDate || Math.floor(Date.now() / 1000),
    lastModified: item.lastModified || Math.floor(Date.now() / 1000),
  };

  // 根据节点类型添加特定字段
  if (item.type === 'link') {
    const linkItem = item as BookmarkLink;
    baseNode.url = linkItem.href;
    baseNode.icon = linkItem.icon;
  } else if (item.type === 'folder') {
    const folderItem = item as BookmarkFolder;
    // 处理子节点
    folderItem.children.forEach((child, childIndex) => {
      processBookmarkItem(child, id, childIndex, result);
    });
  }

  // 添加到结果数组
  result.push(baseNode);
  return id;
}

/**
 * 生成唯一ID
 * @returns 唯一ID字符串
 */
// 首先在文件顶部导入 uuid v7 函数
import { v7 as uuidv7 } from 'uuid';
import type { ViewBookmarkNode } from '../types/bookmark';

/**
 * 生成唯一ID
 * @returns 唯一ID字符串
 */
function generateUniqueId(): string {
  // 使用UUID v7生成唯一ID
  return uuidv7();
}

/**
 * 将 StoredBookmarkNode 数组转换为 ViewBookmarkNode 树结构
 * @param nodes StoredBookmarkNode 数组
 * @returns ViewBookmarkNode 树结构数组（根节点）
 */
export function convertToViewBookmarkNodes(nodes: StoredBookmarkNode[]): ViewBookmarkNode[] {
  // 创建节点映射表，便于快速查找
  const nodeMap = new Map<string, ViewBookmarkNode>();
  const rootNodes: ViewBookmarkNode[] = [];

  // 第一步：将所有节点转换为 ViewBookmarkNode 并添加到映射表
  for (const node of nodes) {
    const viewNode: ViewBookmarkNode = {
      ...node,
      children: [], // 初始化 children 数组
    };
    nodeMap.set(node.id, viewNode);

    // 识别根节点（parentId 为 null）
    if (node.parentId === null) {
      rootNodes.push(viewNode);
    }
  }

  // 第二步：构建树结构，将子节点添加到父节点
  for (const node of nodes) {
    if (node.parentId !== null) {
      const parentNode = nodeMap.get(node.parentId);
      if (parentNode) {
        // 找到对应的子节点
        const childNode = nodeMap.get(node.id);
        if (childNode) {
          // 按 index 排序插入
          parentNode.children?.splice(node.index, 0, childNode);
        }
      }
    }
  }

  return rootNodes;
}

/**
 * 将 StoredBookmarkNode 数组转换为 Netscape 书签格式的 HTML
 * @param nodes StoredBookmarkNode 数组
 * @param options 可选配置项
 * @returns HTML 字符串
 */
export function convertToHtml(
  nodes: StoredBookmarkNode[],
  options: { title?: string; rootName?: string } = {}
): string {
  // 转换为树结构
  const viewNodes = convertToViewBookmarkNodes(nodes);
  const { title = '书签', rootName = '书签菜单' } = options;

  // 生成 HTML 头部
  const htmlHeader = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>${title}</TITLE>
<H1>${rootName}</H1>`;

  // 生成书签内容
  const bookmarksContent = generateBookmarkHtml(viewNodes);

  // 组合完整 HTML
  return `${htmlHeader}
<DL><p>
${bookmarksContent}
</DL><p>`;
}

/**
 * 递归生成书签 HTML 内容
 * @param nodes ViewBookmarkNode 数组
 * @returns HTML 字符串
 */
function generateBookmarkHtml(nodes: ViewBookmarkNode[]): string {
  let html = '';

  for (const node of nodes) {
    if (node.type === 'folder') {
      // 处理文件夹
      html += `<DT><H3${formatDateTimeAttributes(node)}>${node.title}</H3>
`;
      if (node.children && node.children.length > 0) {
        html += `<DL><p>
${generateBookmarkHtml(node.children)}
</DL><p>
`;
      }
    } else if (node.type === 'link') {
      // 处理链接
      const url = node.url || '';
      html += `<DT><A HREF="${url}"${formatDateTimeAttributes(node)}${node.icon ? ` ICON="${node.icon}"` : ''}>${node.title}</A>
`;
    }
  }

  return html;
}

/**
 * 格式化时间戳属性
 * @param node 书签节点
 * @returns 包含时间戳属性的字符串
 */
function formatDateTimeAttributes(node: ViewBookmarkNode): string {
  const attributes: string[] = [];

  if (node.addDate) {
    attributes.push(` ADD_DATE="${node.addDate}"`);
  }

  if (node.lastModified) {
    attributes.push(` LAST_MODIFIED="${node.lastModified}"`);
  }

  return attributes.join('');
}
