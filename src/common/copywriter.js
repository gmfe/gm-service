// 根据有没有查看税率权限get_tax，判断显示什么文案
function copywriterByTaxRate(notax, hastax) {
    if( viewTaxRate ) {
        return hastax;
    }
    return notax;
}

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
    copywriterByTaxRate,
    idConvert2Show
};