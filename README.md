IT-Fix - IT Support Extranet
1. Theme Mapping
Table A (Users): profiles – Managed via Supabase Auth (Company employees).

Table B (Resources): technicians – The support technicians who can be consulted and assigned to tickets.

Table C (Interactions): tickets – The junction table linking employees and technicians with a date and a status (Pending, In Progress, Resolved).

Storage (Files): ticket-attachments – The storage bucket linked to the ticket, holding bug screenshots or supporting documents (images or PDFs).

2. Architecture Analysis
A. Financial Analysis: OPEX vs. CAPEX
Using a serverless-oriented architecture (Vercel and Supabase) is financially much more logical and appropriate for launching this project compared to a traditional physical server:

CAPEX (Capital Expenditures): A conventional server requires significant upfront costs (purchasing hardware, network switches, backup equipment). With Supabase and Vercel, the initial hardware investment is $0, as the free startup tiers allow you to prototype quickly without acquisition costs.

OPEX (Operational Expenditures): Unlike traditional hosting where you pay for fixed capacity (even during periods of low activity), cloud solutions charge based on actual usage (Serverless). Costs scale linearly with traffic without incurring human or hardware maintenance costs.

B. Scalability: Vercel vs. Physical Data Center
Vercel's approach to scalability differs radically from a physical data center:

Local and physical infrastructure: In a physical data center, accommodating a traffic spike requires additional rack servers and anticipating technical constraints (power consumption, cooling, physical space).

Vercel Scalability (Edge & Serverless): Vercel automatically deploys the frontend to a global Edge network. When there is an influx of users, the platform dynamically allocates computing resources without requiring hardware intervention, ensuring high availability and seamless fault tolerance.

C. Structured and Unstructured Data
Structured Data: The relational data stored in the PostgreSQL database tables (tables profiles, technicians, tickets, and ticket_comments), organized into rows and columns according to a strict, typed schema.

Unstructured Data: The binary files and documents (screenshots, bug images, and PDF files) hosted in the Storage bucket. These data lack a fixed schema and are managed as objects identified by their URLs.