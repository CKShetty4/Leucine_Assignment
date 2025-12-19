import { useEffect, useMemo, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';

import type { Equipment, EquipmentStatus, EquipmentType } from '../types/Equipment';

type EquipmentFormData = Omit<Equipment, 'id'>;

type FieldName = keyof EquipmentFormData;

type EquipmentFormProps = {
    initialData: Equipment | null;
    onSubmit: (data: EquipmentFormData) => void;
    onCancel: () => void;
};

const TYPE_OPTIONS: readonly EquipmentType[] = ['Machine', 'Vessel', 'Tank', 'Mixer'];

const STATUS_OPTIONS: readonly EquipmentStatus[] = [
    'Active',
    'Inactive',
    'Under Maintenance',
];

const createEmptyData = (): EquipmentFormData => ({
    name: '',
    type: 'Machine',
    status: 'Active',
    lastCleanedDate: '',
});

function toFormData(initialData: Equipment | null): EquipmentFormData {
    if (!initialData) {
        return createEmptyData();
    }

    return {
        name: initialData.name,
        type: initialData.type,
        status: initialData.status,
        lastCleanedDate: initialData.lastCleanedDate,
    };
}

function validate(data: EquipmentFormData): Partial<Record<FieldName, string>> {
    const errors: Partial<Record<FieldName, string>> = {};

    const trimmedName = data.name.trim();
    if (trimmedName.length === 0) {
        errors.name = 'Name is required.';
    } else if (trimmedName.length < 2) {
        errors.name = 'Name must be at least 2 characters.';
    }

    if (!TYPE_OPTIONS.includes(data.type)) {
        errors.type = 'Type is required.';
    }

    if (!STATUS_OPTIONS.includes(data.status)) {
        errors.status = 'Status is required.';
    }

    if (data.lastCleanedDate.trim().length === 0) {
        errors.lastCleanedDate = 'Last cleaned date is required.';
    }

    return errors;
}

export default function EquipmentForm(props: EquipmentFormProps) {
    const { initialData, onCancel, onSubmit } = props;

    const [formData, setFormData] = useState<EquipmentFormData>(() => toFormData(initialData));
    const [touchedFields, setTouchedFields] = useState<Partial<Record<FieldName, boolean>>>({});
    const [submitAttempted, setSubmitAttempted] = useState(false);

    useEffect(() => {
        setFormData(toFormData(initialData));
        setTouchedFields({});
        setSubmitAttempted(false);
    }, [initialData]);

    const errors = useMemo(() => validate(formData), [formData]);
    const isValid = Object.keys(errors).length === 0;

    const modeLabel = initialData ? 'Edit' : 'Add';

    function markTouched(fieldName: FieldName) {
        setTouchedFields((current) => ({ ...current, [fieldName]: true }));
    }

    function shouldShowError(fieldName: FieldName): boolean {
        return Boolean(submitAttempted || touchedFields[fieldName]);
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSubmitAttempted(true);

        const currentErrors = validate(formData);
        if (Object.keys(currentErrors).length > 0) {
            return;
        }

        onSubmit({
            name: formData.name.trim(),
            type: formData.type,
            status: formData.status,
            lastCleanedDate: formData.lastCleanedDate,
        });
    }

    function handleCancel() {
        setFormData(toFormData(initialData));
        setTouchedFields({});
        setSubmitAttempted(false);
        onCancel();
    }

    return (
        <Card>
            <Card.Body>
                <Card.Title className="h6 mb-3">{modeLabel} Equipment</Card.Title>

                <Form noValidate onSubmit={handleSubmit}>
                    <Row className="g-3">
                        <Col md={6}>
                            <Form.Group controlId="equipmentName">
                                <Form.Label>Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData((c) => ({ ...c, name: e.target.value }))}
                                    onBlur={() => markTouched('name')}
                                    isInvalid={shouldShowError('name') && Boolean(errors.name)}
                                    placeholder="Enter equipment name"
                                    autoComplete="off"
                                />
                                <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        <Col md={3}>
                            <Form.Group controlId="equipmentType">
                                <Form.Label>Type</Form.Label>
                                <Form.Select
                                    value={formData.type}
                                    onChange={(e) =>
                                        setFormData((c) => ({ ...c, type: e.target.value as EquipmentType }))
                                    }
                                    onBlur={() => markTouched('type')}
                                    isInvalid={shouldShowError('type') && Boolean(errors.type)}
                                >
                                    {TYPE_OPTIONS.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">{errors.type}</Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        <Col md={3}>
                            <Form.Group controlId="equipmentStatus">
                                <Form.Label>Status</Form.Label>
                                <Form.Select
                                    value={formData.status}
                                    onChange={(e) =>
                                        setFormData((c) => ({ ...c, status: e.target.value as EquipmentStatus }))
                                    }
                                    onBlur={() => markTouched('status')}
                                    isInvalid={shouldShowError('status') && Boolean(errors.status)}
                                >
                                    {STATUS_OPTIONS.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </Form.Select>
                                <Form.Control.Feedback type="invalid">{errors.status}</Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        <Col md={4}>
                            <Form.Group controlId="lastCleanedDate">
                                <Form.Label>Last Cleaned Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={formData.lastCleanedDate}
                                    onChange={(e) =>
                                        setFormData((c) => ({ ...c, lastCleanedDate: e.target.value }))
                                    }
                                    onBlur={() => markTouched('lastCleanedDate')}
                                    isInvalid={
                                        shouldShowError('lastCleanedDate') && Boolean(errors.lastCleanedDate)
                                    }
                                />
                                <Form.Control.Feedback type="invalid">
                                    {errors.lastCleanedDate}
                                </Form.Control.Feedback>
                            </Form.Group>
                        </Col>

                        <Col xs={12}>
                            <div className="d-flex gap-2">
                                <Button type="submit" variant="primary" disabled={!isValid}>
                                    {modeLabel}
                                </Button>
                                <Button type="button" variant="outline-secondary" onClick={handleCancel}>
                                    Cancel
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </Form>
            </Card.Body>
        </Card>
    );
}