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

export class MenuItemSimple extends MenuItem {
    path?: string;
    icon?: string = null;
    constructor(title: string, path: string, icon: string) {
        super(title, MenuItemType.ITEM);
        this.path = path;
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