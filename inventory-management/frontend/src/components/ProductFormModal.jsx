import { useEffect, useState } from "react";

import LoadingSpinner from "./LoadingSpinner";
import Modal from "./Modal";
import NumericField from "./NumericField";
import { isValidNumericInput } from "../utils";

const initialFormState = {
  name: "",
  sku: "",
  price: "",
  quantity: "",
  low_stock_threshold: "10",
  description: "",
  image_url: "",
};

function validateProduct(values) {
  const errors = {};

  if (!values.name.trim()) errors.name = "Product name is required.";
  if (!values.sku.trim()) errors.sku = "SKU is required.";
  if (!isValidNumericInput(values.price, { min: 0 })) errors.price = "Price must be 0 or higher.";
  if (!isValidNumericInput(values.quantity, { min: 0, integer: true })) errors.quantity = "Stock must be 0 or higher.";
  if (!isValidNumericInput(values.low_stock_threshold, { min: 1, integer: true })) {
    errors.low_stock_threshold = "Threshold must be at least 1.";
  }

  return errors;
}

export default function ProductFormModal({ open, onClose, onSubmit, submitting, product }) {
  const [form, setForm] = useState(initialFormState);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) {
      setForm(initialFormState);
      setErrors({});
      return;
    }

    setForm(
      product
        ? {
            name: product.name,
            sku: product.sku,
            price: String(product.price),
            quantity: String(product.quantity),
            low_stock_threshold: String(product.low_stock_threshold ?? 10),
            description: product.description || "",
            image_url: product.image_url || "",
          }
        : initialFormState
    );
    setErrors({});
  }, [open, product]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateProduct(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    await onSubmit({
      name: form.name.trim(),
      sku: form.sku.trim(),
      price: Number(form.price),
      quantity: Number(form.quantity),
      low_stock_threshold: Number(form.low_stock_threshold),
      description: form.description.trim() || null,
      image_url: form.image_url.trim() || null,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={product ? "Update product" : "Add product"}
      description="Keep your inventory accurate with clean product records."
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="field-label" htmlFor="name">Product name</label>
            <input className="field-input" id="name" name="name" value={form.name} onChange={handleChange} />
            {errors.name ? <p className="field-error">{errors.name}</p> : null}
          </div>
          <div>
            <label className="field-label" htmlFor="sku">SKU</label>
            <input className="field-input" id="sku" name="sku" value={form.sku} onChange={handleChange} />
            {errors.sku ? <p className="field-error">{errors.sku}</p> : null}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <NumericField id="price" name="price" label="Price" value={form.price} onChange={handleChange} error={errors.price} />
          <NumericField id="quantity" name="quantity" label="Stock quantity" value={form.quantity} onChange={handleChange} integer min={0} error={errors.quantity} />
        </div>

        <NumericField
          id="low_stock_threshold"
          name="low_stock_threshold"
          label="Low Stock Alert Threshold"
          value={form.low_stock_threshold}
          onChange={handleChange}
          integer
          min={1}
          error={errors.low_stock_threshold}
          helperText="Products with stock below this number will appear in low stock alerts"
        />

        <div>
          <label className="field-label" htmlFor="description">Description</label>
          <textarea className="field-input min-h-28" id="description" name="description" value={form.description} onChange={handleChange} />
        </div>

        <div>
          <label className="field-label" htmlFor="image_url">
            Product Image URL <span className="ml-1 font-normal text-ink/35">(optional)</span>
          </label>
          <input
            id="image_url"
            name="image_url"
            type="url"
            value={form.image_url}
            onChange={handleChange}
            placeholder="https://example.com/product-image.jpg"
            className="field-input"
          />
          {form.image_url ? (
            <div className="mt-2 h-20 w-28 overflow-hidden rounded-lg border border-ink/10">
              <img
                src={form.image_url}
                alt="Preview"
                className="h-full w-full object-cover"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
            </div>
          ) : null}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button className="btn-secondary" type="button" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button className="btn-primary" type="submit" disabled={submitting}>
            {submitting ? <LoadingSpinner /> : null}
            {product ? "Save changes" : "Create product"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
