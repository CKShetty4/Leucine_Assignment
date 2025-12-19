import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Spinner from 'react-bootstrap/Spinner';
import { CSSTransition } from 'react-transition-group';

import EquipmentForm from './components/EquipmentForm';
import EquipmentTable from './components/EquipmentTable';
import { createEquipment, deleteEquipment, fetchEquipment, updateEquipment } from './services/api';
import type { Equipment, EquipmentStatus } from './types/Equipment';

type StatusFilter = 'All' | EquipmentStatus;
type SortOption = 'nameAsc' | 'nameDesc' | 'dateNewest' | 'dateOldest';

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.name === 'TypeError' && error.message.toLowerCase().includes('fetch')) {
      return 'Unable to reach the server. Please confirm the backend is running at http://localhost:5000.';
    }
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

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [sortOption, setSortOption] = useState<SortOption>('nameAsc');

  const formNodeRef = useRef<HTMLDivElement>(null);

  const formInitialData = useMemo(
    () => (isFormVisible ? editingEquipment : null),
    [editingEquipment, isFormVisible]
  );

  const displayedEquipment = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    const filtered = equipment.filter((item) => {
      const matchesSearch = normalizedQuery.length === 0 || item.name.toLowerCase().includes(normalizedQuery);
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    const sorted = [...filtered].sort((a, b) => {
      switch (sortOption) {
        case 'nameAsc':
          return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
        case 'nameDesc':
          return b.name.localeCompare(a.name, undefined, { sensitivity: 'base' });
        case 'dateNewest':
          return b.lastCleanedDate.localeCompare(a.lastCleanedDate);
        case 'dateOldest':
          return a.lastCleanedDate.localeCompare(b.lastCleanedDate);
        default:
          return 0;
      }
    });

    return sorted;
  }, [equipment, searchQuery, sortOption, statusFilter]);

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

        <CSSTransition
          nodeRef={formNodeRef}
          in={isFormVisible}
          timeout={140}
          classNames="fade-item"
          unmountOnExit
        >
          <div ref={formNodeRef} className="mb-3">
            <EquipmentForm initialData={formInitialData} onSubmit={handleSubmit} onCancel={handleCancel} />
          </div>
        </CSSTransition>

        <Card className="mb-3">
          <Card.Body>
            <Form>
              <Row className="g-3 align-items-end">
                <Col md={5}>
                  <Form.Group controlId="equipmentSearch">
                    <Form.Label>Search</Form.Label>
                    <Form.Control
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by name"
                      autoComplete="off"
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group controlId="equipmentStatusFilter">
                    <Form.Label>Status</Form.Label>
                    <Form.Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                    >
                      <option value="All">All</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Under Maintenance">Under Maintenance</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="equipmentSort">
                    <Form.Label>Sort</Form.Label>
                    <Form.Select
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value as SortOption)}
                    >
                      <option value="nameAsc">Name (A → Z)</option>
                      <option value="nameDesc">Name (Z → A)</option>
                      <option value="dateNewest">Last Cleaned Date (Newest → Oldest)</option>
                      <option value="dateOldest">Last Cleaned Date (Oldest → Newest)</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>

        <EquipmentTable equipment={displayedEquipment} onEdit={handleEdit} onDelete={handleDelete} />
      </Container>
    </main>
  );
}

