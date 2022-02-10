# ts-bitstream
BitStream (BS) используется для экономии данных, а так же для сериализации и десереализации данных передаваемых по сети или вообще где угодно (такой же bs использует сетевые движки RakNet, Netty)
ts```
import BitStream from "./bitstream/BitStream";
import AESSecure from "./bitstream/secure/AESSecure";
import { StringByteEncode } from "./bitstream/type/string/StringByteEncode";




let bs = new BitStream();
bs.writeBoolean(true); //запись булеана
bs.writeBoolean(true);
bs.writeBoolean(false);
bs.writeString("сука abcздарова пидарас", StringByteEncode.AUTOMATIC); //запись строки с автоматическим учетом длинны при чтении
bs.writeInt(4294967295); //запись числа 4294967295 (максимальное число вмещаемое в 4 байта)
bs.writeString("abc123", StringByteEncode.MANUALLY); //запись строки с ручным учетом длинны

console.info(bs.getBytes().asString()); //получить битстрим как строку

let bs2 = new BitStream(null, bs.getBytes().asString()); //читаем битстрим
console.info(bs2.readBoolean()); //читаем булеан
console.info(bs2.readBoolean());
console.info(bs2.readBoolean());
console.info(bs2.readString()); //читаем строку. при чтении не нужно указывать параметр так как применено StringByteEncode.AUTOMATIC при записи
console.info(bs2.readInt()); //читаем число
console.info(bs2.readString(6)); //читаем строку. обязательно нужно передать параметр ее длинны так как при записи был применен StringByteEncode.MANUALLY

```
