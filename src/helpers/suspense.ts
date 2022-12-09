export const loadSuspense = () => {
    setTimeout(() => {
        const frameworkLoader = document.querySelectorAll('.framework-loader');

        if (frameworkLoader.length) {
            frameworkLoader.forEach(loader => {
                loader.classList.add('active');
            });
        }
    }, 250);
};
