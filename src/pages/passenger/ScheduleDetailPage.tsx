import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function ScheduleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetch() {
      try {
        const res = await api.get(`/schedules/${id}`);
        setSchedule(res.data?.data || res.data);
      } catch {
        setError('Failed to load schedule details.');
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [id]);

  function formatDateTime(dt: string) {
    if (!dt) return '-';
    try { return new Date(dt).toLocaleString('en-RW', { dateStyle: 'medium', timeStyle: 'short' }); }
    catch { return dt; }
  }

  if (loading) return <div className="text-center py-20 text-gray-400">Loading schedule...</div>;
  if (error) return <div className="text-center py-20 text-red-400">{error}</div>;
  if (!schedule) return <div className="text-center py-20 text-gray-400">Schedule not found.</div>;

  const from = schedule.route?.fromStation?.name || 'Departure';
  const to = schedule.route?.toStation?.name || 'Arrival';
  const price = schedule.price || 0;

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <button onClick={() => navigate(-1)} className="text-blue-600 text-sm font-medium hover:underline mb-6 block">
        {'\u2190'} Back to Results
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="text-4xl">{'\u{1F68C}'}</div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-800">{from} {'\u2192'} {to}</h1>
            <p className="text-sm text-gray-400">{schedule.bus?.plateNumber || 'Bus'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {[
            { label: 'Departure', value: formatDateTime(schedule.departureTime) },
            { label: 'Arrival', value: schedule.arrivalTime ? formatDateTime(schedule.arrivalTime) : '-' },
            { label: 'Available Seats', value: schedule.availableSeats ?? schedule.bus?.capacity ?? '-' },
            { label: 'Status', value: schedule.status || 'SCHEDULED' },
          ].map(item => (
            <div key={item.label} className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-1">{item.label}</p>
              <p className="font-bold text-gray-800">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="border-t pt-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">Price per seat</p>
            <p className="text-3xl font-extrabold text-blue-700">RWF {Number(price).toLocaleString()}</p>
          </div>
          <button
            onClick={() => navigate(`/checkout/${id}`)}
            disabled={schedule.status === 'CANCELLED'}
            className="bg-blue-700 hover:bg-blue-800 disabled:bg-gray-300 text-white font-bold px-8 py-3 rounded-xl text-base transition-colors"
          >
            Book Now {'\u{1F3AB}'}
          </button>
        </div>
      </div>
    </div>
  );
}
