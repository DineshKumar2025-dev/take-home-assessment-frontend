# Product & Engineering Decisions

## 1. What I Chose to Build

I built a **Sales Analytics Dashboard** focused on helping business owners understand lead performance, sales performance, branch performance, and revenue across the business.

The dashboard includes:

* Overview of key sales metrics
* Branch-level performance
* Sales representative performance
* Lead aging analysis
* Leaderboard to identify top performers
* Sales forecasting across different branches
* Deliveries and delays dashboard
* What-If Simulator for exploring potential improvements in conversion rates

I chose this structure because the core data revolves around leads, sales representatives, branches, and their progression through the sales funnel. The goal was to transform raw data into actionable information that can support practical business decisions rather than simply displaying database records.

---

## 2. Key Product Decisions

### Focus on the Sales Funnel

I organized the lead journey into the following stages:

`New → Contacted → Test Drive → Negotiation → Order → Delivered`

This provides a simple and intuitive way to understand where leads are being lost and where improvements could have the greatest business impact.

By analyzing conversion rates between stages, managers can identify bottlenecks in the sales process and prioritize areas that may benefit from improvement.

### What-If Simulator

I added a **What-If Simulator** to allow users to experiment with improvements to stage-to-stage conversion rates.

For example, a user can test what could happen if the conversion rate from `Contacted → Test Drive` improves by several percentage points.

The simulator calculates the projected number of deliveries and potential additional revenue without modifying the underlying database.

This makes the feature useful for scenario planning while keeping the actual production data unchanged.

---

## 3. Key Engineering Decisions

### React for the Frontend

I used **React** to build the dashboard because the application contains multiple interactive views and requires dynamic updates when filters, sliders, and other controls change.

React also allowed me to create reusable components and maintain a consistent UI across different sections of the application.

### FastAPI for the Backend

I used **FastAPI** to provide lightweight REST APIs and to separate data access and business logic from the frontend.

This separation keeps the frontend focused on presentation and user interaction while the backend handles data retrieval, processing, and business rules.

### PostgreSQL for Data Storage

I used **PostgreSQL** as the primary database because the application contains relational data involving leads, branches, sales representatives, deals, and lead status history.

PostgreSQL is well suited for this type of structured relational data and supports the queries required for funnel analysis and aggregation.

### Reusable UI Patterns

I kept common dashboard patterns consistent across the application, including:


* Tables
* Filters
* File Exports
* Status indicators
* Responsive layouts

This makes the different sections feel like parts of the same product rather than independent pages.

---

## 4. Tradeoffs

### Simplicity vs. Advanced Forecasting

The What-If Simulator currently uses a relatively simple conversion-based model.

The projected funnel is calculated by applying the adjusted conversion rate at each stage and propagating the resulting volume through the remaining stages.

This makes the model easy to understand and explain, but it does not currently account for factors such as:

* Seasonality
* Lead quality
* Branch-specific performance
* Sales representative performance
* Historical trends

I chose the simpler model for this assessment because it provides an understandable and interactive result without introducing assumptions that the available data may not reliably support.

### Percentage-Point Improvements

The simulator treats slider adjustments as **percentage-point improvements** rather than relative percentage increases.

For example:

`70% + 10 percentage points = 80%`

This approach makes the simulator's behavior easier for business users to understand and avoids ambiguity when adjusting conversion rates.

### Current Status vs. Status History

Using status history provides a more accurate representation of the customer journey because it captures how leads progressed through the funnel.

However, this approach also makes the calculation dependent on the completeness and consistency of historical status records.

If status history is incomplete or contains inconsistent transitions, the calculated funnel conversion rates may not accurately represent the actual customer journey.

---

## 5. What I Would Build Next

With more time, I would focus on the following improvements.

### More Advanced What-If Modeling

I would extend the simulator to support:

* Branch-specific conversion rates
* Sales-representative-specific conversion rates
* Historical conversion trends
* Date-range-based simulations
* Confidence ranges around projections
* Forecasting based on historical performance

This would make the simulator more realistic and useful for business planning.

### Better Filtering

I would add global filters for:

* Date range
* Branch
* Sales representative
* Lead source
* Lead status

These filters could drive all dashboard metrics consistently, allowing users to analyze the business from different perspectives.

### Authentication and Authorization

I would add authentication and role-based access control so that different users can have appropriate access to sales and branch information.

For example, a branch manager could access their own branch's data, while a regional manager could access data across multiple branches.

### Data Quality Monitoring

I would add validation and anomaly detection for issues such as:

* Missing status history
* Invalid stage transitions
* Duplicate leads
* Unexpected conversion rates
* Missing deal values
* Inconsistent or incomplete records

This would improve confidence in the analytics presented by the dashboard.

### AI-Based Business Insights

I would add an **AI/LLM-powered insights layer** to help users understand the data in a more natural way.

For example, the system could identify significant changes in conversion rates, highlight underperforming branches, explain potential bottlenecks in the funnel, and summarize important business trends.

The goal would not simply be to add an AI chatbot, but to use the LLM as an additional layer for turning dashboard data into understandable business insights.

### Automated Testing

I would add unit and integration tests for the most important business logic, particularly:

* Funnel calculations
* Conversion-rate calculations
* Revenue calculations
* What-If Simulator logic
* API endpoints
* Data validation

This would help prevent regressions as the application grows.

---

## 6. Interesting Data Patterns and Anomalies

During development, I used the lead status history to examine how leads progressed through the funnel.

One of the main patterns I analyzed was the conversion rate between each stage:

`New → Contacted → Test Drive → Negotiation → Order → Delivered`

The largest drop-off between stages can indicate a potential bottleneck in the sales process.

The What-If Simulator was designed around this concept. Improving an early-stage conversion rate can have a compounding effect because the additional leads that progress through that stage can continue through the remaining stages of the funnel.

For example, improving an early conversion rate may result in more leads reaching the later stages, which can ultimately increase the number of projected deliveries.

However, unusually high or low conversion rates should also be treated as potential data anomalies. Before interpreting them as genuine business trends, they should be validated against the underlying status history and data quality.

---

## 7. Summary

The main goal of the implementation was to create a dashboard that supports **business decision-making rather than simply displaying raw data**.

I prioritized:

* Clear sales-funnel visibility
* Actionable sales metrics
* Interactive What-If analysis
* Simple and explainable calculations
* Reusable UI components
* Responsive design
* Separation of frontend presentation from backend data access
* A scalable structure for future enhancements

Given more time, I would focus on deeper forecasting capabilities, richer filtering, authentication and authorization, automated testing, data-quality monitoring, and AI-powered business insights.

Overall, I aimed to build a product that not only shows **what is happening in the sales pipeline**, but also helps managers understand **where improvements could have the greatest impact**.
