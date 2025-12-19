import type { Equipment } from '../types/Equipment';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

async function readErrorMessage(response: Response): Promise<string> {
    const contentType = response.headers.get('content-type') ?? '';

    if (contentType.includes('application/json')) {
        try {
            const data: unknown = await response.json();

            if (
                typeof data === 'object' &&
                data !== null &&
                'message' in data &&
                typeof (data as { message?: unknown }).message === 'string'
            ) {
                return (data as { message: string }).message;
            }

            return JSON.stringify(data);
        } catch {
            return response.statusText || 'Request failed';
        }
    }

    try {
        const text = await response.text();
        return text.trim() || response.statusText || 'Request failed';
    } catch {
        return response.statusText || 'Request failed';
    }
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${BASE_URL}${path}`, {
        ...init,
        headers: {
            'Content-Type': 'application/json',
            ...(init?.headers ?? {}),
        },
    });

    if (!response.ok) {
        const message = await readErrorMessage(response);
        throw new Error(`Request failed (${response.status}): ${message}`);
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
        throw new Error('Invalid server response (expected JSON).');
    }

    return (await response.json()) as T;
}

async function requestVoid(path: string, init?: RequestInit): Promise<void> {
    const response = await fetch(`${BASE_URL}${path}`, {
        ...init,
        headers: {
            ...(init?.headers ?? {}),
        },
    });

    if (!response.ok) {
        const message = await readErrorMessage(response);
        throw new Error(`Request failed (${response.status}): ${message}`);
    }
}

export async function fetchEquipment(): Promise<Equipment[]> {
    return requestJson<Equipment[]>('/equipment', { method: 'GET' });
}

export async function createEquipment(
    payload: Omit<Equipment, 'id'>
): Promise<Equipment> {
    return requestJson<Equipment>('/equipment', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

export async function updateEquipment(
    id: number,
    payload: Omit<Equipment, 'id'>
): Promise<Equipment> {
    return requestJson<Equipment>(`/equipment/${encodeURIComponent(String(id))}`,
        {
            method: 'PUT',
            body: JSON.stringify(payload),
        }
    );
}

export async function deleteEquipment(id: number): Promise<void> {
    await requestVoid(`/equipment/${encodeURIComponent(String(id))}`,
        {
            method: 'DELETE',
        }
    );
}