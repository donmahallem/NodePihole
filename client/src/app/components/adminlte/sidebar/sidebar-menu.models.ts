export enum MenuItemType {
    TREEITEM = 1,
    ITEM = 2,
    HEADER = 3
}

export class MenuItem {
    title: string;
    type: MenuItemType;

    constructor(title: string, type: MenuItemType) {
        this.title = title;
        this.type = type;
    }
}

export class MenuItemPath {
    path: string;
    queryParams?: Object;

    constructor(path: string, queryParams?: Object) {
        this.path = path;
        this.queryParams = queryParams;
    }
}

export class MenuItemSimple extends MenuItem {
    path: MenuItemPath;
    icon?: string = null;
    constructor(title: string, path: string | MenuItemPath, icon: string) {
        super(title, MenuItemType.ITEM);
        if (typeof path === "string") {
            this.path = new MenuItemPath(path);
        } else {
            this.path = path;
        }
        this.icon = icon;
    }
}

export class MenuItemTree extends MenuItem {
    children: Array<MenuItem>;
    icon: string = null;
    constructor(title: string, icon: string) {
        super(title, MenuItemType.TREEITEM);
        this.icon = icon;
        this.children = [];
    }

    public add(menuitem: MenuItem): MenuItemTree {
        this.children.push(menuitem);
        return this;
    }
}

export class MenuItemHeader extends MenuItem {
    constructor(title: string) {
        super(title, MenuItemType.HEADER);
    }
}