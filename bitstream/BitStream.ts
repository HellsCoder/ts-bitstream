import ByteAssocition from "./byte/ByteAssociation";
import AESSecure from "./secure/AESSecure";
import { BitStreamState } from "./state/BitStreamState";
import BinInt from "./type/int/BinInt";
import IBinIntByte from "./type/int/IBinIntByte";
import BinString from "./type/string/BinString";
import { ByteSegment } from "./type/string/ByteSegment";
import { StringByteEncode } from "./type/string/StringByteEncode";


/**
 * BitStream (BS) используется для экономии данных, а так же для сериализации и десереализации данных передаваемых по сети или вообще где угодно (такой же bs использует сетевые движки RakNet, Netty)
 */
export default class BitStream {


    /**
     * Общий поток бит в виде строки
     */
    private stringByteBuffer : string;

    /**
     * Указатели чтения
     */
    private readPointer : number;
    

    private aesSecure : AESSecure;

    /**
     * Конструктор битстрима, можно ничего не передавать если битстрим только для записи, 
     * или передать праметры для чтения если нужно его прочитать/дозаписать
     * @param aesSecure AES шифрование. Передать null если шифрование отсутствует 
     * @param stream поток бит для чтения, можно ничего не передавать если битстрим только для записи
     */
    constructor(aesSecure? : AESSecure, stream : string = ""){
        if(aesSecure && aesSecure.isSecured()){
            stream = aesSecure.decode(stream);
        }
        if(aesSecure){
            this.aesSecure = aesSecure;
        }
        this.stringByteBuffer = BinString.strBinary(stream);
        this.readPointer = 0;
    }

    
    /**
     * Устанавливает шифрование на битстрим
     * @param aesSecure шифрование
     */
    public setAes(aesSecure : AESSecure){
        this.aesSecure = aesSecure;
    }

    /**
     * Запись boolean в bs
     * @param bool булева переменная для записи
     * @returns BitStream
     */
    public writeBoolean(bool : boolean) : BitStream {
        this.stringByteBuffer += bool ? "1" : "0";
        return this;
    }

    /**
     * Чтение boolean из bs
     * @returns булева переменная
     */
    public readBoolean() : boolean {
        if(this.stringByteBuffer[this.readPointer] == "0"){
            this.readPointer += 1;
            return false;
        }
        this.readPointer +=1;
        return true;
    }

    /**
     * Запись string в bs
     * @param str строка, которую необходимо записать
     * @param mode не обязательный парметр, если передать StringByteEncode.AUTOMATIC, то при чтении строки не нужно будет знать ее длинну, она прочитается в автоматическом режиме. В таком случае строка будет занимать больше места
     * @returns BitStream 
     */
    public writeString(str : string, mode : StringByteEncode = StringByteEncode.MANUALLY) : BitStream {
        let bin : string = BinString.strBinary(str);
        if(bin.length / 8 > str.length){
            /**
             * Если байт больше чем символов в строке - значит используется двухбайтовая кодировка, включаем управляющий бит
             */
            this.writeBoolean(true);
            bin = BinString.strBinary(str, ByteSegment.B_16);
        }else{
            this.writeBoolean(false);
        }
        if(mode === StringByteEncode.AUTOMATIC){
            this.writeInt(bin.length / 8);
        }
        this.stringByteBuffer += bin;
        return this;
    }

    /**
     * Читение string из bs
     * @param len длинна читаемой строки, не передавать для строк записанных по принципу StringByteEncode.AUTOMATIC
     * @returns прочитанная строка
     */
    public readString(len : number = 0) : string {
        let segmentation : ByteSegment = this.readBoolean() ? ByteSegment.B_16 : ByteSegment.B_8;
        if(len === 0){
            /**
             * Если длинна ноль пытаемся считать длинну автоматически, если при этом при записи строки не был выбран режим StringByteEncode.AUTOMATIC это может привести к сходу земли с орбиты
             */
            len = this.readInt();
        }
        let bitsToRead = len * 8;
        let bits = this.readBits(bitsToRead);
        //this.readPointer += bitsToRead;
        return BinString.binToString(bits, segmentation);
    }

    /**
     * Чтения int из bs
     * @returns прочитанное число
     */
    public readInt() : number {
        let intByte : IBinIntByte = BinInt.readIntFromBytecode(this.stringByteBuffer.substring(this.readPointer));
        this.readPointer += intByte.pointerOffset;
        return intByte.int;
    }

    /**
     * Запись int в bs
     * @param int число которое нужно записать
     * @returns BitStream
     */
    public writeInt(int : number) : BitStream {
        let bin : string = BinInt.getIntBytecode(int);
        this.stringByteBuffer += bin;
        return this;
    }

    /**
     * Функция для получения результата работы bs
     * @returns байты записанные в bs в любом виде
     */
    public getBytes() : ByteAssocition {
        return new ByteAssocition(this.stringByteBuffer, this.aesSecure);
    }

    /**
     * Возвращает длинну bs в байтах
     * @returns длинна bs в байтах
     */
    public getByteLength() : number {
        return (this.stringByteBuffer.length + (this.stringByteBuffer.length % 8)) / 8;
    } 

    /**
     * Получить статус bs
     * @returns BitStreamState статус bs
     */
    public getBitStreamState() : BitStreamState {
        return {
            readPointer: this.readPointer,
            bufferLengthBytes: this.getByteLength(),
            bufferLengthBits: this.getByteLength() * 8,
            bitstream: this.stringByteBuffer
        };
    }

    /**
     * Читает биты и смещает указатель чтения, служебная функция для BS
     * @param len количество бит для чтения
     * @returns прочитанные биты
     */
    private readBits(len : number){
        let bitBuff = "";
        if(this.readPointer + len > this.stringByteBuffer.length){
            /**
             * Если пытаются прочитать больше байт чем доступно(выходят за границы текущего bs)
             */
            throw new RangeError(`Read bits error. Trying to read ${len} bits, than maximum allowed ${this.stringByteBuffer.length - this.readPointer}`);
        }
        for(let i = 0; i < len; i++){
            bitBuff += this.stringByteBuffer[this.readPointer];
            this.readPointer++;
        }
        return bitBuff;
    }

}