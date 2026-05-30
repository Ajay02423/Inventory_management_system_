import { useEffect, useState } from "react";

import LoadingSpinner from "./LoadingSpinner";
import Modal from "./Modal";

const initialFormState = {
  full_name: "",
  email: "",
  phone: "",
};

function validateCustomer(values) {
  const errors = {};

  if (!values.full_name.trim()) errors.full_name = "Customer name is required.";
  if (!values.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  if (!values.phone.trim()) errors.phone = "Phone number is required.";

  return errors;
}

export default function CustomerFormModal({ open, onClose, onSubmit, submitting }) {
  const [form, setForm] = useState(initialFormState);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(initialFormState);
      setErrors({});
    }
  }, [open]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateCustomer(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    await onSubmit({
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
    });
    setForm(initialFormState);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add customer"
      description="Save customer details once so ordering stays fast and consistent."
      size="max-w-xl"
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="field-label" htmlFor="full_name">Full name</label>
          <input className="field-input" id="full_name" name="full_name" value={form.full_name} onChange={handleChange} />
          {errors.full_name ? <p className="field-error">{errors.full_name}</p> : null}
        </div>
        <div>
          <label className="field-label" htmlFor="email">Email</label>
          <input className="field-input" id="email" name="email" type="email" value={form.email} onChange={handleChange} />
          {errors.email ? <p className="field-error">{errors.email}</p> : null}
        </div>
        <div>
          <label className="field-label" htmlFor="phone">Phone</label>
          <input className="field-input" id="phone" name="phone" value={form.phone} onChange={handleChange} />
          {errors.phone ? <p className="field-error">{errors.phone}</p> : null}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button className="btn-secondary" type="button" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button className="btn-primary" type="submit" disabled={submitting}>
            {submitting ? <LoadingSpinner /> : null}
            Create customer
          </button>
        </div>
      </form>
    </Modal>
  );
}
