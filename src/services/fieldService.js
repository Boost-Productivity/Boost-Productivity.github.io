const API_URL = '/api';

export const fieldService = {
    async createField(name) {
        const response = await fetch(`${API_URL}/fields`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to create field');
        }

        return response.json();
    },

    async setValue(fieldId, value, datetime = null) {
        const payload = {
            field_id: fieldId,
            value: value,
        };

        if (datetime) {
            payload.datetime_iso_8601 = datetime.toISOString();
        }

        const response = await fetch(`${API_URL}/values`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to set value');
        }

        return response.json();
    },

    async getField(fieldId) {
        const response = await fetch(`${API_URL}/fields/${fieldId}`);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to get field');
        }

        return response.json();
    },

    async getAllFields() {
        const response = await fetch(`${API_URL}/fields`);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to get fields');
        }

        return response.json();
    },

    async updateField(fieldId, name) {
        const response = await fetch(`${API_URL}/fields/${fieldId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to update field');
        }

        return response.json();
    },

    async deleteField(fieldId) {
        const response = await fetch(`${API_URL}/fields/${fieldId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to delete field');
        }

        return response.json();
    },

    // async toggleFieldHidden(fieldId) { ... }
}; 