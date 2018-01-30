import {utils, write, read} from 'xlsx';
import FileSaver from 'file-saver';
import _ from 'lodash';

const {json_to_sheet, table_to_sheet} = utils;

/**
 *  通过json数组导出模板
 */
const jsonToSheet = (datas, options) => {
    const opts = Object.assign({}, options, {style: 'json'});
    toSheet(datas, opts);
};

/**
 *　通过table导出模板
 */
const tableToSheet = (datas, options) => {
    const opts = Object.assign({}, options, {style: 'table'});
    toSheet(datas, opts);
};

/**
 * 导入excel,解析excel文档转换为json
 */
const sheetToJson = (file) => {
    return new Promise((resolve, reject) => {
            const reader = new FileReader();
    reader.readAsBinaryString(file);

    //读取文件成功后执行
    reader.onload = (data) => {
        const binary = data.target.result;
        const wb = read(binary, {type: 'binary'});
        let res = [];
        //通过wb.SheetNames数组遍历，返回有序json数组
        _.each(wb.SheetNames, (name) => {
            const data = utils.sheet_to_json(wb.Sheets[name], {header:1});
        //去掉最后为空的数组
        const list = _([...data]).reverse().value();
        let lastNullNum = 0;
        _.find(list, (l) => {
            if (l.length === 0) {
            lastNullNum++;
        }
        return l.length !== 0;
    });

        res.push({[name]: _.slice(data, 0, data.length-lastNullNum)});
    });

        resolve(res);
    };

    reader.onerror = reject;
}
);
};

//字符串转字符流
function s2ab(s) {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);

    for (let i = 0; i !== s.length; ++i) {
        view[i] = s.charCodeAt(i) & 0xFF;
    }

    return buf;
}

/**
 * 模板导出逻辑处理，暂时只支持json和table两种格式导出
 * @param datas　数据源数组，数组元素包含导出每页数据，可能为多个[data1, data2]
 * @param opts　配置选项，包含文件名如"test.xlsx"，导出每页数据的名称['sheet1', 'sheet2],
 */
function toSheet(datas, opts) {
    const {fileName = 'download', SheetNames = [], style = 'json', writeOptions = {}} = opts;

    //处理多个sheet
    let Sheets = {}, sNames = [];
    _.each(datas, (data, index) => {
        const sheetName = SheetNames[index] ? SheetNames[index]: ('sheet'+ index); //如果没有传名字，则给默认名字
    Sheets[sheetName] = (style==='json') ? json_to_sheet(data) : table_to_sheet(data);
    sNames.push(sheetName);
});

    const ws = write({SheetNames: sNames, Sheets: Sheets}, {bookType: 'xlsx', type: 'binary'});

    const wsblob = new Blob([s2ab(ws)], {type: 'application/octet-stream'}); //创建二进制对象写入转换好的字节流
    FileSaver.saveAs(wsblob, fileName);
}

export {
    jsonToSheet,
    tableToSheet,
    sheetToJson
};