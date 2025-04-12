export enum PacketField {
    LONG,
    INT,
    SHORT,
    BYTE,
    FLOAT,
    DOUBLE,
    BYTES,
    STRING,
}

export class Packet {
    public static readonly PACKETS: Packet[] = new Array(256)
    
    public static readonly LOGIN: Packet = new Packet(0x00, PacketField.BYTE, PacketField.STRING, PacketField.STRING, PacketField.BYTE)
    public static readonly KEEP_ALIVE: Packet = new Packet(0x01)
    public static readonly LEVEL_INIT: Packet = new Packet(0x02)
    public static readonly LEVEL_DATA: Packet = new Packet(0x03, PacketField.SHORT, PacketField.BYTES, PacketField.BYTE)
    public static readonly LEVEL_FIN: Packet = new Packet(0x04, PacketField.SHORT, PacketField.SHORT, PacketField.SHORT)
    public static readonly PLAYER_ACTION: Packet = new Packet(0x05, PacketField.SHORT, PacketField.SHORT, PacketField.SHORT, PacketField.BYTE, PacketField.BYTE)
    public static readonly TILE_UPDATE: Packet = new Packet(0x06, PacketField.SHORT, PacketField.SHORT, PacketField.SHORT)
    public static readonly ADD_PLAYER: Packet = new Packet(0x07, PacketField.BYTE, PacketField.STRING, PacketField.SHORT, PacketField.SHORT, PacketField.SHORT, PacketField.BYTE, PacketField.BYTE)
    public static readonly PLAYER_ABS_POS_ROT: Packet = new Packet(0x08, PacketField.BYTE, PacketField.SHORT, PacketField.SHORT, PacketField.SHORT, PacketField.BYTE, PacketField.BYTE)
    public static readonly PLAYER_DELTA_POS_ROT: Packet = new Packet(0x09, PacketField.BYTE, PacketField.BYTE, PacketField.BYTE, PacketField.BYTE, PacketField.BYTE, PacketField.BYTE)
    public static readonly PLAYER_DELTA_POS: Packet = new Packet(0x0A, PacketField.BYTE, PacketField.BYTE, PacketField.BYTE, PacketField.BYTE)
    public static readonly PLAYER_DELTA_ROT: Packet = new Packet(0x0B, PacketField.BYTE, PacketField.BYTE, PacketField.BYTE)
    public static readonly REMOVE_PLAYER: Packet = new Packet(0x0C, PacketField.BYTE)
    public static readonly CHAT: Packet = new Packet(0x0D, PacketField.BYTE, PacketField.STRING)
    public static readonly DISCONNECT: Packet = new Packet(0x0E, PacketField.STRING)
    public static readonly SET_USER_TYPE: Packet = new Packet(0x0F, PacketField.BYTE)

    public readonly len: number
    public readonly id: number
    public readonly fields: PacketField[]

    private constructor(id: number, ...fields: PacketField[]) {
        this.id = id
        Packet.PACKETS[id] = this
        this.fields = fields

        let len = 0
        for (let i = 0; i < fields.length; i++) {
            let field = fields[i]
            if (field == PacketField.LONG) {
                len += 8
            } else if (field == PacketField.INT) {
                len += 4
            } else if (field == PacketField.SHORT) {
                len += 2
            } else if (field == PacketField.BYTE) {
                len += 1
            } else if (field == PacketField.FLOAT) {
                len += 4
            } else if (field == PacketField.DOUBLE) {
                len += 8
            } else if (field == PacketField.BYTES) {
                len += 1024
            } else if (field == PacketField.STRING) {
                len += 64
            }
        }

        this.len = len
    }
}
