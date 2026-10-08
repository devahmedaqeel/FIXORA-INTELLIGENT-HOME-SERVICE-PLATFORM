import { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';
import Icon from '../../components/common/Icon';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import DataTable from '../../components/common/DataTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useAsync } from '../../hooks/useAsync';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { invalidateCategories } from '../../hooks/useCategories';
import { useToast } from '../../context/ToastContext';
import { createCategory, deleteCategory, listCategories, updateCategory } from '../../services/catalog.service';
import { CATEGORY_ICON_OPTIONS, categoryIcon } from '../../constants/categoryIcons';

const EMPTY = { name: '', description: '', icon: 'wrench', active: true };

export default function ManageCategories() {
  useDocumentTitle('Categories');
  const toast = useToast();
  const { data, loading, error, reload } = useAsync(() => listCategories(true), []);
  const [editing, setEditing] = useState(null); // category | EMPTY
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const open = (category) => {
    setEditing(category || EMPTY);
    setForm(category ? { name: category.name, description: category.description || '', icon: category.icon || 'wrench', active: category.active } : EMPTY);
  };

  const done = (message) => {
    invalidateCategories();
    toast.success(message);
    reload();
  };

  const save = async (event) => {
    event.preventDefault();
    if (form.name.trim().length < 2) {
      toast.error('Category name must be at least 2 characters');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, name: form.name.trim(), description: form.description.trim() };
      if (editing.id) await updateCategory(editing.id, payload);
      else await createCategory(payload);
      setEditing(null);
      done(editing.id ? 'Category updated' : 'Category created');
    } catch (err) {
      toast.error(err);
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (category) => {
    try {
      await updateCategory(category.id, { active: !category.active });
      done(category.active ? 'Category deactivated — hidden from customers' : 'Category activated');
    } catch (err) {
      toast.error(err);
    }
  };

  const remove = async () => {
    try {
      await deleteCategory(toDelete.id);
      setToDelete(null);
      done('Category deleted');
    } catch (err) {
      setToDelete(null);
      toast.error(err);
    }
  };

  return (
    <div className="stack stack--lg">
      <PageHeader title="Service categories" description="Only active categories appear to customers." actions={<Button icon="plus" onClick={() => open(null)}>New category</Button>} />
      {loading && <Loader />}
      <ErrorMessage error={error} onRetry={reload} />
      {data?.length === 0 && <EmptyState icon="layers" title="No categories yet." message="Run the seed script or add one." />}
      {data?.length > 0 && (
        <DataTable
          caption="Categories"
          rows={data}
          columns={[
            {
              key: 'name',
              label: 'Category',
              render: (c) => (
                <span className="row">
                  <Icon name={categoryIcon(c.icon)} size={18} /> <strong>{c.name}</strong>
                </span>
              ),
            },
            { key: 'description', label: 'Description', render: (c) => <span className="muted small">{c.description || '—'}</span> },
            { key: 'active', label: 'Status', render: (c) => <Badge tone={c.active ? 'success' : 'neutral'}>{c.active ? 'Active' : 'Inactive'}</Badge> },
            {
              key: 'actions',
              label: 'Actions',
              render: (c) => (
                <div className="row row--wrap">
                  <Button size="sm" variant="secondary" icon="edit" onClick={() => open(c)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => toggle(c)}>
                    {c.active ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button size="sm" variant="ghost" icon="trash" aria-label={`Delete ${c.name}`} onClick={() => setToDelete(c)} />
                </div>
              ),
            },
          ]}
        />
      )}

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing?.id ? 'Edit category' : 'New category'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button type="submit" form="category-form" loading={saving}>
              Save
            </Button>
          </>
        }
      >
        <form id="category-form" className="stack" onSubmit={save}>
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={60} required />
          <Input as="textarea" rows={3} label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={300} />
          <Select label="Icon" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} options={CATEGORY_ICON_OPTIONS.map((i) => ({ value: i, label: i }))} />
          <label className="checkbox">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
            <span>Active (visible to customers)</span>
          </label>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title={`Delete ${toDelete?.name}?`}
        message="Categories used by any service cannot be deleted — deactivate them instead."
        confirmLabel="Delete"
        onConfirm={remove}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
