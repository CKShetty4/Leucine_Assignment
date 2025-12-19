import type { Request, Response } from 'express';

import { dbAll, dbGet, dbRun } from '../db/database';
import type { Equipment, EquipmentStatus, EquipmentType } from '../models/equipment.model';

type EquipmentPayload = Omit<Equipment, 'id'>;

const TYPE_OPTIONS: readonly EquipmentType[] = ['Machine', 'Vessel', 'Tank', 'Mixer'];
const STATUS_OPTIONS: readonly EquipmentStatus[] = ['Active', 'Inactive', 'Under Maintenance'];
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

function parseId(value: string): number | null {
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) {
        return null;
    }
    return parsed;
}

function validatePayload(body: unknown): { ok: true; data: EquipmentPayload } | { ok: false; message: string } {
    if (!isRecord(body)) {
        return { ok: false, message: 'Invalid request body.' };
    }

    const name = body.name;
    const type = body.type;
    const status = body.status;
    const lastCleanedDate = body.lastCleanedDate;

    if (typeof name !== 'string' || name.trim().length < 2) {
        return { ok: false, message: 'Name is required and must be at least 2 characters.' };
    }

    if (typeof type !== 'string' || !TYPE_OPTIONS.includes(type as EquipmentType)) {
        return { ok: false, message: 'Type is required and must be a valid option.' };
    }

    if (typeof status !== 'string' || !STATUS_OPTIONS.includes(status as EquipmentStatus)) {
        return { ok: false, message: 'Status is required and must be a valid option.' };
    }

    if (typeof lastCleanedDate !== 'string' || lastCleanedDate.trim().length === 0) {
        return { ok: false, message: 'Last cleaned date is required.' };
    }

    const normalizedDate = lastCleanedDate.trim();
    if (!ISO_DATE_REGEX.test(normalizedDate)) {
        return { ok: false, message: 'Last cleaned date must be in YYYY-MM-DD format.' };
    }

    return {
        ok: true,
        data: {
            name: name.trim(),
            type: type as EquipmentType,
            status: status as EquipmentStatus,
            lastCleanedDate: normalizedDate,
        },
    };
}

export async function getAllEquipment(_req: Request, res: Response): Promise<void> {
    try {
        const rows = await dbAll<Equipment>(
            'SELECT id, name, type, status, lastCleanedDate FROM equipment ORDER BY id ASC'
        );
        res.status(200).json(rows);
    } catch (error: unknown) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error.' });
    }
}

export async function createEquipment(req: Request, res: Response): Promise<void> {
    const parsed = validatePayload(req.body as unknown);
    if (!parsed.ok) {
        res.status(400).json({ message: parsed.message });
        return;
    }

    try {
        const result = await dbRun(
            'INSERT INTO equipment (name, type, status, lastCleanedDate) VALUES (?, ?, ?, ?)'
            ,
            [parsed.data.name, parsed.data.type, parsed.data.status, parsed.data.lastCleanedDate]
        );

        const created = await dbGet<Equipment>(
            'SELECT id, name, type, status, lastCleanedDate FROM equipment WHERE id = ?'
            ,
            [result.lastID]
        );

        if (!created) {
            res.status(500).json({ message: 'Failed to create equipment.' });
            return;
        }

        res.status(201).json(created);
    } catch (error: unknown) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error.' });
    }
}

export async function updateEquipment(req: Request, res: Response): Promise<void> {
    const id = parseId(req.params.id);
    if (id === null) {
        res.status(400).json({ message: 'Invalid equipment id.' });
        return;
    }

    const parsed = validatePayload(req.body as unknown);
    if (!parsed.ok) {
        res.status(400).json({ message: parsed.message });
        return;
    }

    try {
        const existing = await dbGet<Equipment>(
            'SELECT id, name, type, status, lastCleanedDate FROM equipment WHERE id = ?'
            ,
            [id]
        );

        if (!existing) {
            res.status(404).json({ message: 'Equipment not found.' });
            return;
        }

        await dbRun(
            'UPDATE equipment SET name = ?, type = ?, status = ?, lastCleanedDate = ? WHERE id = ?'
            ,
            [parsed.data.name, parsed.data.type, parsed.data.status, parsed.data.lastCleanedDate, id]
        );

        const updated = await dbGet<Equipment>(
            'SELECT id, name, type, status, lastCleanedDate FROM equipment WHERE id = ?'
            ,
            [id]
        );

        if (!updated) {
            res.status(500).json({ message: 'Failed to update equipment.' });
            return;
        }

        res.status(200).json(updated);
    } catch (error: unknown) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error.' });
    }
}

export async function deleteEquipment(req: Request, res: Response): Promise<void> {
    const id = parseId(req.params.id);
    if (id === null) {
        res.status(400).json({ message: 'Invalid equipment id.' });
        return;
    }

    try {
        const result = await dbRun('DELETE FROM equipment WHERE id = ?', [id]);

        if (result.changes === 0) {
            res.status(404).json({ message: 'Equipment not found.' });
            return;
        }

        res.status(204).send();
    } catch (error: unknown) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error.' });
    }
}
