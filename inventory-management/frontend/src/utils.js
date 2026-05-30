export function formatCurrency(amount) {
  if (amount === null || amount === undefined || Number.isNaN(Number(amount))) {
    return "₹0.00";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(amount));
}

export function formatDate(value) {
  if (!value) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function formatDateTime(value) {
  if (!value) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

export function formatDateInputValue(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDateTimeInputValue(value = new Date()) {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function isValidNumericInput(value, { min, integer = false } = {}) {
  if (value === "") {
    return false;
  }

  const normalized = String(value).trim();
  if (!/^[-+]?\d*\.?\d+$/.test(normalized)) {
    return false;
  }

  const parsed = Number(normalized);
  if (Number.isNaN(parsed)) {
    return false;
  }

  if (integer && !Number.isInteger(parsed)) {
    return false;
  }

  if (typeof min === "number" && parsed < min) {
    return false;
  }

  return true;
}

export function getNumericHelperText(value, options) {
  if (value === "") {
    return "";
  }

  return isValidNumericInput(value, options) ? "" : "Please enter a valid number";
}

export function shortId(value) {
  if (!value) {
    return "N/A";
  }

  return value.slice(0, 8).toUpperCase();
}

export function downloadCSV(data, filename) {
  if (!data.length) {
    return;
  }

  const headers = Object.keys(data[0]);
  const rows = data.map((row) =>
    headers.map((header) => `"${(row[header] ?? "").toString().replace(/"/g, '""')}"`).join(",")
  );
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function buildExportFilename(prefix) {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${prefix}_export_${year}-${month}-${day}.csv`;
}
