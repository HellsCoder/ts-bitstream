/**
 * Для получения всех указателей и переменных BS в одном обьекте
 */
export interface BitStreamState {
    /**
     * Текущий указатель чтения
     */
    readPointer : number;
    /**
     * Длинна BS в битах
     */
    bufferLengthBits : number;
    /**
     * Длинна BS в байтах
     */
    bufferLengthBytes : number;
    /**
     * Битовый поток
     */
    bitstream : string;
}