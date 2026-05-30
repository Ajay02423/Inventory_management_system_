import { ChevronDown } from "lucide-react";
import { useState } from "react";

const FAQ_ITEMS = [
  {
    category: "Products",
    questions: [
      {
        q: "How do I add a new product?",
        a: 'Go to the Products page and click the "Add Product" button in the top right. Fill in the product name, SKU, price, and quantity. SKU must be unique across all products. The image URL and description are optional. Click Save to create the product.',
      },
      {
        q: "What is a SKU and why must it be unique?",
        a: "SKU stands for Stock Keeping Unit - it's a unique code that identifies each distinct product. Uniqueness is enforced so that every product can be precisely tracked in inventory and orders without confusion. If you try to create two products with the same SKU, the system will return an error.",
      },
      {
        q: "How do I set a low stock alert threshold?",
        a: 'When adding or editing a product, there is a "Low Stock Alert Threshold" field (default: 10). If a product\'s current quantity falls below this number, it will appear in the Low Stock Alerts section on the Dashboard. Each product can have its own threshold.',
      },
      {
        q: "Can I delete a product that has been ordered?",
        a: "No. If a product has been referenced in any order, the system will prevent deletion and return a 409 Conflict error. You should instead set the product quantity to 0 to mark it as out of stock.",
      },
    ],
  },
  {
    category: "Orders",
    questions: [
      {
        q: "How do I create an order?",
        a: 'Go to the Orders page and click "New Order". First, select a customer from the dropdown. Then add one or more products with their quantities - the available stock is shown as a hint next to each product. Review the order summary and the auto-calculated total, then click Submit.',
      },
      {
        q: "What happens to inventory when an order is placed?",
        a: "The system automatically deducts the ordered quantity from each product's stock at the moment the order is created. This is done in a single database transaction to ensure consistency.",
      },
      {
        q: "Can I place an order if stock is insufficient?",
        a: "No. If any item in your order exceeds the available stock, the system will reject the entire order with a 422 error and tell you which product has insufficient stock. No stock is deducted in this case.",
      },
      {
        q: "What happens when I cancel or delete an order?",
        a: "When an order is deleted/cancelled, the system automatically restores the stock for every item in that order. For example, if the order had 5 units of Product A, those 5 units will be added back to Product A's inventory.",
      },
      {
        q: "How is the order total calculated?",
        a: "The backend calculates the total automatically as the sum of (unit price x quantity) for all items. The unit price is snapshotted at the time the order is placed, so future price changes to a product do not affect existing orders.",
      },
    ],
  },
  {
    category: "Customers",
    questions: [
      {
        q: "Can two customers share the same email address?",
        a: "No. Each customer must have a unique email address. If you try to create a customer with an email that already exists, the system will return a 409 Conflict error.",
      },
      {
        q: "What happens to orders if I delete a customer?",
        a: "Deleting a customer will also delete all of their associated orders (cascade delete). This action is irreversible, so proceed with caution.",
      },
      {
        q: "Where can I see a customer's full order history?",
        a: "Click on any customer row in the Customers table to open the Customer Detail panel on the right side. It shows total orders placed, total amount spent, and a list of their 5 most recent orders.",
      },
    ],
  },
  {
    category: "Dashboard",
    questions: [
      {
        q: 'What does the "Confirmed Orders" KPI show?',
        a: 'The Confirmed Orders tile shows only orders with the status "CONFIRMED". Pending and cancelled orders are excluded from this count, giving you a clear view of successfully processed orders.',
      },
      {
        q: "How does the Orders bar chart work?",
        a: 'The bar chart on the dashboard shows order volume over time. Use the toggle buttons to switch between "24 Hours" view (hourly breakdown) and "7 Days" view (daily breakdown). All order statuses are included in the chart count.',
      },
      {
        q: "What is the Low Stock Alert table?",
        a: 'Products whose current quantity is below their individual low stock threshold appear in this table. The "Stock Gap" column shows how many units are needed to reach the threshold. Click "Restock" to quickly open the product edit form.',
      },
    ],
  },
  {
    category: "Data & Export",
    questions: [
      {
        q: "How do I export table data?",
        a: "Every table (Products, Customers, Orders, Low Stock) has a Download button in the top-right area. Clicking it exports a CSV file of all rows currently matching your active filters - not just the current page. The file is named with the table name and today's date.",
      },
      {
        q: "Does sorting or filtering affect what gets exported?",
        a: "Yes. The CSV export always reflects your current filtered and sorted view. If you have filtered products by name or applied a status filter on orders, only the matching rows will be included in the export.",
      },
    ],
  },
  {
    category: "Account",
    questions: [
      {
        q: "How do I log out?",
        a: 'Click on your user avatar in the top-right corner of the screen. A dropdown will appear with a "Sign Out" option. Clicking it will log you out and return you to the login page.',
      },
      {
        q: "What are the available demo accounts?",
        a: "There are three demo accounts: Admin (username: admin, password: admin123), Store Manager (username: manager, password: manager123), and Staff Member (username: staff, password: staff123).",
      },
    ],
  },
];

export default function HelpPage() {
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (key) => {
    setOpenItems((current) => ({ ...current, [key]: !current[key] }));
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-2 md:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-ink">Help & FAQ</h1>
      </div>

      <div className="flex flex-col gap-6">
        {FAQ_ITEMS.map((section) => (
          <div key={section.category}>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-accent-500">
              {section.category}
            </h2>
            <div className="flex flex-col gap-2">
              {section.questions.map((item, index) => {
                const itemKey = `${section.category}-${index}`;
                const isOpen = Boolean(openItems[itemKey]);

                return (
                  <div key={itemKey} className="overflow-hidden rounded-3xl border border-ink/10 bg-white/75 shadow-sm">
                    <button
                      type="button"
                      onClick={() => toggleItem(itemKey)}
                      className="flex w-full items-center justify-between px-4 py-3.5 text-left transition-colors hover:bg-brand-50/50"
                    >
                      <span className="pr-4 text-sm font-medium leading-snug text-ink">{item.q}</span>
                      <ChevronDown
                        className={`h-4 w-4 flex-shrink-0 text-ink/45 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    {isOpen ? (
                      <div className="px-4 pb-4 pt-0">
                        <div className="mb-3 h-px bg-ink/10" />
                        <p className="text-sm leading-relaxed text-ink/70">{item.a}</p>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-3xl border border-accent-500/20 bg-accent-500/10 px-4 py-3.5 text-center text-sm text-ink/70">
        Still have questions? This system was built as part of a technical assessment for{" "}
        <span className="font-medium text-accent-600">Ethara AI</span>.
      </div>
    </div>
  );
}
