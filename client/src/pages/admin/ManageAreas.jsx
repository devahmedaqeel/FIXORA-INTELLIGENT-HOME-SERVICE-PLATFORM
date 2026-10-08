import { useEffect, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';
import DataTable from '../../components/common/DataTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import ListState from '../../components/dashboard/ListState';
import { usePagedList } from '../../hooks/usePagedList';
import { useDebounce } from '../../hooks/useDebounce';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useToast } from '../../context/ToastContext';
import { adminListAreas, createArea, deleteArea, updateArea } from '../../services/catalog.service';
import { UK_COUNTRY_OPTIONS } from '../../constants';
import { fieldErrorsFromApi, isPostcode } from '../../utils/validation';

const EMPTY = { areaName: '', city: '', district: '', province: '', postalCode: '', active: true };

export default function ManageAreas() {
  useDocumentTitle('Areas & postal codes');
  const toast = useToast();
  const list = usePagedList(adminListAreas, { q: '', province: '' }, 25);
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search, 300);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  useEffect(() => {
    if (debounced !== list.filters.q) list.setFilter('q', debounced);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const open = (area) => {
    setErrors({});
    setEditing(area || EMPTY);
    setForm(area ? { areaName: area.areaName, city: area.city, district: area.district, province: area.province, postalCode: area.postalCode, active: area.active } : EMPTY);
  };
  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const save = async (event) => {
    event.preventDefault();
    const next = {};
    ['areaName', 'city', 'district'].forEach((f) => {
      if (form[f].trim().length < 2) next[f] = 'Required';
    });
    if (!form.province) next.province = 'Select a country';
    if (!isPostcode(form.postalCode)) next.postalCode = 'Enter a valid UK postcode, e.g. SW1A 1AA';
    setErrors(next);
    if (Object.keys(next).length) return;
    setSaving(true);
    try {
      const payload = { ...form, areaName: form.areaName.trim(), city: form.city.trim(), district: form.district.trim(), postalCode: form.postalCode.trim() };
      if (editing.id) await updateArea(editing.id, payload);
      else await createArea(payload);
      toast.success(editing.id ? 'Area updated' : 'Area added');
      setEditing(null);
      list.reload();
    } catch (err) {
      setErrors(fieldErrorsFromApi(err));
      toast.error(err);
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (area) => {
    try {
      const updated = await updateArea(area.id, { active: !area.active });
      list.replaceItem(area.id, updated);
      toast.success(updated.active ? 'Area activated' : 'Area deactivated');
    } catch (err) {
      toast.error(err);
    }
  };

  const remove = async () => {
    try {
      await deleteArea(toDelete.id);
      toast.success('Area deleted');
      list.reload();
    } catch (err) {
      toast.error(err);
    } finally {
      setToDelete(null);
    }
  };

  return (
    <div className="stack stack--lg">
      <PageHeader
        title="Areas & postcodes"
        description="UK locations used for provider service areas and customer search (no map APIs)."
        actions={<Button icon="plus" onClick={() => open(null)}>Add area</Button>}
      />
      <div className="toolbar">
        <Input label="Search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Area, city, county or postcode" className="toolbar__grow" />
        <Select
          label="Country"
          value={list.filters.province}
          onChange={(e) => list.setFilter('province', e.target.value)}
          placeholder="All countries"
          options={UK_COUNTRY_OPTIONS}
        />
      </div>
      <ListState list={list} emptyTitle="No areas found." emptyIcon="map-pin">
        <DataTable
          caption="Areas"
          rows={list.items}
          columns={[
            { key: 'areaName', label: 'Area', render: (a) => <strong>{a.areaName}</strong> },
            { key: 'city', label: 'City' },
            { key: 'district', label: 'County' },
            { key: 'province', label: 'Country' },
            { key: 'postalCode', label: 'Postcode' },
            { key: 'active', label: 'Status', render: (a) => <Badge tone={a.active ? 'success' : 'neutral'}>{a.active ? 'Active' : 'Inactive'}</Badge> },
            {
              key: 'actions',
              label: 'Actions',
              render: (a) => (
                <div className="row row--wrap">
                  <Button size="sm" variant="secondary" icon="edit" onClick={() => open(a)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => toggle(a)}>
                    {a.active ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button size="sm" variant="ghost" icon="trash" aria-label={`Delete ${a.areaName}`} onClick={() => setToDelete(a)} />
                </div>
              ),
            },
          ]}
        />
      </ListState>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing?.id ? 'Edit area' : 'Add area'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button type="submit" form="area-form" loading={saving}>
              Save
            </Button>
          </>
        }
      >
        <form id="area-form" className="form-grid" onSubmit={save} noValidate>
          <Input label="Area name" value={form.areaName} onChange={set('areaName')} error={errors.areaName} required />
          <Input label="City" value={form.city} onChange={set('city')} error={errors.city} required />
          <Input label="County" value={form.district} onChange={set('district')} error={errors.district} required />
          <Select label="Country" value={form.province} onChange={set('province')} placeholder="Select" options={UK_COUNTRY_OPTIONS} error={errors.province} required />
          <Input label="Postcode" maxLength={8} placeholder="SW1A 1AA" value={form.postalCode} onChange={set('postalCode')} error={errors.postalCode} required />
          <label className="checkbox">
            <input type="checkbox" checked={form.active} onChange={set('active')} />
            <span>Active</span>
          </label>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title={`Delete ${toDelete?.areaName}?`}
        message="Areas served by any provider cannot be deleted — deactivate them instead."
        confirmLabel="Delete"
        onConfirm={remove}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
