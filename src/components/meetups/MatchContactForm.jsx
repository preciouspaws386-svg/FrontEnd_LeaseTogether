import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../api/axios';

export default function MatchContactForm({ meetup, currentUserId, schoolName, onUpdated }) {
  const isRequester =
    meetup.requester?._id?.toString?.() === currentUserId || meetup.requester?.toString?.() === currentUserId;
  const isReceiver =
    meetup.receiver?._id?.toString?.() === currentUserId || meetup.receiver?.toString?.() === currentUserId;

  const contact = useMemo(() => {
    if (isRequester) return meetup.requesterContact || { fullName: '', phone: '' };
    if (isReceiver) return meetup.receiverContact || { fullName: '', phone: '' };
    return { fullName: '', phone: '' };
  }, [isRequester, isReceiver, meetup]);

  const alreadySubmitted = useMemo(() => {
    if (isRequester) return !!meetup.requesterSubmitted;
    if (isReceiver) return !!meetup.receiverSubmitted;
    return false;
  }, [isRequester, isReceiver, meetup]);

  const [fullName, setFullName] = useState(contact.fullName || '');
  const [phone, setPhone] = useState(contact.phone || '');
  const [agree, setAgree] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setFullName(contact.fullName || '');
    setPhone(contact.phone || '');
    // keep agree unchecked when switching meetups
    setAgree(false);
  }, [meetup?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  const completed = meetup.status === 'Completed';

  const submit = async () => {
    if (!fullName.trim()) return toast.error('Please enter your full name');
    if (!phone.trim()) return toast.error('Please enter your phone number');
    if (!agree) return toast.error('Please agree to share your contact information');

    setSubmitting(true);
    try {
      const res = await api.patch(`/meetups/${meetup._id}/submit-contact`, { fullName: fullName.trim(), phone: phone.trim() });
      onUpdated?.(res.data?.meetup || res.data?.data?.meetup || res.data?.meetup);
      toast.success('Submitted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 12, fontWeight: 800, fontSize: 16 }}>You Matched!</div>

      {completed ? (
        <div style={{ padding: '10px 12px', border: '1px solid var(--accent-line)', background: 'rgba(59,130,246,0.08)', borderRadius: 12 }}>
          Congratulations 🎉 You will receive a text message shortly with your match's contact information.
        </div>
      ) : alreadySubmitted ? (
        <div style={{ padding: '10px 12px', border: '1px solid var(--line-2)', background: 'rgba(255,255,255,0.02)', borderRadius: 12, fontSize: 13.5, color: 'var(--grey-2)', marginBottom: 12 }}>
          Thanks! We’re waiting for the other person to submit their contact info.
        </div>
      ) : null}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: completed ? 0 : 14 }}>
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input className="form-input" value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={submitting || completed || alreadySubmitted} />
        </div>

        <div className="form-group">
          <label className="form-label">Phone Number</label>
          <input className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g. (512) 555-0123" disabled={submitting || completed || alreadySubmitted} />
        </div>

        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">School</label>
          <input className="form-input" value={schoolName || ''} readOnly />
        </div>
      </div>

      {!completed && !alreadySubmitted ? (
        <div className="form-group" style={{ marginTop: 12 }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
            <input
              type="checkbox"
              required
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              style={{ marginTop: 3 }}
            />
            <span style={{ fontSize: 13.5, color: 'var(--grey-1)' }}>
              I agree to share my contact information with my match
              <span style={{ display: 'block', fontSize: 12, color: 'var(--grey-2)', marginTop: 2 }}>
                (Required)
              </span>
            </span>
          </label>
        </div>
      ) : null}

      {!completed && !alreadySubmitted ? (
        <button className="btn btn-primary btn-full" disabled={submitting} onClick={submit} style={{ marginTop: 16 }}>
          {submitting ? 'Submitting…' : 'Submit'}
        </button>
      ) : (
        <div style={{ marginTop: 16, fontSize: 12.5, color: 'var(--grey-2)', textAlign: 'center' }}>
          {completed ? 'Done' : 'Waiting…'}
        </div>
      )}
    </div>
  );
}

