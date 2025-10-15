**Objective:**
Build a **multi-page API Key Manager** that lists all APIs in a main dashboard, and allows users to click a website (e.g., *OpenAI*, *Stripe*, *Google Cloud*) to view and manage *only* that website’s API keys.
Each website page supports **mass adding** of multiple APIs at once.

---

### **Main Dashboard Page**

This is the default page that displays the combined API key list.

#### **Features:**

* Table displaying:
  | ID | Service / Website | Email / Username | Password | API Key | Notes | Date Added | Last Updated |
* Each **Service / Website name** is clickable.

  * Clicking it opens the dedicated page for that website.
* Optional: Search/filter bar to quickly locate websites or API keys.
* Button: `+ Add API` (opens modal for quick single add).



### **Single Website Page**

When you click a website (e.g., *OpenAI*), the app opens a **dedicated filtered view** that only shows that website’s API data.

#### **Header Section**

* Large title: `OpenAI`
* Optional description (e.g., "AI model APIs for production and research")
* Buttons:

  * `+ Add APIs (Mass Add)` → Opens a modal or input section for multiple entries.
  * `Back to Dashboard`
  * `Export` (optional).



### **Mass Add Modal**

When the user clicks “+ Add APIs (Mass Add)”:

#### **Behavior:**

* Opens a modal or new section with a **multi-row form**.
* Each row has:

  * Email / Username
  * Password
  * API Key
  * Notes
* User can add/remove rows dynamically before saving.
* Clicking “Save All” adds all entries at once to that website’s dataset.


### **Data Behavior**

* The main table contains **all APIs** across websites.
* The single website page **filters** by `Service / Website` name.
* Adding new APIs from a website page updates both the filtered view *and* the main dashboard automatically.
* Store data locally (using localStorage or IndexedDB for MVP).
* Optionally add a backend (FastAPI or Express + SQLite/Postgres).

---

### **Tech Stack & Design**

* **Frontend:** React + TypeScript + Tailwind CSS
* **UI Style:** Dashboard-like (gradient headers, rounded cards, subtle shadows).
* **Table Components:** Responsive, minimal borders, sticky headers.
* **Modals:** Use shadcn/ui or Tailwind modals.
* **Icons:** Lucide-react for actions (eye, copy, edit, delete).
* **Data Filtering:** Client-side filtering by website name.
* **Mass Add:** Dynamic form with add/remove row capability.
* **Dark Mode:** Optional toggle.

---

### **Deliverables**

* `MainDashboardPage.tsx` – displays all websites and API keys.
* `WebsitePage.tsx` – filtered view for a single website.
* `AddMassModal.tsx` – modal for adding multiple APIs at once.
* Optional: lightweight backend with `/api/keys` routes for CRUD.
* `README.md` for setup, run, and architecture notes.

---

**Goal:**
Deliver an elegant, functional system that allows managing API keys grouped by website.
From the main dashboard, clicking a website opens its dedicated filtered page, where multiple APIs can be added, edited, or deleted in bulk.
