import BinString from "../string/BinString";
import { ByteSegment } from "../string/ByteSegment";
import IBinIntByte from "./IBinIntByte";

export default class BinInt {


    /**
     * Получает код числа для записи в битстрим
     * @param int число код которого надо получить для записи в битстрим
     * @returns готовый бинарный код который подходит для записи в битстрим
     */
    public static getIntBytecode(int : number){
        let bBuff = int.toString(2);

        if(bBuff.length % 8 !== 0){
            /**
             * Если в двоичном коде не хватает нулей - докидываем их слева
             */
            bBuff = BinString.repeatTsString(8 - (bBuff.length % 8), "0") + bBuff;
        }

        /**
         * Получаем количество байт которое занимает число
         */
        let byteCount = bBuff.length / 8;
        if(byteCount > 4){
            /**
             * Протокол не может передавать числа больше 4 байт
             */
            throw new RangeError(`Trying to reserve ${byteCount}, than maximum allowed 4`);
        }

        /**
         * Эй я знаю что такое битовые маски, но я сделал так чтобы вам было проще читать эту хуйню <3
         */
        let controlBits = "0000";
        if(byteCount === 1){
            controlBits = "1000";
        }
        if(byteCount === 2){
            controlBits = "0100";
        }
        if(byteCount === 3){
            controlBits = "0010";
        }
        if(byteCount === 4){
            controlBits = "0001";
        }


        return controlBits + bBuff;
    }

    /**
     * Возвращает поток бинарных данных как 8 битные числа
     * @param bytecode бинарные данные
     * @returns массив 8 битных чисел
     */
    public static byteCodeToIntArray(bytecode : string) : number[] {
        return BinString.splitToBytes(bytecode, ByteSegment.B_8);
    }
    
    /**
     * Получает число по байткоду битстрима
     * @param bytecode байткод битстрима начиная с текущей точки чтения
     * @returns число из битстрима
     */
    public static readIntFromBytecode(bytecode : string) : IBinIntByte {
        /**
         * Читаем управляющие биты, и вычисляем длину числа которое нужно прочесть
         */
        let mask = bytecode.substring(0, 4);
        let byteLen = 0;
        if(mask === "1000"){
            byteLen = 1;
        }
        if(mask === "0100"){
            byteLen = 2;
        }
        if(mask === "0010"){
            byteLen = 3;
        }
        if(mask === "0001"){
            byteLen = 4;
        }
        /**
         * Получаем биты самого числа
         */
        let bitsInt = bytecode.substring(4, (byteLen*8)+4);
        /**
         * Получаем из двоичного кода числа само число, плюс смещение указателя чтения
         */
        return {
            int: parseInt(bitsInt, 2),
            pointerOffset: 4 + (byteLen * 8)
        };
    }
}