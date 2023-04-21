export type Styles = {
    black: string;
    white: string;
};

export type ClassNames = keyof Styles;

declare const styles: Styles;

export default styles;
