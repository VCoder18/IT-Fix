# IT-Fix 🛠️ — IT Support Ticket Portal

> **End-of-Module Project — Cloud Architecture & Vibe Programming**  
> Stack: Next.js · Supabase · Vercel

---

## Theme Mapping

IT-Fix is an internal IT support portal where company employees can report technical issues and track their repair tickets.

| Element | IT-Fix |
|---|---|
| **Table A — Users** | **Employees** — they register and log in using their @estin.dz email. Managed through Supabase Auth. |
| **Table B — Resources** | **Technicians** — the IT staff members available to handle issues. Employees can browse them when opening a ticket. |
| **Table C — Interactions** | **Tickets** — each ticket links an employee (A) to a technician (B), and includes a title, description, status (Open / In Progress / Closed), and creation date. |
| **File (Storage)** | **Bug screenshot** — an image the employee uploads when creating a ticket, stored in Supabase Storage. |

**User flow:** Log in with @estin.dz → Browse available technicians → Open a ticket with a screenshot → Track ticket status from the personal dashboard.

---

## Architecture Analysis

### Why Vercel + Supabase makes more financial sense than a physical server

Setting up a traditional server means buying the hardware upfront — the server itself, the rack, network equipment, a UPS for power backup, cooling systems, and so on. That's a **capital expense (CAPEX)**: a large one-time investment that locks you into a fixed capacity whether you use it or not.

With IT-Fix, there's none of that. Supabase hosts the database and file storage, Vercel hosts and deploys the frontend. Both platforms work on a pay-as-you-go model — you only pay for actual usage. That's an **operational expense (OPEX)**: no upfront cost, no wasted capacity, and no hardware to maintain. For a project at this stage, the OPEX model is simply the smarter choice.

---

### How Vercel handles scalability compared to a physical data center

A physical data center has hard limits. If traffic spikes, you either bought more hardware than you need most of the time, or you scramble to add capacity under pressure — installing new servers in racks, reconfiguring the network, making sure the cooling keeps up. It's slow and expensive.

This is where the **Serverless** model changes everything. Vercel runs the app as serverless functions: small isolated units that spin up on demand and disappear after the request is handled. If 50 employees submit tickets at the same time, 50 functions run in parallel automatically — no bottleneck, no manual intervention. There's no physical infrastructure to manage, no cooling bill, and no single point of failure tied to one rack in one room.

---

### Structured vs. Unstructured data in IT-Fix

**Structured data** is everything stored in Supabase PostgreSQL: employees, technicians, tickets_comments, and the tickets table with all its fields (title, description, status, creation date). It has a fixed schema, it's queryable with SQL, and it's protected by Row Level Security so each employee only sees their own tickets.

**Unstructured data** is the bug screenshots. These are image files — PNG or JPEG — that don't fit into a relational table. They're stored in Supabase Storage, which handles binary content separately. Each file gets a URL that's saved in the tickets table as a reference, keeping both types of data linked without mixing them.

---

## Deployment

- **Live app:** `https://it-fix.vercel.app` *(replace with your URL)*
- **GitHub repo:** `https://github.com/your-username/it-fix` *(replace with your link)*
