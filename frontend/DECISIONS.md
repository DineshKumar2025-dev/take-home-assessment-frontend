# Product & Engineering Decisions

## 1. What I Chose to Build

I built a sales analytics dashboard focused on helping managers understand lead performance, sales performance, and revenue across the funnel.

The dashboard includes:

- Overview of key sales metrics
- Branch-level performance
- Sales representative performance
- Lead aging analysis
- Lead funnel analysis
- What-If Simulator for exploring potential improvements in conversion rates

I chose this structure because the data is centered around leads, sales representatives, branches, and their progression through the sales funnel. The goal was to turn the raw data into information that could support practical business decisions rather than simply displaying database records.

---

## 2. Key Product Decisions

### Focus on the Sales Funnel

I organized the lead journey into the following stages:

`New → Contacted → Test Drive → Negotiation → Order → Delivered`

This provides a simple way to understand where leads are being lost and where improvements could have the greatest impact.

### Use Historical Status Data for Funnel Calculations

For funnel calculations, I used `lead_status_history` rather than only the current status stored on a lead.

A lead that is currently marked as `delivered` has previously passed through several stages. Looking only at the current status would lose that historical information.

Using the status history allows the dashboard to calculate how many leads actually reached each stage of the funnel.

### What-If Simulator

I added a What-If Simulator to allow users to experiment with improvements to stage-to-stage conversion rates.

For example, a user can test what could happen if the conversion from `Contacted → Test Drive` improved by several percentage points.

The simulator calculates the projected number of deliveries and the potential additional revenue without modifying the underlying database.

### Client-Side Simulation

The baseline funnel data is loaded from the backend once, while the What-If calculations are performed in the frontend.

This was a deliberate choice because slider interactions should feel immediate. Sending a new API request for every slider movement would add unnecessary network requests and latency.

The backend therefore provides the baseline data, while React handles the interactive simulation.

---

## 3. Key Engineering Decisions

### React for the Frontend

I used React to build the dashboard because the application contains multiple interactive views and requires dynamic updates when filters, sliders, or other controls change.

### FastAPI for the Backend

FastAPI was used to provide lightweight REST endpoints for the dashboard and to separate data access and business logic from the frontend.

### PostgreSQL for Data Storage

PostgreSQL was used as the primary database because the application involves relational data such as leads, branches, sales representatives, and lead status history.

### Reusable UI Patterns

I kept common dashboard patterns consistent across the application, including metric cards, tables, filters, status indicators, and responsive layouts.

This makes the different sections of the dashboard feel like parts of the same product rather than separate pages.

---

## 4. Tradeoffs

### Simplicity vs. Advanced Forecasting

The What-If Simulator currently uses a relatively simple conversion-based model.

The projected funnel is calculated by applying the adjusted conversion rate at each stage and propagating the result through the remaining stages.

This makes the model easy to understand and explain, but it does not account for factors such as seasonality, lead quality, branch differences, or historical trends.

I chose the simpler model for this assessment because it provides an understandable and interactive result without introducing assumptions that the available data may not support.

### Percentage-Point Improvements

The simulator treats slider values as percentage-point improvements.

For example:

`70% + 10 points = 80%`

rather than treating the value as a relative 10% increase.

This makes the behavior easier for a business user to understand when interacting with the simulator.

### Current Status vs. Status History

Using status history provides a more accurate funnel view, but it also makes the calculation more dependent on the completeness and consistency of historical status records.

If status history is incomplete, funnel conversion rates may not accurately represent the real customer journey.

---

## 5. What I Would Build Next

With more time, I would focus on the following improvements:

### More Advanced What-If Modeling

I would extend the simulator to support:

- Branch-specific conversion rates
- Sales-representative-specific conversion rates
- Historical conversion trends
- Date-range based simulations
- Confidence ranges around projections
- More realistic forecasting based on historical performance

### Better Filtering

I would add global filters for:

- Date range
- Branch
- Sales representative
- Lead source
- Lead status

These filters could then drive all dashboard metrics consistently.

### Authentication and Authorization

I would add authentication and role-based access so that different users could have different levels of access to sales and branch information.

### Data Quality Monitoring

I would add validation and anomaly detection for issues such as:

- Missing status history
- Invalid stage transitions
- Duplicate leads
- Unexpected conversion rates
- Missing deal values

### Automated Tests

I would add unit and integration tests for the most important business logic, particularly funnel calculations, revenue calculations, and API endpoints.

---

## 6. Interesting Data Patterns / Anomalies

During development, I used the lead status history to examine how leads progressed through the funnel.

One of the main patterns I looked for was the conversion rate between each stage:

`New → Contacted → Test Drive → Negotiation → Order → Delivered`

The most significant drop-off between stages can indicate a potential area where improving the conversion rate could have a larger downstream impact.

The What-If Simulator was designed around this idea: improving an early-stage conversion can compound through the remaining funnel and potentially result in more delivered orders.

Any unusually high or low conversion rates should also be treated as potential data anomalies and investigated against the underlying status history before being interpreted as a genuine business trend.

---

## 7. Summary

The main goal of the implementation was to create a dashboard that is useful for decision-making rather than simply displaying raw data.

I prioritized:

- Clear funnel visibility
- Actionable sales metrics
- Interactive What-If analysis
- Simple and explainable calculations
- Responsive UI
- Separation between frontend presentation and backend data access

Given more time, I would focus on deeper forecasting, richer filtering, authentication, automated testing, and data-quality monitoring.