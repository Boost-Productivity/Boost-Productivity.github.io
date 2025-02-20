export const isElectron = () => {
    return process.env.IS_ELECTRON === true;
};

export const getPlatform = () => {
    return isElectron() ? 'electron' : 'web';
}; 