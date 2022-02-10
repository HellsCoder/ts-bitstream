import { ByteSegment } from "./ByteSegment";

/**
 * Для помощи BitStream работать со строками
 */
export default class BinString {
    
    /**
     * Переводит бинарные данные(нули и единицы те самые да) в строку
     * @param binarry бинарные данные
     * @param segment сколько бит используется на символ
     * @returns строка из бинарных данных
     */
    public static binToString(binarry : string, segment : ByteSegment = ByteSegment.B_8) : string {
        let byteArray = this.splitToBytes(binarry, segment);
        let strBuff = "";
        for(let i = 0; i < byteArray.length; i++){
            strBuff += String.fromCharCode(byteArray[i]);
        }
        return strBuff;
    }

    /**
     * Повторяет символ указанное количество раз
     * @param num число повторений
     * @param str повторяемый символ
     * @returns строка символов
     */
    public static repeatTsString(num : number, str : string){
        return new Array(num + 1).join(str);
    }

    /**
     * Переводит строку в бинарные данные
     * @param string строка для перевода
     * @param segment параметр сегментации символов
     * @returns бинарные данные
     */
    public static strBinary(string : string, segment : ByteSegment = ByteSegment.B_8) : string {
        let binBuff : string = ""
        for(let i = 0; i < string.length; i++){
            let sByte = string.charCodeAt(i).toString(2);
            if(sByte.length % 8 !== 0){
                sByte = this.repeatTsString(8 - (sByte.length % 8), "0") + sByte;
            }
            if(sByte.length <= 8 && segment == ByteSegment.B_16){
                sByte = "00000000" + this.repeatTsString(8 - sByte.length, "0") + sByte;
            }

            binBuff += sByte;
            
        }
        return binBuff;
    }

    /**
     * Разбивает бинарные данные по 8 бит и строит из них хуйпоймичто байты
     * @param bin бинарные данные
     * @returns массив байт
     */
    public static splitToBytes(bin: string, segment : ByteSegment) {
        let stringBytes : string[] = this.stringSegmentation(bin, segment);
        let byteArray : number[] = []; 
        for(let i = 0; i < stringBytes.length; i++){
            byteArray.push(parseInt(stringBytes[i], 2));
        }
        return byteArray;
    }

    /**
     * Разделяет строку
     * @param source исходная строка
     * @param segmentLength по сколько символов ее резать
     * @returns массив string[] содержащий сегменты по segmentLength символов из source строки 
     */
    public static stringSegmentation(source : string, segmentLength : number) : string[] {
        const chunkArr = [];
        let leftStr = source;
        while (leftStr.length > 0){
            chunkArr.push(leftStr.substring(0, segmentLength));
            leftStr = leftStr.substring(segmentLength, leftStr.length);
        }
        return chunkArr;
    }

}