import { useCallback, useEffect, useMemo, useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Spinner from 'react-bootstrap/Spinner';

import EquipmentForm from './components/EquipmentForm';
import EquipmentTable from './components/EquipmentTable';
import { createEquipment, deleteEquipment, fetchEquipment, updateEquipment } from './services/api';
import type { Equipment } from './types/Equipment';

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred.';
}

export default function App() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const formInitialData = useMemo(() => (isFormVisible ? editingEquipment : null), [editingEquipment, isFormVisible]);

  const loadEquipment = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchEquipment();
      setEquipment(data);
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadEquipment();
  }, [loadEquipment]);

  function handleAddClick() {
    setEditingEquipment(null);
    setIsFormVisible(true);
  }

  function handleEdit(selected: Equipment) {
    setEditingEquipment(selected);
    setIsFormVisible(true);
  }

  function handleCancel() {
    setIsFormVisible(false);
    setEditingEquipment(null);
  }

  async function handleSubmit(payload: Omit<Equipment, 'id'>) {
    setLoading(true);
    setError(null);

    try {
      if (editingEquipment) {
        await updateEquipment(editingEquipment.id, payload);
      } else {
        await createEquipment(payload);
      }

      await loadEquipment();
      setIsFormVisible(false);
      setEditingEquipment(null);
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number) {
    setLoading(true);
    setError(null);

    try {
      await deleteEquipment(id);
      await loadEquipment();
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="py-4">
      <Container>
        <Row className="align-items-center g-3 mb-3">
          <Col>
            <h1 className="h4 mb-0">Equipment Tracker</h1>
          </Col>
          <Col xs="auto">
            <Button
              type="button"
              variant="primary"
              onClick={handleAddClick}
              disabled={loading}
            >
              Add Equipment
            </Button>
          </Col>
        </Row>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loading && (
          <div className="d-flex align-items-center gap-2 mb-3" aria-live="polite">
            <Spinner animation="border" size="sm" role="status" aria-label="Loading" />
            <span className="text-muted">Loading…</span>
          </div>
        )}

        {isFormVisible && (
          <div className="mb-3">
            <EquipmentForm initialData={formInitialData} onSubmit={handleSubmit} onCancel={handleCancel} />
          </div>
        )}

        <EquipmentTable equipment={equipment} onEdit={handleEdit} onDelete={handleDelete} />
      </Container>
    </main>
  );
}
