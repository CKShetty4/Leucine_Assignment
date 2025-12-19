import React, { createRef, useRef } from 'react';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import type { IconBaseProps } from 'react-icons';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

import type { Equipment } from '../types/Equipment';

type EquipmentTableProps = {
    equipment: Equipment[];
    onEdit: (equipment: Equipment) => void;
    onDelete: (id: number) => void;
};

function formatIsoDateToYyyyMmDd(value: string): string {
    const trimmed = value.trim();
    if (trimmed.length >= 10) {
        return trimmed.slice(0, 10);
    }
    return trimmed;
}

export default function EquipmentTable(props: EquipmentTableProps) {
    const { equipment, onDelete, onEdit } = props;

    const rowRefsById = useRef(new Map<number, React.RefObject<HTMLTableRowElement | null>>());

    const EditIcon = FiEdit2 as unknown as React.ComponentType<IconBaseProps>;
    const DeleteIcon = FiTrash2 as unknown as React.ComponentType<IconBaseProps>;

    if (equipment.length === 0) {
        return <div className="text-muted">No equipment found.</div>;
    }

    function handleDelete(id: number) {
        const confirmed = window.confirm('Delete this equipment? This action cannot be undone.');
        if (!confirmed) {
            return;
        }

        onDelete(id);
    }

    function renderActions(item: Equipment) {
        return (
            <div className="d-flex gap-2">
                <Button
                    variant="outline-primary"
                    size="sm"
                    type="button"
                    onClick={() => onEdit(item)}
                    aria-label={`Edit ${item.name}`}
                >
                    {React.createElement(EditIcon, { className: 'me-1', 'aria-hidden': true })}
                    Edit
                </Button>
                <Button
                    variant="outline-danger"
                    size="sm"
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    aria-label={`Delete ${item.name}`}
                >
                    {React.createElement(DeleteIcon, { className: 'me-1', 'aria-hidden': true })}
                    Delete
                </Button>
            </div>
        );
    }

    function getRowRef(id: number): React.RefObject<HTMLTableRowElement | null> {
        const existing = rowRefsById.current.get(id);
        if (existing) {
            return existing;
        }

        const created = createRef<HTMLTableRowElement>();
        rowRefsById.current.set(id, created);
        return created;
    }

    return (
        <div className="table-responsive">
            <Table striped bordered hover className="mb-0">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Last Cleaned Date</th>
                        <th className="actions-col" style={{ width: 160 }}>
                            Actions
                        </th>
                    </tr>
                </thead>
                <TransitionGroup component="tbody">
                    {equipment.map((item) => {
                        const rowRef = getRowRef(item.id);

                        return (
                            <CSSTransition
                                key={item.id}
                                nodeRef={rowRef}
                                timeout={140}
                                classNames="fade-item"
                            >
                                <tr ref={rowRef}>
                                    <td>{item.name}</td>
                                    <td>{item.type}</td>
                                    <td>{item.status}</td>
                                    <td>{formatIsoDateToYyyyMmDd(item.lastCleanedDate)}</td>
                                    <td className="actions-col">{renderActions(item)}</td>
                                </tr>
                            </CSSTransition>
                        );
                    })}
                </TransitionGroup>
            </Table>
        </div>
    );
}
