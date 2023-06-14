import axios from 'axios';

export const client = axios.create({
    baseURL: 'https://google.com',
});

export const setupClient = (token: string) => {
    const interceptor = client.interceptors.request.use(config => {
        config.headers.Authorization = `Bearer ${token}`;

        return config;
    });

    return () => {
        client.interceptors.request.eject(interceptor);
    };
};
