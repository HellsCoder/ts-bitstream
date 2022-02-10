/**
 * ByteAssociation задает возможные представления буфера байт в BS
 */

import AESSecure from "../secure/AESSecure";
import BinInt from "../type/int/BinInt";
import BinString from "../type/string/BinString";

export default class ByteAssocition {

    private byteBuffer : string;
    private aesSecure : AESSecure;

    constructor(byteBuffer : string, aes? : AESSecure){
        this.byteBuffer = byteBuffer;
        if(aes){
            this.aesSecure = aes;
        }
    }

    /**
     * Представить битовый буфер в виде строки
     * @returns представление байт в виде строки
     */
    public asString(){
        
        if(this.byteBuffer.length % 8 !== 0){
            /**
             * Если бит в буфере не хватает не хватает - докидываем нули в конце
             */
            let buff = BinString.binToString(this.byteBuffer + BinString.repeatTsString(8 - (this.byteBuffer.length % 8), "0"));
            if(this.aesSecure && this.aesSecure.isSecured()){
                buff = this.aesSecure.encode(buff);
            } 
            return buff;
        }
        let buff = BinString.binToString(this.byteBuffer);
        if(this.aesSecure && this.aesSecure.isSecured()){
            buff = this.aesSecure.encode(buff);
        } 
        return buff;
    }

    /**
     * Представить битовый буфер в виде чисел
     * @returns представление байт в виде чисел
     */
    public asNumbers(){
        if(this.byteBuffer.length % 8 !== 0){
            return BinInt.byteCodeToIntArray(this.byteBuffer + BinString.repeatTsString(8 - (this.byteBuffer.length % 8), "0"));
        }
        return BinInt.byteCodeToIntArray(this.byteBuffer);
    }

}