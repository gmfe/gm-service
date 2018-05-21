// 12 -> SC000012 1232131 ->SC1232131
const idConvert2Show = (id, prefix) => {
    let convertId = window.parseInt(id, 10);
    if (convertId > 1000000) {
        return prefix + convertId;
    } else {
        return prefix + (1000000 + convertId + '').slice(1);
    }
};

export {
    idConvert2Show
};