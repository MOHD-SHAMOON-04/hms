document.getElementById("database-run-btn").addEventListener("click", executeQuery);

async function executeQuery() {
    const query = document.getElementById("database-query-input").value.trim();
    const output = document.getElementById("database-output");
    output.innerHTML = "<p class='database-loading'>Running query...</p>";

    if (!query) {
        output.innerHTML = "<p class='database-error'>Please enter a query.</p>";
        return;
    }

    try {
        const res = await fetch("http://localhost:3000/api/query", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ query })
        });

        const data = await res.json();
        output.innerHTML = "";

        if (!Array.isArray(data) || data.length === 0) {
            output.innerHTML = "<p>No rows returned.</p>";
            return;
        }

        const columns = Object.keys(data[0]);
        const table = document.createElement("table");

        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");
        columns.forEach(col => {
            const th = document.createElement("th");
            th.textContent = col;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement("tbody");
        data.forEach(row => {
            const tr = document.createElement("tr");
            columns.forEach(col => {
                const td = document.createElement("td");
                td.textContent = row[col] !== undefined ? row[col] : "";
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);

        output.appendChild(table);
    } catch (err) {
        output.innerHTML = `<p class='database-error'>Error: ${err.message}</p>`;
    }
}



document.getElementById("refresh-schema-btn").addEventListener("click", loadTableSchemas);
async function loadTableSchemas() {
    const schemaContainer = document.getElementById("database-schema-list");
    schemaContainer.innerHTML = "<p class='database-loading'>Fetching schema...</p>";

    try {
        const res = await fetch("http://localhost:3000/api/schema");
        const schemas = await res.json();

        if (!Array.isArray(schemas)) {
            schemaContainer.innerHTML = "<p class='database-error'>Invalid schema format</p>";
            return;
        }

        schemaContainer.innerHTML = "";

        schemas.forEach(table => {
            const wrapper = document.createElement("div");
            wrapper.className = "database-table";

            const header = document.createElement("h4");
            header.textContent = table.table;
            header.addEventListener("click", () => {
                columnsDiv.style.display = columnsDiv.style.display === "none" ? "block" : "none";
            });

            const columnsDiv = document.createElement("div");
            columnsDiv.className = "database-columns";

            const tableEl = document.createElement("table");
            const thead = document.createElement("thead");
            thead.innerHTML = `<tr>
          <th>Name</th><th>Type</th><th>Not Null</th><th>Primary Key</th>
        </tr>`;
            tableEl.appendChild(thead);

            const tbody = document.createElement("tbody");
            table.columns.forEach(col => {
                const row = document.createElement("tr");
                row.innerHTML = `<td>${col.name}</td><td>${col.type}</td><td>${col.notnull ? 'Yes' : 'No'}</td><td>${col.pk ? 'Yes' : 'No'}</td>`;
                tbody.appendChild(row);
            });
            tableEl.appendChild(tbody);
            columnsDiv.appendChild(tableEl);

            wrapper.appendChild(header);
            wrapper.appendChild(columnsDiv);
            schemaContainer.appendChild(wrapper);
        });

    } catch (err) {
        schemaContainer.innerHTML = `<p class='database-error'>Failed to load schemas: ${err.message}</p>`;
    }
}
loadTableSchemas();