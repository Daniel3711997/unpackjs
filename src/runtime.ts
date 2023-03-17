export interface Server {
    [key: string]: unknown;
}

export interface Runtime {
    pluginURI: string;
    rest: {
        root: string;
        nonce: string;
    };
    ajax: {
        url: string;
        nonces: {
            [key: string]: string;
        };
    };
    forms: {
        url: string;
        nonces: {
            [key: string]: string;
        };
    };
    vars: {
        [key: string]: null | string;
    };
}
