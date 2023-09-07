export class EntityBuffer {
    private static buffer: Record<string, Entity[]> = {}

    private constructor() {}

    static add<E extends Entity>(e: E) {
        let b = this.buffer[e.constructor.name]
        if (b == null) {
            b = this.buffer[e.constructor.name] = []
        }
        b.push(e)
    }

    static flush() {
        let values = Object.values(this.buffer)
        this.buffer = {}
        return values
    }
}

export class NamedEntityBuffer {
    private static buffer: Record<string, Entity[]> = {}

    private constructor() {}

    static add<E extends Entity>(name: string, e: E) {
        let b = this.buffer[name]
        if (b == null) {
            b = this.buffer[name] = []
        }
        b.push(e)
    }

    static flush<E extends Entity>(name: string): E[] {
        let b = this.buffer[name]
        if (b == null) {
            b = this.buffer[name] = []
        }
        let values = Object.values(b)
        delete this.buffer[name]
        return values.map(x => x as unknown as E)
    }
}

interface Entity {
    id: string
}
