import { useRef, useState } from 'react';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import { uploadProfilePhoto } from '../../services/storage.service';
import { useToast } from '../../context/ToastContext';

/** Uploads to Firebase Storage and returns the download URL via onUploaded(url). */
export default function PhotoUpload({ uid, role, name, value, onUploaded }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const toast = useToast();

  const onFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadProfilePhoto(uid, file, role);
      await onUploaded(url);
    } catch (err) {
      toast.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="photo-upload">
      <Avatar src={value} name={name} size={88} />
      <div className="stack stack--sm">
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={onFile} id="photo-input" />
        <Button variant="secondary" size="sm" icon="upload" loading={uploading} onClick={() => inputRef.current?.click()}>
          {value ? 'Change photo' : 'Upload photo'}
        </Button>
        {value && (
          <Button variant="ghost" size="sm" onClick={() => onUploaded('')} disabled={uploading}>
            Remove
          </Button>
        )}
        <p className="muted small">JPG, PNG or WebP, up to 2 MB.</p>
      </div>
    </div>
  );
}
