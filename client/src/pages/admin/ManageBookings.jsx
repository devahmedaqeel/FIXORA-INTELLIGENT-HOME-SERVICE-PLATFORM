import { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Select from '../../components/common/Select';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import DataTable from '../../components/common/DataTable';
import ListState from '../../components/dashboard/ListState';
import BookingStatusBadge from '../../components/booking/BookingStatusBadge';
import BookingDetailsView from '../../components/booking/BookingDetailsView';
import { usePagedList } from '../../hooks/usePagedList';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useToast } from '../../context/ToastContext';
import { listBookings, updateBookingStatus } from '../../services/admin.service';
import { BOOKING_FILTERS } from '../../features/booking/booking.constants';
import { BOOKING_STATUS_LABELS } from '../../constants';
import { formatDate, formatPrice, formatTime } from '../../utils/format';

export default function ManageBookings() {
  useDocumentTitle('Bookings');
  const toast = useToast();
  const list = usePagedList(listBookings, { status: '', from: '', to: '', scope: 'all' });
  const [selected, setSelected] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [saving, setSaving] = useState(false);

  const override = async () => {
    setSaving(true);
    try {
      const updated = await updateBookingStatus(selected.id, newStatus);
      list.replaceItem(selected.id, updated);
      setSelected(updated);
      toast.success('Booking status updated; both parties were notified');
    } catch (err) {
      toast.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="stack stack--lg">
      <PageHeader title="Bookings" description="Every booking on the platform. Admins can override status for support cases." />
      <div className="toolbar">
        <Select label="Status" value={list.filters.status} onChange={(e) => list.setFilter('status', e.target.value)} options={BOOKING_FILTERS} />
        <Input label="From" type="date" value={list.filters.from} onChange={(e) => list.setFilter('from', e.target.value)} />
        <Input label="To" type="date" value={list.filters.to} onChange={(e) => list.setFilter('to', e.target.value)} />
      </div>
      <ListState list={list} emptyTitle="No bookings found." emptyIcon="calendar">
        <DataTable
          caption="Bookings"
          rows={list.items}
          onRowClick={(b) => {
            setSelected(b);
            setNewStatus(b.status);
          }}
          columns={[
            { key: 'bookingDate', label: 'Date', render: (b) => `${formatDate(b.bookingDate)} ${formatTime(b.startTime)}` },
            { key: 'serviceTitle', label: 'Service' },
            { key: 'customerName', label: 'Customer' },
            { key: 'providerName', label: 'Provider' },
            { key: 'price', label: 'Price', render: (b) => formatPrice(b.price, b.pricingType) },
            { key: 'status', label: 'Status', render: (b) => <BookingStatusBadge status={b.status} /> },
          ]}
        />
      </ListState>
      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title="Booking" size="lg">
        {selected && (
          <div className="stack">
            <BookingDetailsView booking={selected} perspective="admin" />
            <div className="toolbar">
              <Select
                label="Override status"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                options={Object.entries(BOOKING_STATUS_LABELS).map(([value, label]) => ({ value, label }))}
              />
              <Button onClick={override} loading={saving} disabled={newStatus === selected.status}>
                Apply
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
