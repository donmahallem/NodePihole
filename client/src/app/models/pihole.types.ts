interface MenuItem {
    path: string;
    title: string;
    children?: Array<MenuItem>;
    icon?: string = null;
}


export { MenuItem };