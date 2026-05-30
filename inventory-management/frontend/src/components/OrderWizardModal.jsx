import { Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import LoadingSpinner from "./LoadingSpinner";
import Modal from "./Modal";
import NumericField from "./NumericField";
import { formatCurrency, formatDateTime, formatDateTimeInputValue, isValidNumericInput } from "../utils";

const emptyItem = { product_id: "", quantity: "1" };

function buildInitialState() {
  return {
    step: 1,
    customer_id: "",
    order_date: formatDateTimeInputValue(),
    customerSearch: "",
    items: [{ ...emptyItem }],
    errors: {},
  };
}

export default function OrderWizardModal({ open, onClose, onSubmit, submitting, customers, products }) {
  const [state, setState] = useState(buildInitialState());

  useEffect(() => {
    if (open) {
      setState(buildInitialState());
    }
  }, [open]);

  const filteredCustomers = useMemo(() => {
    const term = state.customerSearch.trim().toLowerCase();
    if (!term) {
      return customers;
    }

    return customers.filter(
      (customer) =>
        customer.full_name.toLowerCase().includes(term) ||
        customer.email.toLowerCase().includes(term)
    );
  }, [customers, state.customerSearch]);

  const selectedCustomer = customers.find((customer) => customer.id === state.customer_id);
  const productMap = useMemo(
    () => Object.fromEntries(products.map((product) => [product.id, product])),
    [products]
  );

  const summaryItems = state.items
    .filter((item) => item.product_id && Number(item.quantity) > 0)
    .map((item) => {
      const product = productMap[item.product_id];
      const quantity = Number(item.quantity);
      const subtotal = (product?.price || 0) * quantity;
      return { ...item, product, quantity, subtotal };
    });

  const totalAmount = summaryItems.reduce((sum, item) => sum + item.subtotal, 0);

  const setErrors = (errors) => setState((current) => ({ ...current, errors }));

  const validateStepOne = () => {
    if (!state.customer_id) {
      setErrors({ customer_id: "Select a customer before continuing." });
      return false;
    }
    if (!state.order_date) {
      setErrors({ order_date: "Choose an order date and time." });
      return false;
    }
    setErrors({});
    return true;
  };

  const validateStepTwo = () => {
    const errors = {};

    if (!state.items.length) {
      errors.items = "Add at least one order item.";
    }

    state.items.forEach((item, index) => {
      const product = productMap[item.product_id];
      const quantity = Number(item.quantity);
      if (!item.product_id) {
        errors[`product_${index}`] = "Choose a product.";
      }
      if (!isValidNumericInput(item.quantity, { min: 1, integer: true })) {
        errors[`quantity_${index}`] = "Quantity must be at least 1.";
      }
      if (product && quantity > product.quantity) {
        errors[`quantity_${index}`] = `Only ${product.quantity} in stock.`;
      }
    });

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const goNext = () => {
    if (state.step === 1 && !validateStepOne()) {
      return;
    }
    if (state.step === 2 && !validateStepTwo()) {
      return;
    }
    setState((current) => ({ ...current, step: Math.min(3, current.step + 1), errors: {} }));
  };

  const goBack = () => setState((current) => ({ ...current, step: Math.max(1, current.step - 1), errors: {} }));

  const updateItem = (index, field, value) => {
    setState((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item)),
    }));
  };

  const addItem = () => setState((current) => ({ ...current, items: [...current.items, { ...emptyItem }] }));
  const removeItem = (index) =>
    setState((current) => ({
      ...current,
      items: current.items.filter((_, itemIndex) => itemIndex !== index),
    }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateStepTwo()) {
      setState((current) => ({ ...current, step: 2 }));
      return;
    }

    await onSubmit({
      customer_id: state.customer_id,
      order_date: new Date(state.order_date).toISOString(),
      items: state.items.map((item) => ({
        product_id: item.product_id,
        quantity: Number(item.quantity),
      })),
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New order"
      description="Walk through customer selection, item building, and summary before submission."
      size="max-w-4xl"
    >
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid gap-2 md:grid-cols-3">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
                state.step === step
                  ? "border-brand-500 bg-brand-50 text-brand-900"
                  : "border-ink/10 bg-white text-ink/50"
              }`}
            >
              Step {step}
            </div>
          ))}
        </div>

        {state.step === 1 ? (
          <div className="space-y-4">
            <div>
              <label className="field-label" htmlFor="customerSearch">Search customers</label>
              <input
                id="customerSearch"
                className="field-input"
                value={state.customerSearch}
                onChange={(event) => setState((current) => ({ ...current, customerSearch: event.target.value }))}
                placeholder="Filter by name or email"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="order_date">Order Date &amp; Time</label>
              <input
                id="order_date"
                className={`field-input ${state.errors.order_date ? "border-berry-500 ring-2 ring-berry-100" : ""}`}
                type="datetime-local"
                value={state.order_date}
                onChange={(event) => setState((current) => ({ ...current, order_date: event.target.value }))}
              />
              {state.errors.order_date ? <p className="field-error">{state.errors.order_date}</p> : null}
            </div>
            <div>
              <label className="field-label" htmlFor="customer_id">Select customer</label>
              <select
                id="customer_id"
                className="field-input"
                value={state.customer_id}
                onChange={(event) => setState((current) => ({ ...current, customer_id: event.target.value }))}
              >
                <option value="">Choose a customer</option>
                {filteredCustomers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.full_name} - {customer.email}
                  </option>
                ))}
              </select>
              {state.errors.customer_id ? <p className="field-error">{state.errors.customer_id}</p> : null}
            </div>
          </div>
        ) : null}

        {state.step === 2 ? (
          <div className="space-y-4">
            {state.items.map((item, index) => {
              const selectedProduct = productMap[item.product_id];
              return (
                <div key={`${index}-${item.product_id}`} className="panel-muted p-4">
                  <div className="grid gap-4 md:grid-cols-[1.5fr_160px_auto]">
                    <div>
                      <label className="field-label" htmlFor={`product-${index}`}>Product</label>
                      <select
                        id={`product-${index}`}
                        className="field-input"
                        value={item.product_id}
                        onChange={(event) => updateItem(index, "product_id", event.target.value)}
                      >
                        <option value="">Choose a product</option>
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name} ({product.sku})
                          </option>
                        ))}
                      </select>
                      {state.errors[`product_${index}`] ? <p className="field-error">{state.errors[`product_${index}`]}</p> : null}
                      {selectedProduct ? (
                        <p className="mt-2 text-sm text-ink/60">
                          Available stock: {selectedProduct.quantity} | Price: {formatCurrency(selectedProduct.price)}
                        </p>
                      ) : null}
                    </div>
                    <NumericField
                      id={`quantity-${index}`}
                      name={`quantity-${index}`}
                      label="Quantity"
                      value={item.quantity}
                      onChange={(event) => updateItem(index, "quantity", event.target.value)}
                      integer
                      min={1}
                      error={state.errors[`quantity_${index}`]}
                    />
                    <div className="flex items-end">
                      <button className="btn-secondary w-full" type="button" onClick={() => removeItem(index)} disabled={state.items.length === 1}>
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {state.errors.items ? <p className="field-error">{state.errors.items}</p> : null}

            <button className="btn-secondary" type="button" onClick={addItem}>
              <Plus className="h-4 w-4" />
              Add item
            </button>
          </div>
        ) : null}

        {state.step === 3 ? (
          <div className="space-y-4">
            <div className="panel-muted p-4">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-800">Customer</p>
              <p className="mt-2 text-lg font-semibold text-ink">{selectedCustomer?.full_name}</p>
              <p className="text-sm text-ink/65">{selectedCustomer?.email}</p>
              <p className="mt-2 text-sm text-ink/65">Order date: {formatDateTime(state.order_date)}</p>
            </div>
            <div className="overflow-hidden rounded-3xl border border-ink/10">
              <table className="min-w-full divide-y divide-ink/10 text-left">
                <thead className="bg-white/80 text-sm text-ink/55">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Product</th>
                    <th className="px-4 py-3 font-semibold">Qty</th>
                    <th className="px-4 py-3 font-semibold">Unit Price</th>
                    <th className="px-4 py-3 font-semibold">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="bg-white text-sm text-ink">
                  {summaryItems.map((item, index) => (
                    <tr key={`${item.product_id}-${index}`} className="border-t border-ink/5">
                      <td className="px-4 py-3">
                        <p className="font-semibold">{item.product?.name}</p>
                        <p className="text-xs text-ink/55">{item.product?.sku}</p>
                      </td>
                      <td className="px-4 py-3">{item.quantity}</td>
                      <td className="px-4 py-3">{formatCurrency(item.product?.price)}</td>
                      <td className="px-4 py-3 font-semibold">{formatCurrency(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end">
              <div className="rounded-2xl bg-ink px-5 py-4 text-white">
                <p className="text-sm text-white/70">Order total</p>
                <p className="text-2xl font-bold">{formatCurrency(totalAmount)}</p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="flex flex-col-reverse justify-between gap-3 border-t border-ink/10 pt-4 md:flex-row">
          <button className="btn-secondary" type="button" onClick={state.step === 1 ? onClose : goBack} disabled={submitting}>
            {state.step === 1 ? "Cancel" : "Back"}
          </button>
          <div className="flex justify-end gap-3">
            {state.step < 3 ? (
              <button className="btn-primary" type="button" onClick={goNext}>
                Continue
              </button>
            ) : (
              <button className="btn-primary" type="submit" disabled={submitting}>
                {submitting ? <LoadingSpinner /> : null}
                Submit order
              </button>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
}
