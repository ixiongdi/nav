import type { BookmarkFile, BookmarkItem, BookmarkLink, BookmarkFolder } from '../types/bookmark';

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
 * 判断是否是文件夹项
 * @param dt DT元素
 * @returns 是否是文件夹
 */
function isFolderItem(dt: HTMLElement): boolean {
  return dt.querySelector('h3, H3') !== null;
}

/**
 * 判断是否是书签链接项
 * @param dt DT元素
 * @returns 是否是书签链接
 */
function isBookmarkLinkItem(dt: HTMLElement): boolean {
  return dt.querySelector('a') !== null;
}

/**
 * 解析DT元素为书签链接
 * @param dt DT元素
 * @returns BookmarkLink或null
 */
function parseBookmarkLink(dt: HTMLElement): BookmarkLink | null {
  const aElement = dt.querySelector('a');
  if (!aElement) return null;

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
  const icon = aElement.getAttribute('ICON') || aElement.getAttribute('icon');
  if (icon) {
    link.icon = icon.trim();
  }

  return link;
}

/**
 * 解析DT元素为文件夹
 * @param dt DT元素
 * @returns BookmarkFolder或null
 */
function parseFolder(dt: HTMLElement): BookmarkFolder | null {
  const h3Element = dt.querySelector('h3, H3');
  if (!h3Element) return null;

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

  // 查找后续的DL元素
  let nextElement = dt.nextElementSibling;
  if (nextElement) {
    for (const dt of nextElement.querySelectorAll('dt')) {
      folder.children.push(parseDtElement(dt as HTMLElement) as BookmarkItem);
    }
  }

  return folder;
}

/**
 * 解析DT元素为BookmarkItem
 * @param dt DT元素
 * @returns BookmarkItem或null
 */
function parseDtElement(dt: HTMLElement): BookmarkItem | null {
  // 首先判断是否是文件夹
  if (isFolderItem(dt)) {
    return parseFolder(dt);
  }
  // 然后判断是否是书签链接
  else if (isBookmarkLinkItem(dt)) {
    return parseBookmarkLink(dt);
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

  for (const dt of dl.querySelectorAll('dt')) {
    items.push(parseDtElement(dt as HTMLElement) as BookmarkItem);
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
  const doc = parser.parseFromString(html, 'text/html');

  console.log(doc);

  const result: BookmarkFile = {
    metadata: {
      title: '书签',
      rootName: '书签菜单',
    },
    bookmarks: [],
  };

  // 提取标题
  const titleElement = doc.querySelector('title');
  if (titleElement && titleElement.textContent) {
    result.metadata.title = titleElement.textContent.trim();
  }

  // 提取H1标签内容作为根名称
  const h1Element = doc.querySelector('h1, H1');
  if (h1Element && h1Element.textContent) {
    result.metadata.rootName = h1Element.textContent.trim();
  }

  // 查找第一个DL元素
  let dlElement = doc.querySelector('dl, DL');

  // 解析书签项
  if (dlElement) {
    result.bookmarks = parseDlElement(dlElement as HTMLElement);
  }

  return result;
}
