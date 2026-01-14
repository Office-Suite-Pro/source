# Officore Pro Suite 2026

Officore is a high-performance, web-based productivity suite designed for modern workflows. It provides a seamless environment for document editing and data management with a focus on speed, security, and a minimalist user interface.

## 📂 Project Structure

The core architecture is organized within the `source` directory. You can access the most important files here:

* **[source/Components/](./source/Components):** Reusable UI elements, including the Activation Modals, Editor toolbars, and Document Cards.
* **[source/Pages/](./source/Pages):** The main application views, such as the Dashboard (Home), Settings, and the full-screen Editor interfaces.
* **[source/Entities/](./source/Entities):** Database schemas and JSON blueprints that define the structure of Documents, Spreadsheets, and User data.

## ✨ Key Features

* **📝 Document Editor:** A clean, distraction-free text processing environment.
* **📊 Spreadsheets:** Advanced data calculation and organization tools.
* **🔐 Secure Activation:** Built-in proprietary license verification system.
* **⚡ Lightweight Core:** Optimized for rapid deployment and low resource usage.

## 🛠 Technical Stack

* **Core Engine:** React.js / JavaScript (Web) & Blazor/MAUI (Desktop)
* **Styling:** Tailwind CSS / Modern CSS3 (Dark-mode optimized)
* **Data Management:** JSON-Schema based entities via base44 API
* **Security:** SHA-256 based cryptographic license validation

## 🚀 Installation

1.  Clone the repository (Access required).
2.  Navigate to the source directory.
3.  Run the build command:
    ```bash
    dotnet build -f net8.0-windows10.0.19041.0
    ```
4.  Launch the application:
    ```bash
    dotnet run -f net8.0-windows10.0.19041.0
    ```

---

## ⚖️ License

**Proprietary – All Rights Reserved**

Copyright © 2026 Officore.

This software and its source code are the exclusive property of Officore. Unauthorized copying, modification, or distribution of this project, via any medium, is strictly prohibited. 

Refer to the [LICENSE](LICENSE) file for the full legal terms.
