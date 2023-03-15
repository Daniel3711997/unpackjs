/// <reference types="node" />

declare module '*.png';
declare module '*.svg';
declare module '*.jpg';
declare module '*.jpeg';

declare module '*.module.css' {
    const classes: { [key: string]: string };
    export default classes;
}

declare module '*.module.scss' {
    const classes: { [key: string]: string };
    export default classes;
}
