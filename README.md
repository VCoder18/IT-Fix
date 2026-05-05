# IT-Fix - IT Support Extranet 🎓

**Student Project — Architecture & Infrastructure Analysis**

## 1. Theme Mapping
To facilitate the correction and review of our database and storage setup, here is the mapping of the data model used for the IT-Fix application:

* **Table A (Employees):** `public.employees` - Employees can consult a technician by assignning him a ticket based on the issue's category.
* **Table B (Resources):** `public.technicians` - Technicians can be consulted and assigned to incoming IT tickets.
* **Table C (Interactions):** `public.tickets` - The main relational table linking employees and technicians, complete with creation dates, updates, and current status (*Closed*, *In Progress*, *Open*).
* **Storage (Files):** `ticket-images` - The storage bucket linked to tickets, which stores bug/issue screenshots.

## 2. Architecture Analysis

### A. Financial Analysis: OPEX vs. CAPEX
Using a serverless-oriented architecture (Vercel and Supabase) is financially more logical and appropriate for launching a student project compared to using a traditional physical server:
* **CAPEX (Capital Expenditures):** A conventional server requires significant upfront costs (purchasing hardware, network switches, backup equipment). With Supabase and Vercel, the initial hardware investment is **$0**, as the free startup tiers allow us to prototype quickly without acquisition costs.
* **OPEX (Operational Expenditures):** Unlike traditional hosting where you pay for a fixed capacity 24/7 (even during periods of low activity or at night), cloud solutions charge based on actual usage (*Serverless*). Costs scale linearly with traffic without incurring heavy maintenance or hardware costs.

### B. Scalability: Vercel vs. Physical Data Center
Vercel's approach to scalability differs radically from managing a physical data center:
* **Local and physical infrastructure:** In a physical data center, accommodating a traffic spike requires additional rack servers and anticipating technical constraints (power consumption, cooling, physical space).
* **Vercel Scalability (Edge & Serverless):** Vercel automatically deploys the frontend to a global Edge network. When there is an influx of users, the platform dynamically allocates computing resources without requiring hardware intervention, ensuring high availability and seamless fault tolerance.

### C. Structured and Unstructured Data
* **Structured Data:** The relational data stored in the PostgreSQL database tables (tables `profiles`, `technicians`, `tickets`, and `ticket_comments`), organized into rows and columns according to a strict, typed schema.
* **Unstructured Data:** The binary files and documents (screenshots, bug images, and PDF files) hosted in the Storage bucket. These data lack a fixed schema and are managed as objects identified by their URLs.
