export class Field {
    constructor({ id, name }) {
        this.id = id;
        this.name = name;
    }

    update(updates) {
        Object.assign(this, updates);
    }

    toNode(position) {
        return {
            id: this.id,
            type: 'field',
            position,
            data: {
                name: this.name
            }
        };
    }

    static fromNode(node) {
        return new Field({
            id: node.id,
            name: node.data.name,
        });
    }
} 